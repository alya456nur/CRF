const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Example Cloud Function to delete a user
exports.deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to delete a user.",
    );
  }

  const uid = data.uid;

  try {
    await admin.auth().deleteUser(uid);
    return {
      message: "User deleted successfully.",
    };
  } catch (error) {
    throw new functions.https.HttpsError(
        "internal",
        "Failed to delete user.",
        error,
    );
  }
});
