import { app, db, auth, storage, doc, getDoc, updateDoc, EmailAuthProvider,reauthenticateWithCredential, 
updateEmail, updatePassword , onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification, ref, getDownloadURL, uploadBytes } from "./firebase-config.js";

async function loadProfileData() {
    const user = auth.currentUser;

    if (user) {
        const uid = user.uid;
        const userDocRef = doc(db, "STAFF", uid);

        try {
            // Load profile data from Firestore
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                document.getElementById('dept').value = userData.staffDept || "";
                document.getElementById('Fname').value = userData.Fname || "";
                document.getElementById('Lname').value = userData.Lname || "";
                document.getElementById('email').value = user.email || ""; // Retrieve email from user's account
                document.getElementById('phone').value = userData.staffContacts || "";
            }

            // Check for profile picture in Firebase Storage
            const profilePicRef = ref(storage, `Staff/${uid}/pics`);
            const avatarImg = document.querySelector(".avatar-icon2");

            // Try to get the picture URL
            try {
                const profilePicUrl = await getDownloadURL(profilePicRef);
                avatarImg.innerHTML = `<img src="${profilePicUrl}" alt="Profile Picture" class="profile-pic">`;
            } catch (error) {
                console.error("Profile picture not found, using default icon:", error);
                avatarImg.innerHTML = `<i class="bi bi-person-circle"></i>`; // fallback to person icon
            }
        } catch (error) {
            console.error("Error fetching document:", error);
        }
    } else {
        console.error("User not authenticated");
    }
}



// Function to save changes to Firestore, including profile picture
async function saveChanges() {
    showCustomAlert('Updating profile, please wait...', () => { });
    const user = auth.currentUser;

    if (user) {
        const uid = user.uid;
        const userDocRef = doc(db, "STAFF", uid);

        // Collect updated data from the form inputs
        const updatedData = {
            Fname: document.getElementById('Fname').value,
            Lname: document.getElementById('Lname').value,
            staffContacts: document.getElementById('phone').value
        };

        // Check if there is a profile picture uploaded
        const profilePicInput = document.getElementById('uploadPhoto');
        const profilePicFile = profilePicInput.files[0];

        if (profilePicFile) {
            // Create a reference to the profile picture path in Firebase Storage
            const profilePicRef = ref(storage, `Staff/${uid}/pics`);

            try {
                // Upload the profile picture to Firebase Storage
                await uploadBytes(profilePicRef, profilePicFile);

                // Get the URL of the uploaded image
                const profilePicUrl = await getDownloadURL(profilePicRef);
                updatedData.staffPic = profilePicUrl; // Add the profile pic URL to the updated data
                
                // Update avatar icon with the new profile picture
                const avatarImg = document.querySelector(".avatar-icon2");
                avatarImg.innerHTML = `<img src="${profilePicUrl}" alt="Profile Picture" class="profile-pic">`;
            } catch (error) {
                console.error("Error uploading profile picture:", error);
            }
        }

        try {
            // If the user document doesn't exist, create it with the updated data
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                // If document doesn't exist, create it
                await setDoc(userDocRef, updatedData);
            } else {
                // If document exists, update it
                await updateDoc(userDocRef, updatedData);
            }
            
            // Disable inputs and hide the save/cancel buttons
            disableInputs();
            document.getElementById('editButton').style.display = 'block';
            document.getElementById('saveCancelButtons').style.display = 'none';

        } catch (error) {
            console.error("Error updating profile:", error);
        }
    } else {
        console.error("User not authenticated");
    }
    hideCustomAlert();
    showModal('updateProfile');
}

// Function to handle email update
async function submitEmailChange() {
    showCustomAlert('Updating email, please wait...', () => { });
    const user = auth.currentUser;
    const newEmail = document.getElementById("newEmail").value;
    const password = document.getElementById("password").value;

    // Check if user is logged in
    if (!user) {
        console.error("No user is signed in.");
        return;
    }

    try {
        // Create a credential for reauthentication
        const credential = EmailAuthProvider.credential(user.email, password);

        // Reauthenticate the user
        await reauthenticateWithCredential(user, credential);

        // After reauthentication, update the email
        await updateEmail(user, newEmail);
        
        // Send a verification email
        await sendEmailVerification(user);

        hideCustomAlert();

        console.log("Email updated successfully. Please verify your new email.");
        showAlert("Email updated successfully. Please login with your new email.");

    } catch (error) {
        hideCustomAlert();
        console.error("Error updating email:", error);
        showAlert("Failed to update email. Please try again.");
    }
}


// Function to submit the password change
async function submitPasswordChange() {
    showCustomAlert('Updating password, please wait...', () => { });

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    // Check if any password field is empty
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showAlert('Please fill in all password fields.');
        hideCustomAlert();
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showAlert('New passwords do not match!');
        hideCustomAlert();
        return;
    }

    const user = auth.currentUser;

    if (!user) {
        showAlert("User not authenticated.");
        hideCustomAlert();
        return;
    }

    showCustomAlert('Re-authenticating, please wait...', () => { });

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        // Reauthenticate using the credential
        await reauthenticateWithCredential(user, credential);

        // Update the password
        await updatePassword(user, newPassword);

        hideCustomAlert();
        showAlert('Password has been successfully reset!');

    } catch (error) {
        console.error("Error updating password:", error.message);

        if (error.code === 'auth/wrong-password') {
            hideCustomAlert();
            showAlert('The current password you entered is incorrect.');
        } else if (error.code === 'auth/weak-password') {
            hideCustomAlert();
            showAlert('The new password is too weak. Please choose a stronger password.');
        } else if (error.code === 'auth/requires-recent-login') {
            hideCustomAlert();
            showAlert('Please log in again to change your password. Your session has expired.');
        } else {
            hideCustomAlert();
            showAlert("Error updating password: " + error.message);
        }
    }
}



export{loadProfileData, saveChanges, submitEmailChange, submitPasswordChange};