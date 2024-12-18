const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");


admin.initializeApp();

// Delete a user
exports.deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to delete a user.",
    );
  }

  const uid = data.uid;
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
exports.createStaffAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can create staff accounts.",
    );
  }

  const {email, password, Fname, Lname, dept, contact} = data;

  if (!email || !password || !Fname || !Lname || !dept || !contact) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "All fields (email, password, Fname, Lname, dept, " +
          "contact) are required.",
    );
  }

  try {
    const userRecord = await admin.auth().createUser({email, password});
    await admin.firestore().collection("STAFF").doc(userRecord.uid).set({
      Fname,
      Lname,
      staffDept: dept,
      staffContacts: contact,
      staffEmail: email,
      isAdmin: false,
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
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Debugging: Print out the context and data
  console.log("Context:", context);
  console.log("Data:", data);

  if (!context.auth) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Authentication required.",
    );
  }

  console.log("Authenticated user UID:", context.auth.uid);

  // Check if the authenticated user has the admin custom claim
  if (!context.auth.token.admin) {
    console.log("User does not have admin privileges.");
    throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can assign admin roles.",
    );
  }

  console.log("Authenticated user has admin privileges.");

  // Get the userId from the data object sent by the client
  const userId = data.userId;
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
