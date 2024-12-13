import { app, db, auth, storage, ref,getDownloadURL, uploadBytes, Timestamp, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, onSnapshot,  deleteObject, getMetadata  } from "./firebase-config.js";

async function fetchPOs() {
    showCustomAlert('Fetching POs, please wait...', () => {});
    const poTableBody = document.querySelector('#POTable tbody');
    poTableBody.innerHTML = '';  // Clear the table before populating
    if (unsubscribe) unsubscribe();

    // Get the selected date range
    const initialDateValue = document.getElementById('initialDate').value;
    const lastDateValue = document.getElementById('lastDate').value;
    const initialDate = initialDateValue ? new Date(initialDateValue) : null;
    const lastDate = lastDateValue ? new Date(lastDateValue) : null;

    try {
        // Set up a query for the PO collection based on the date filters
        const poCollectionRef = collection(db, 'PO');
        let poQuery;

        if (initialDate && lastDate) {
            // Rule 3: Both initial and last dates are filled, fetch data between the range
            poQuery = query(poCollectionRef, where('poDate', '>=', initialDate), where('poDate', '<=', lastDate));
        } else if (initialDate) {
            // Rule 2: Initial date is filled, last date is empty, fetch data after the initial date
            poQuery = query(poCollectionRef, where('poDate', '>=', initialDate));
        } else if (lastDate) {
            // Rule 1: Initial date is empty, last date is filled, fetch data before the last date
            poQuery = query(poCollectionRef, where('poDate', '<=', lastDate));
        } else {
            // Rule 4: Both initial and last dates are empty, fetch all data
            poQuery = poCollectionRef;
        }

        // Fetch the filtered PO data
        onSnapshot(poQuery, (querySnapshot) => {
            poTableBody.innerHTML = ''; // Clear the table body for each update
            po = []; // Reset the POs array

            querySnapshot.forEach((doc) => {
                const poData = doc.data();

                po.push({
                    no: doc.id,  // Store the Firestore document ID
                    company: poData.companyID,
                    poDate: poData.poDate.toDate(),
                    poFile: poData.poFile
                });
            });

            // Sort and display the POs
            po.sort((a, b) => b.poDate - a.poDate);
            filterPO();
        });
    } catch (error) {
        console.error("Error fetching PO:", error);
    }
}


async function uploadPO(poData) {
    // Create a file input dynamically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';

    // Trigger the file input dialog
    fileInput.click();

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];

        if (file) {
            try {
                // Validate file type and size (optional)
                if (file.type !== 'application/pdf') {
                    alert('Please upload a valid PDF file.');
                    return;
                }

                // Define the new storage path
                const newFilePath = `COMPANY/${poData.company}/PO/${file.name}`;
                const newStorageRef = ref(storage, newFilePath);

                // Check if an old file exists and delete it
                if (poData.poFile !== '-') {
                    const oldFilePath = `COMPANY/${poData.company}/PO/${poData.poFile}`;
                    const oldStorageRef = ref(storage, oldFilePath);

                    try {
                        await deleteObject(oldStorageRef);
                        console.log('Old file deleted successfully.');
                    } catch (error) {
                        console.warn('Error deleting old file:', error);
                    }
                }

                // Upload the new file to Firebase Storage
                await uploadBytes(newStorageRef, file);

                // Get the uploaded file's download URL (optional, if needed elsewhere)
                const downloadURL = await getDownloadURL(newStorageRef);

                // Update the invoice field in Firestore
                const poDocRef = doc(db, 'PO', poData.no);
                await updateDoc(poDocRef, {
                    poFile: file.name,
                });

                const timestamp = new Date().toLocaleString(); // Get current time
                addNotification(`${staffName} uploaded a PO file for PO ${poData.no} at ${timestamp}`);
                showModal('uploadPO');
            } catch (error) {
                console.error('Error uploading PO:', error);
                alert('Failed to upload PO. Please try again.');
            }
        }
    });
}


