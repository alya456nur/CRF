// Import the necessary Firebase modules
import { app, db, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc,arrayRemove, onSnapshot } from "./firebase-config.js";

// Save outsource data in an array
async function fetchOutsources() {
    showCustomAlert('Fetching outsource testings, please wait...', () => { });

    if (unsubscribe) unsubscribe();
    const outsourceTableBody = document.querySelector('#outsourceTable tbody');
    outsourceTableBody.innerHTML = '';  // Clear the table before populating

    try {
        // Set up a real-time listener for the OUTSOURCE collection
        const outsourceCollectionRef = collection(db, 'OUTSOURCE');

        // Set up the real-time listener
        const unsubscribe = onSnapshot(outsourceCollectionRef, (querySnapshot) => {
            // Clear the table body and reset the outsources array
            outsourceTableBody.innerHTML = '';
            outsources = [];

            // Populate the outsources array with the latest data
            querySnapshot.forEach((doc) => {
                const outsourceData = doc.data();
                outsources.push({
                    id: doc.id,  // Store the Firestore document ID
                    name: outsourceData.testName,
                    parameter: outsourceData.param,
                    price: outsourceData.price
                });
            });

            // Sort outsources by testName in ascending order
            outsources.sort((a, b) => a.name.localeCompare(b.name));

            // Update the table display in real-time
            filterOutsources();  // Display filtered table (initially displays all outsources)
        });

        // Optionally, return unsubscribe function to clean up later
        return unsubscribe;

    } catch (error) {
        console.error("Error fetching outsource testing:", error);
    }
}


async function addOutsourceSubmission(event) {
    event.preventDefault(); // Prevent default form submission
    showCustomAlert('Adding testing, please wait...', () => { });

    // Get form values
    const name = document.getElementById('outName').value;
    const parameter = document.getElementById('outParam').value;
    const price = parseFloat(document.getElementById('outPrice').value);


    // Add testing to Firestore
    try {
        await addDoc(collection(db, 'OUTSOURCE'), {
            testName: name,
            param: parameter,
            price: price,
        });

        hideCustomAlert();
        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} added a new outsource parameter at ${timestamp}`);
        showModal('addOutsource'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error("Error adding testing:", error);
    }

    // Reset the form fields
    const outForm = document.getElementById('outsourceForm');
    outForm.reset();
    cancelAddOut();
}

async function deleteOutsource(outsourceId) {
    showCustomAlert('Deleting testing, please wait...', () => {}); // Show loading message
    
    try {
        // 1. Fetch all TESTING documents that contain the outsourceId in their outParam array
        const testingQuery = query(collection(db, 'TESTING'), where('outParam', 'array-contains', outsourceId));
        const testingSnapshot = await getDocs(testingQuery);

        // 2. Create an array of update promises for each TESTING document
        const updatePromises = testingSnapshot.docs.map((doc) => {
            const testingDocRef = doc.ref;

            // Remove the outsourceId from the outParam array
            return updateDoc(testingDocRef, {
                outParam: arrayRemove(outsourceId) // Remove outsourceId from outParam array
            });
        });

        // 3. Wait for all TESTING documents to be updated
        await Promise.all(updatePromises);

        // 4. Delete the OUTSOURCE document
        const outsourceDocRef = doc(db, 'OUTSOURCE', outsourceId);
        await deleteDoc(outsourceDocRef); // Delete the outsource document from Firestore

        // 5. Hide the loading alert, refresh the list, and show success modal
        hideCustomAlert();
        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} deleted an outsource parameter at ${timestamp}`);
        showModal('deleteOut2'); // Show success modal
    } catch (error) {
        // In case of error, hide the loading alert and log the error
        hideCustomAlert();
        console.error("Error deleting outsource testing:", error);
    }
}


async function editOutsource(outsourceId) {
    try {
        // Fetch the company from Firestore using the companyId
        const outsourceDocRef = doc(db, 'OUTSOURCE', outsourceId);
        const outsourceDoc = await getDoc(outsourceDocRef);

        if (!outsourceDoc.exists()) {
            console.error('Outsource testing not found');
            return;
        }

        const outsourceToEdit = outsourceDoc.data(); // Get the company data

        // Populate the form with the selected company's data
        document.getElementById('outName2').value = outsourceToEdit.testName || 'Unavailable';
        document.getElementById('outParam2').value = outsourceToEdit.param || 'N/A';
        document.getElementById('outPrice2').value = outsourceToEdit.price || 0;

        const formContainer = document.getElementById('updateOutsourceForm');
        const addBtn = document.querySelector('.floating-button');

        hideContainer('searchContainer');
        hideContainer('listHeading');
        addBtn.style.display = 'none';
        hideContainer('outsourceTable');
        hideContainer('pagination');

        setTimeout(() => {
            changeTitle('Outsource Testing Parameter', 'Lab Testing / Parameter List / Outsource / Edit Parameter'); 
            formContainer.classList.add('active');
        }, 500);


        // Modify form submission to update the company
        document.getElementById('upOutsourceForm').onsubmit = function(event) {
            event.preventDefault();
            handleEditOutsource(outsourceId);  // Use the doc.id for submission
        };

    } catch (error) {
        console.error('Error fetching testing data:', error);
    }
}


async function handleEditOutsource(outsourceId) {
    showCustomAlert('Updating testing, please wait...', () => {});

    // Get form values
    const name = document.getElementById('outName2').value;
    const parameter = document.getElementById('inParam2').value;
    const price = parseFloat(document.getElementById('outPrice2').value);

    try {
        // Update the company data in Firestore using the document ID
        const outsourceDocRef = doc(db, 'OUTSOURCE', outsourceId);
        await updateDoc(outsourceDocRef, {
            testName: name,
            param: parameter,
            price: price,
        });

        hideCustomAlert();
        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} edited an outsource parameter at ${timestamp}`);
        showModal('editOutsource'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error(`Error updating testing with ID ${outsourceId}:`, error);
    }

    cancelUpdateOut();
}

export {fetchOutsources, deleteOutsource, editOutsource, handleEditOutsource, addOutsourceSubmission};