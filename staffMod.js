import { app,auth, db, functions,httpsCallable, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, onSnapshot,fetchSignInMethodsForEmail, serverTimestamp } from "./firebase-config.js";

// Save staff data in an array
async function fetchStaff() {
    showCustomAlert('Fetching staffs, please wait...', () => { });
    if (unsubscribe) unsubscribe();
    const staffTableBody = document.querySelector('#staffTable tbody');
    staffTableBody.innerHTML = '';  // Clear the table before populating

    try {
        // Set up a real-time listener for the STAFF collection
        const staffCollectionRef = collection(db, 'STAFF');

        // Unsubscribe from any previous listener if needed
        const unsubscribe = onSnapshot(staffCollectionRef, (querySnapshot) => {
            staffTableBody.innerHTML = '';  // Clear table body on each update
            staffs = [];  // Reset staffs array on each update

            // Populate the staffs array with the latest data
            querySnapshot.forEach((doc) => {
                const staffData = doc.data();
                
                // Skip staff whose staffDept is "Admin"
                if (staffData.staffDept !== "Admin") {
                    staffs.push({
                        id: doc.id,  // Store the Firestore document ID
                        Fname: staffData.Fname || '',
                        Lname: staffData.Lname || '',
                        name: `${staffData.Fname} ${staffData.Lname}` || '',
                        dept: staffData.staffDept || 'Unknown',
                        email: staffData.staffEmail || '',
                        phone: staffData.staffContacts || ''
                    });
                }
            });

            // Sort staffs by name in ascending order
            staffs.sort((a, b) => a.name.localeCompare(b.name));

            // Update the table display in real-time
            filterStaff();  // Display filtered table (initially displays all staffs)
        });

        // Optionally return unsubscribe function to clean up later
        return unsubscribe;

    } catch (error) {
        console.error("Error fetching staffs:", error);
    }
}

// Handle staff registration
// Handle staff registration
async function handleStaffRegister(event) {
    event.preventDefault();
    showCustomAlert('Registering staff, please wait...', () => { });

    const dept = document.getElementById('dept').value;
    const LName = document.getElementById('LName').value || " ";
    const FName = document.getElementById('FName').value;
    const contact = document.getElementById('contact').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('Password').value;
    const confirmPassword = document.getElementById('ConfirmPassword').value;

    // Password validation
    if (password !== confirmPassword) {
        hideCustomAlert();
        AlertMe('Passwords do not match. Please try again.');
        return;
    }

    // Validate password rules
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
        hideCustomAlert();
        AlertMe(`Password must meet the following criteria:\n\n<i class=\"fa-solid fa-circle-info\"></i> ${passwordErrors.join('\n<i class=\"fa-solid fa-circle-info\"></i> ')}`);
        return;
    }

    try {
        // Check if email is already in use
        const userExists = await checkIfEmailExists(email);

        if (userExists) {
            hideCustomAlert();
            AlertMe('The email is already in use. Please try a different email.');
            return;
        }

        const createStaffAccount = httpsCallable(functions, 'createStaffAccount');

        // Call the cloud function
        const result = await createStaffAccount({
            email: email,
            password: password,
            FName: FName,
            LName: LName,
            dept: dept,
            contact: contact,
            auth: { token: { admin: true } },
        });

        if (result.data.success) {
            const timestamp = new Date().toLocaleString(); // Get current time
            addNotification(`${Fname} ${Lname} registered a staff at ${timestamp}`);
            AlertMe(`Staff registered successfully!`);
            hideCustomAlert();

            cancelStaff();
        }
    } catch (error) {
        console.error("Error registering staff:", error.message);
        hideCustomAlert();
        AlertMe('Failed to register staff. Please try again.');
    }
}

// Helper function to check if email exists using Firebase Auth
async function checkIfEmailExists(email) {
    try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        return signInMethods.length > 0;
    } catch (error) {
        console.error('Error checking email existence:', error);
        throw error;
    }
}



// Utility function to sign in with UID (for re-authentication)
async function signInWithUid(auth, uid) {
    const userRef = doc(db, "users", uid); // Reference the admin user document
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const email = userData.email;
        const password = userData.password; // You would need to handle password storage securely
        await signInWithEmailAndPassword(auth, email, password); // Re-authenticate using email and password
    }
}



async function handleEditStaff(staffData){
	showCustomAlert("Updating staff's information, please wait...", () => {});
	const staffID = staffData.id;

	const dept = document.getElementById('dept2').value;
	// Check if dept is valid
    const deptSelect = document.getElementById('dept2');
    if (!Array.from(deptSelect.options).some(option => option.value === dept)) {
        console.error('Invalid department value:', dept);
        hideCustomAlert();
        return;
    }

    try {
        // Update the company data in Firestore using the document ID
        const staffDocRef = doc(db, 'STAFF', staffID);
        await updateDoc(staffDocRef, {
            staffDept: dept,
        });

        showModal('editStaff'); // Show success modal
        hideCustomAlert();
    } catch (error) {
        console.error(`Error updating staff with ID ${staffID}:`, error);
        hideCustomAlert();
    }

    cancelUpStaff();
}

async function deleteStaff(staffId) {
    showCustomAlert("Deleting staff's account, please wait...", () => {}); // Show loading message
    
    try {
        // 1. First, delete the Firestore document for the staff
        const staffDocRef = doc(db, 'STAFF', staffId); // Firestore reference to the contact
        await deleteDoc(staffDocRef); // Delete the contact document from Firestore

        // 2. Then, call the deleteUser function to delete the user account on Firebase Auth
        const deleteUserFunction = httpsCallable(functions, 'deleteUser');
        
        // Pass the staffId (or the UID) to delete the user account on Firebase Auth
        const result = await deleteUserFunction({staffId: staffId });

        if (result.data && result.data.message === 'User deleted successfully.') {

            const timestamp = new Date().toLocaleString(); // Get current time
            addNotification(`${Fname} ${Lname} deleted a staff at ${timestamp}`);
            showModal('deleteStaff2'); // Show success modal
            hideCustomAlert(); // Hide the loading alert
        } else {
            throw new Error('Failed to delete the user from Firebase Auth.');
        }
    } catch (error) {
        AlertMe("Error deleting staff:", error.message); // Log error for debugging
        hideCustomAlert(); // Hide loading in case of error
    }
}

export{fetchStaff, handleEditStaff, deleteStaff, handleStaffRegister, signInWithUid, checkIfEmailExists};