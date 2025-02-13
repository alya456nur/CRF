// Import the necessary Firebase modules
import { app, db, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, arrayRemove, onSnapshot } from "./firebase-config.js";

// Save internal data in an array
async function fetchInternal() {
    showCustomAlert('Fetching internal testing, please wait...', () => { });
    if (unsubscribe) unsubscribe();
    const internalTableBody = document.querySelector('#internalTable tbody');
    internalTableBody.innerHTML = '';  // Clear the table before populating

    try {
        const internalCollection = collection(db, "INTERNAL");  // Replace with your actual collection name

        // Set up a real-time listener
        const unsubscribe = onSnapshot(internalCollection, (querySnapshot) => {
            // Clear the table body and reset the internals array
            internalTableBody.innerHTML = '';
            internals = [];

            // Populate the internals array with the latest data
            querySnapshot.forEach((doc) => {
                const internalData = doc.data();
                internals.push({
                    id: doc.id,  // Store the Firestore document ID
                    name: internalData.testName,
                    parameter: internalData.param,
                    price: internalData.price
                });
            });

            // Sort internals by testName in ascending order
            internals.sort((a, b) => a.name.localeCompare(b.name));

            // Update the table display in real-time
            filterInternal();  // Display filtered table (initially displays all internals)
        });

        // Optionally, return unsubscribe function to clean up later
        return unsubscribe;

    } catch (error) {
        console.error("Error fetching internal testing:", error);
    }
}


async function addInternalSubmission(event) {
    event.preventDefault(); // Prevent default form submission
    showCustomAlert('Adding testing, please wait...', () => { });

    // Get form values
    const name = document.getElementById('internalName').value;
    const parameter = document.getElementById('inParam').value;
    const price = parseFloat(document.getElementById('inPrice').value);


    // Add testing to Firestore
    try {
        await addDoc(collection(db, 'INTERNAL'), {
            testName: name,
            param: parameter,
            price: price,
        });

        hideCustomAlert();
        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} added an internal parameter at ${timestamp}`);
        showModal('addInternal'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error("Error adding testing:", error);
    }

    // Reset the form fields
    const inForm = document.getElementById('internalForm');
    inForm.reset();
    cancelAddIn();
}

async function deleteInternal(internalId) {
    showCustomAlert('Deleting testing, please wait...', () => {}); // Show loading message
    
    try {
        // 1. Fetch all TESTING documents that contain the internalId in their inParam array
        const testingQuery = query(collection(db, 'TESTING'), where('inParam', 'array-contains', internalId));
        const testingSnapshot = await getDocs(testingQuery);

        // 2. Create an array of update promises for each TESTING document
        const updatePromises = testingSnapshot.docs.map((doc) => {
            const testingDocRef = doc.ref;

            // Remove the internalId from the inParam array
            return updateDoc(testingDocRef, {
                inParam: arrayRemove(internalId) // Remove internalId from inParam array
            });
        });

        // 3. Wait for all TESTING documents to be updated
        await Promise.all(updatePromises);

        // 4. Delete the INTERNAL document
        const internalDocRef = doc(db, 'INTERNAL', internalId);
        await deleteDoc(internalDocRef); // Delete the internal testing document from Firestore

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} deleted an internal parameter at ${timestamp}`);

        // 5. Hide the loading alert, refresh the list, and show success modal
        hideCustomAlert();
        showModal('deleteIn2'); // Show success modal
    } catch (error) {
        // In case of error, hide the loading alert and log the error
        hideCustomAlert();
        console.error("Error deleting internal testing:", error);
    }
}


async function editInternal(internalId) {
    try {
        // Fetch the company from Firestore using the companyId
        const internalDocRef = doc(db, 'INTERNAL', internalId);
        const internalDoc = await getDoc(internalDocRef);

        if (!internalDoc.exists()) {
            console.error('Intenal testing not found');
            return;
        }

        const internalToEdit = internalDoc.data(); // Get the company data

        // Populate the form with the selected company's data
        document.getElementById('internalName2').value = internalToEdit.testName || 'Unavailable';
        document.getElementById('inParam2').value = internalToEdit.param || 'N/A';
        document.getElementById('inPrice2').value = internalToEdit.price || 0;

        const formContainer = document.getElementById('updateInternalForm');
        const addBtn = document.querySelector('.floating-button');

        hideContainer('searchContainer');
        hideContainer('listHeading');
        addBtn.style.display = 'none';
        hideContainer('internalTable');
        hideContainer('pagination');
        setTimeout(() => {
            changeTitle('Internal Testing Parameter', 'Lab Testing / Parameter List / Internal / Edit Parameter'); 
            formContainer.classList.add('active');
        }, 500);


        // Modify form submission to update the company
        document.getElementById('upInternalForm').onsubmit = function(event) {
            event.preventDefault();
            handleEditInternal(internalId);  // Use the doc.id for submission
        };

    } catch (error) {
        console.error('Error fetching testing data:', error);
    }
}


async function handleEditInternal(internalId) {
    showCustomAlert('Updating testing, please wait...', () => {});

    // Get form values
    const name = document.getElementById('internalName2').value;
    const parameter = document.getElementById('inParam2').value;
    const price = parseFloat(document.getElementById('inPrice2').value);

    try {
        // Update the company data in Firestore using the document ID
        const internalDocRef = doc(db, 'INTERNAL', internalId);
        await updateDoc(internalDocRef, {
            testName: name,
            param: parameter,
            price: price,
        });

        hideCustomAlert();
        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} edited an internal parameter at ${timestamp}`);
        showModal('editInternal'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error(`Error updating testing with ID ${internalId}:`, error);
    }

    cancelUpdateIn();
}

export {fetchInternal, deleteInternal, editInternal, handleEditInternal, addInternalSubmission};