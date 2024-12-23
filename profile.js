function closeProfile() {
    const modal = document.getElementById('updateProfile');

    if (modal) {
        modal.style.display = 'none';
        location.reload();
    }
}

function closeEmail() {
    const modal = document.getElementById('emailReset');

    if (modal) {
        modal.style.display = 'none';
        document.getElementById('change-email-password-container').classList.add('hidden');
        document.getElementById('changeEmailSection').style.display = 'none';
        // Re-enable or show the edit profile form again
        document.querySelector('.edit-profile-container').style.display = 'block';
    }
}

// Function to show the custom alert
function showAlert(message) {
    const customAlert = document.getElementById('cusAlert');
    const alertMessage = document.getElementById('Message');
    alertMessage.innerHTML = message;
    customAlert.classList.remove('hidden');
}


function closeAlert() {
    const customAlert = document.getElementById('cusAlert');
    customAlert.classList.add('hidden');
}


function closePass() {
    const modal = document.getElementById('passReset');

    if (modal) {
        modal.style.display = 'none';
        document.getElementById('change-email-password-container').classList.add('hidden');
        document.getElementById('changePasswordSection').style.display = 'none';
        // Re-enable or show the edit profile form again
        document.querySelector('.edit-profile-container').style.display = 'block';
    }
}


// Function to enable editing and toggle button visibility
function enableEdit() {
    document.getElementById('Fname').disabled = false;
    document.getElementById('Lname').disabled = false;
    document.getElementById('phone').disabled = false;
    document.getElementById('editButton').style.display = 'none';
    document.getElementById('saveCancelButtons').style.display = 'flex';
    document.getElementById('uploadPhotoContainer').style.display = 'block';

    // Hide "Change Email" and "Change Password" buttons
    document.getElementById('editEmail').style.display = 'none';
    document.getElementById('editPass').style.display = 'none';
}

// Function to cancel editing and revert to initial button state
function cancelEdit() {
    disableInputs();
    document.getElementById('editButton').style.display = 'block';
    document.getElementById('saveCancelButtons').style.display = 'none';

    // Show "Change Email" and "Change Password" buttons
    document.getElementById('editEmail').style.display = 'block';
    document.getElementById('editPass').style.display = 'block';

    loadProfileData();
}

// Function to disable input fields
function disableInputs() {
    document.getElementById('Fname').disabled = true;
    document.getElementById('Lname').disabled = true;
    document.getElementById('phone').disabled = true;
    document.getElementById('uploadPhotoContainer').style.display = 'none';
}


function showEmailChange() {
    // Hide or disable the edit profile form
    document.querySelector('.edit-profile-container').style.display = 'none';
    // Show the container and the email section, hide the password section
    document.querySelector(".change-email-password-container").classList.remove("hidden");
    document.getElementById("changeEmailSection").style.display = "block";
    document.getElementById("changePasswordSection").style.display = "none";

    document.getElementById('changeEmailForm').addEventListener('submit', submitEmailChange);
}

function showPasswordChange() {
    // Hide or disable the edit profile form
    document.querySelector('.edit-profile-container').style.display = 'none';
    // Show the container and the password section, hide the email section
    document.querySelector(".change-email-password-container").classList.remove("hidden");
    document.getElementById("changeEmailSection").style.display = "none";
    document.getElementById("changePasswordSection").style.display = "block";

    document.getElementById('changePasswordForm').addEventListener('submit', submitPasswordChange);
}

function cancelEmailChange() {
    const form = document.getElementById('changeEmailForm');
    form.reset();

    // Hide the container when canceling email change
    document.querySelector(".change-email-password-container").classList.add("hidden");
    document.getElementById("changeEmailSection").style.display = "none";
    document.querySelector('.edit-profile-container').style.display = 'block';
}

function cancelPasswordChange() {
    const form = document.getElementById('changePasswordForm');
    form.reset();
    // Hide the container when canceling password change
    document.querySelector(".change-email-password-container").classList.add("hidden");
    document.getElementById("changePasswordSection").style.display = "none";
    document.querySelector('.edit-profile-container').style.display = 'block';
}