async function deletePO(poId) {
    showCustomAlert('Deleting PO, please wait...', () => {}); // Show loading message
    
    try {
        const poDocRef = doc(db, 'PO', poId); // Firestore reference to the PO
        const poSnapshot = await getDoc(poDocRef);

        if (!poSnapshot.exists()) {
            throw new Error(`PO with ID ${poId} does not exist.`);
        }

        const poData = poSnapshot.data();

        // Construct the file path based on the retrieved PO data
        const filePath = `COMPANY/${poData.companyID}/PO/${poData.poFile}`;

        // Create a reference to the file in Firebase Storage
        const fileRef = ref(storage, filePath);

        try {
            // Check if the file exists before attempting to delete
            const fileSnapshot = await getMetadata(fileRef);
            // If the file exists, delete it
            await deleteObject(fileRef);
        } catch (fileError) {
            // If the file doesn't exist, log a message and skip deletion
            console.log(`File with path ${filePath} does not exist, skipping deletion.`);
        }

        // Delete the PO document from Firestore
        await deleteDoc(poDocRef);

        hideCustomAlert(); // Hide the loading alert
        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} deleted a PO ${poId} at ${timestamp}`);
        showModal('deletePO2'); // Show success modal
    } catch (error) {
        hideCustomAlert(); // Hide loading in case of error
        console.error("Error deleting PO:", error); // Log error for debugging
    }
}


async function displayPORealTime(poData) {
    const poNo = poData.no;
    const poDocRef = doc(db, "PO", poNo);

    // Listen for real-time updates to the CHARGE document
    onSnapshot(poDocRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {

             const po = docSnapshot.data();

            if (po.poFile !== '-') {
                try {
                    const invoicePath = `COMPANY/${poData.company}/PO/${po.poFile}`;
                    const invoiceRef = ref(storage, invoicePath);

                    // Get download URL and display file name with icon
                    const invoiceURL = await getDownloadURL(invoiceRef);
                    const invoiceElement = document.getElementById('poFile2');
                    invoiceElement.href = invoiceURL;
                    invoiceElement.setAttribute('download', po.poFile); // This will trigger download
                    invoiceElement.setAttribute('target', '_blank'); // Open in a new tab

                    invoiceElement.innerHTML = `<i class="bi bi-file-earmark-pdf-fill"></i> ${po.poFile}`;
                    invoiceElement.style.pointerEvents = ''; // Enable the link
                    invoiceElement.style.cursor = ''; // Default cursor
                } catch (error) {

                    // Reset poFile link and text if an error occurs
                    resetInvoiceElement('poFile2');
                }
            } else {
                resetInvoiceElement('poFile2');
            }
        } else {
            console.error("Charge document does not exist!");
            resetInvoiceElement('poFile2');
        }
    });

    // Helper function to reset the poFile element
    resetInvoiceElement('poFile2');
}
async function removePO(poId) {
    try {
        // Retrieve the PO data from Firestore using the PO ID
        const poRef = doc(db, "PO", poId);
        const poSnapshot = await getDoc(poRef);

        if (!poSnapshot.exists()) {
            throw new Error(`PO with ID ${poId} does not exist.`);
        }

        const poData = poSnapshot.data();

        // Construct the file path based on the retrieved PO data
        const filePath = `COMPANY/${poData.companyID}/PO/${poData.poFile}`;

        // Create a reference to the file in Firebase Storage
        const fileRef = ref(storage, filePath);

        // Delete the file from Firebase Storage
        await deleteObject(fileRef);

        // Update the PO document in Firestore to set the 'poFile' field to '-'
        await updateDoc(poRef, {
            poFile: '-',
        });

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} removed PO file for PO ${poId} at ${timestamp}`);
    } catch (error) {
        console.error("Failed to remove the file or update Firestore:", error);
        alert("Failed to remove the file. Please try again.");
    }
}


async function displaySubmissionPO(poNo) {
    showCustomAlert('Updating PO, please wait...', () => {});

    const dateInput = document.getElementById('poDate2').value;
    // Convert date string from input to a Date object
    const date = dateInput ? new Date(dateInput) : null;
    const company = document.getElementById('company2').value;

    try {
        // Update the company data in Firestore using the document ID
        const poDocRef = doc(db, 'PO', poNo);
        await updateDoc(poDocRef, {
            companyID: company,
            poDate : date
        });

        hideCustomAlert();
        showModal('editPO'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error(`Error updating charge with ID ${poNo}:`, error);
    }
}

async function editPO(poData){
	 // Populate the dropdown and set the default company value
    await fetchOptions('company2'); // Populate the dropdown before setting the default value
    const companySelect = document.getElementById('company2');
    companySelect.value = poData.company || ''; // Set the value of the select element to the contact's companyID

    // Initialize Select2 to ensure the selected value is displayed correctly
    $(companySelect).select2({
        placeholder: 'Select a Company',
        allowClear: true,
        width: '100%'  // Adjust the width as needed
    }).val(poData.company).trigger('change'); // Set and trigger Select2 to update the display

    // Check if the provided companyID is a valid option
    if (!Array.from(companySelect.options).some(option => option.value === poData.company)) {
        console.error('Invalid company value');
    }
}


// Handle form submission
async function addPOSubmission(event) {
    event.preventDefault(); // Prevent default form submission
    showCustomAlert('Adding PO, please wait...', () => { });

    // Get form values
    let poNum = document.getElementById('poNumber').value.trim(); // Use `.trim()` to prevent accidental spaces
    const companyID = document.getElementById('company').value;
    const dateInput = document.getElementById('poDate').value;
    const date = dateInput ? new Date(dateInput) : null;

    // Validate form inputs
    if (!poNum || !companyID || !date) {
        alert("Please fill out all required fields.");
        hideCustomAlert();
        return;
    }

    // Replace invalid characters in `poNum`
    poNum = poNum.replaceAll('/', '-'); // Replace slashes with dashes

    // Retrieve the file input element and file
    const poFileInput = document.getElementById('poFile');
    const file = poFileInput.files[0];
    const fileName = file ? file.name : '-'; // Set `-` if no file is uploaded

    // Set up file path and reference for Firebase Storage
    const filePath = file ? `COMPANY/${companyID}/PO/${fileName}` : null;
    const storageRef = filePath ? ref(storage, filePath) : null;

    try {
        // Add PO data to Firestore with `poNum` as the document ID
        const poDocRef = doc(db, 'PO', poNum); // Specify the document ID here
        await setDoc(poDocRef, {
            poDate: date,
            poFile: fileName,
            companyID: companyID,
        });

        // If a file is uploaded, upload it to Firebase Storage
        if (file && storageRef) {
            try {
                await uploadBytes(storageRef, file);
            } catch (uploadError) {
                console.error(`Error uploading PO file:`, uploadError);
                // Rollback Firestore entry if file upload fails
                await deleteDoc(poDocRef);
                throw new Error("File upload failed. Firestore entry was rolled back.");
            }
        }

        hideCustomAlert();
        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} added a PO at ${timestamp}`);
        showModal('addPOsuccess'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error("Error adding PO:", error);
        alert("Failed to add the PO. Please try again.");
    }

    // Reset the form or close modal
    cancelAddPO();
}



export{ fetchPOs, uploadPO, deletePO, displayPORealTime, removePO, displaySubmissionPO, editPO, addPOSubmission};