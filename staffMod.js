import { app,auth, db, Timestamp, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, onSnapshot,fetchSignInMethodsForEmail, createUserWithEmailAndPassword,signOut } from "./firebase-config.js";

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

// Handle form submission
async function handleStaffRegister(event) {
    event.preventDefault(); // Prevent default form submission
    showCustomAlert('Registering staff, please wait...', () => { });

    // Get form values
    const dept = document.getElementById('dept').value;
    const Lname = document.getElementById('LName').value;
    const Fname = document.getElementById('FName').value;
    const contact = document.getElementById('contact').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('Password').value;
    const confirmPassword = document.getElementById('ConfirmPassword').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        hideCustomAlert();
        AlertMe('Passwords do not match. Please try again.');
        return;
    }

    // Validate password rules
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
        hideCustomAlert();
        AlertMe(`Password must meet the following criteria:\n\n<i class="fa-solid fa-circle-info"></i> ${passwordErrors.join('\n<i class="fa-solid fa-circle-info"></i> ')}`);
        return;
    }

    try {
        // Check if the email already exists in Firebase Authentication
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
            hideCustomAlert();
            AlertMe('This email is already registered. Please use a different email.');
            return;
        }

        hideCustomAlert();

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} registered a staff at ${timestamp}`);

        showCustomAlert('Staff registered successfully. You will be logged out shortly. Please wait...', () => { });

        // Register the staff in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const staffUID = userCredential.user.uid; // Get the created UID


        // Add the staff to Firestore with UID as document ID
        await setDoc(doc(db, 'STAFF', staffUID), {
            Fname: Fname,
            Lname: Lname,
            staffDept: dept,
            staffContacts: contact,
            staffEmail: email,
        });

        // Sign out the user after creation to prevent auto-login
		await signOut(auth); // This will log the user out immediately
    } catch (error) {
        hideCustomAlert();
        console.error("Error registering staff:", error);

        // Handle weak password error
        if (error.code === 'auth/weak-password') {
            AlertMe('The password is too weak. Please ensure it meets all criteria.');
        } else {
            AlertMe('Error registering staff. Please try again.');
        }
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

        hideCustomAlert();
        showModal('editStaff'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error(`Error updating company with ID ${staffID}:`, error);
    }

    cancelUpStaff();
}

async function deleteStaff(staffId) {
    showCustomAlert("Deleting staff's account, please wait...", () => {}); // Show loading message
    
    try {
        const staffDocRef = doc(db, 'STAFF', staffId); // Firestore reference to the contact
        await deleteDoc(staffDocRef); // Delete the contact document from Firestore
        
        hideCustomAlert(); // Hide the loading alert
        showModal('deleteStaff2'); // Show success modal
    } catch (error) {
        hideCustomAlert(); // Hide loading in case of error
        AlertMe("Error deleting contact:", error); // Log error for debugging
    }
}

export{fetchStaff, handleEditStaff, deleteStaff, handleStaffRegister};