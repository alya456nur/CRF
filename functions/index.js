const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");


admin.initializeApp();

// Delete a user
exports.deleteUser = functions.https.onCall(async (data) => {
  console.log("User ID to be deleted:", data);
  if (!data.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to delete a user.",
    );
  }

  const uid = data.data.staffId;
  if (!uid) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "User ID must be provided.",
    );
  }

  try {
    await admin.auth().deleteUser(uid);
    console.log(`User ${uid} deleted successfully`);
    return {message: "User deleted successfully."};
  } catch (error) {
    console.error(`Failed to delete user ${uid}:`, error);
    throw new functions.https.HttpsError(
        "internal",
        `Failed to delete user: ${error.message}`,
    );
  }
});

// Create a staff account
exports.createStaffAccount = functions.https.onCall(async (data) => {
  if (!data.auth || !data.auth.token.admin) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can create staff accounts.",
    );
  }


  const {email, password, FName, LName, dept, contact} = data.data;

  const missingFields = [];
  if (!email) missingFields.push("email");
  if (!password) missingFields.push("password");
  if (!FName) missingFields.push("Fname");
  if (!LName) missingFields.push("Lname");
  if (!dept) missingFields.push("dept");
  if (!contact) missingFields.push("contact");

  // If any fields are missing, throw an error with specific information
  if (missingFields.length > 0) {
    console.log("Missing fields:", missingFields); // Log the missing fields
    throw new functions.https.HttpsError(
        "invalid-argument",
        `The following fields are required: ${missingFields.join(", ")}.`,
    );
  }

  try {
    const userRecord = await admin.auth().createUser({email, password});

    await admin.firestore().collection("STAFF").doc(userRecord.uid).set({
      Fname: FName,
      Lname: LName,
      staffDept: dept,
      staffContacts: contact,
      staffEmail: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Staff account created: ${userRecord.uid}`);
    return {success: true, uid: userRecord.uid};
  } catch (error) {
    console.error("Error creating staff account:", error);
    throw new functions.https.HttpsError(
        "internal",
        `Failed to create staff account: ${error.message}`,
    );
  }
});


// Set an admin role
exports.setAdminRole = functions.https.onCall(async (data) => {
  console.log("User ID data:", data);
  if (!data.auth) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Authentication required.",
    );
  }

  console.log("Authenticated user UID:", data.auth.uid);

  // Get the userId from the data object sent by the client
  const userId = data.auth.uid;
  if (!userId) {
    console.log("No user ID provided.");
    throw new functions.https.HttpsError(
        "invalid-argument",
        "User ID must be provided.",
    );
  }

  console.log("User ID to assign admin role:", userId);

  try {
    // Set the admin role (custom claims)
    await admin.auth().setCustomUserClaims(userId, {admin: true});
    console.log(`User ${userId} is now an admin`);
    return {success: true};
  } catch (error) {
    console.error("Error setting admin role:", error);
    throw new functions.https.HttpsError(
        "internal",
        `Error setting admin role: ${error.message}`,
    );
  }
});
