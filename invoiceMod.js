import { app, db, auth, storage, ref,getDownloadURL, uploadBytes, Timestamp, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, onSnapshot,  deleteObject, listAll } from "./firebase-config.js";

async function fetchInvoices() {
    showCustomAlert('Fetching charges, please wait...', () => {});
    if (unsubscribe) unsubscribe();
    const chargesTableBody = document.querySelector('#chargeTable tbody');
    chargesTableBody.innerHTML = ''; // Clear the table before populating

    const initialDateValue = document.getElementById('initialDate').value;
    const lastDateValue = document.getElementById('lastDate').value;
    const initialDate = initialDateValue ? Timestamp.fromDate(new Date(initialDateValue)) : null;
    const lastDate = lastDateValue ? Timestamp.fromDate(new Date(lastDateValue)) : null;

    try {
        // Set up query for TESTING collection
        const testingCollectionRef = collection(db, 'TESTING');
        let testingQuery;

        if (initialDate && lastDate) {
            testingQuery = query(testingCollectionRef, where('dateRegis', '>=', initialDate), where('dateRegis', '<=', lastDate));
        } else if (initialDate) {
            testingQuery = query(testingCollectionRef, where('dateRegis', '>=', initialDate));
        } else if (lastDate) {
            testingQuery = query(testingCollectionRef, where('dateRegis', '<=', lastDate));
        } else {
            testingQuery = testingCollectionRef;
        }

        // Fetch PRODUCT and CHARGE data
        const productDocs = await getDocs(collection(db, 'PRODUCT'));
        const chargeDocs = await getDocs(collection(db, 'CHARGE'));

        // Create lookup tables
        const productMap = new Map();
        const chargeMap = new Map();

        productDocs.forEach(doc => {
            if (doc.exists()) productMap.set(doc.id, doc.data());
        });

        // Unsubscribe from any existing listeners before setting up a new one
        if (unsubscribeCharge) unsubscribeCharge();
        if (unsubscribeTesting) unsubscribeTesting();

        // Real-time listener on CHARGE collection
        unsubscribeCharge = onSnapshot(collection(db, 'CHARGE'), (chargeSnapshot) => {
            chargeMap.clear(); // Clear the map before repopulating
            chargeSnapshot.forEach(doc => {
                if (doc.exists()) chargeMap.set(doc.id, doc.data());
            });

            // Fetch TESTING data after CHARGE data is updated
            // Real-time listener on TESTING collection
            // Inside the onSnapshot listener for TESTING collection
            unsubscribeTesting = onSnapshot(testingQuery, (testingSnapshot) => {
                chargesTableBody.innerHTML = ''; // Clear table body for each update
                charges = [];
                let totalSales = 0;
                let inSales = 0;
                let outSales = 0;

                testingSnapshot.forEach(testDoc => {
                    const testData = testDoc.data();
                    if (!testData.dateRegis) return; // Skip if dateRegis is missing

                    const prodID = testData.prodID;
                    const chargeID = testData.chargeID;

                    const productData = productMap.get(prodID);
                    const chargeData = chargeMap.get(chargeID);

                    if (testData && chargeData) {
                        // If productData doesn't exist, use a default value
                        const prodName = productData ? productData.prodName : 'Unknown Sample';

                        // Only include charges with a valid payDate
                        const payDate = chargeData.payDate ? chargeData.payDate.toDate() : '';

                        charges.push({
                            register: testData.dateRegis.toDate(),
                            chargeID: chargeID,
                            inTotal: chargeData.inTotal || 0,
                            outTotal: chargeData.outTotal || 0,
                            sst: chargeData.sst || 0,
                            subtotal: chargeData.subTotal || 0,
                            total: chargeData.Total || 0,
                            invoice: chargeData.invoice || '-',
                            proof: chargeData.proof || false,
                            remarks: chargeData.remarks || '',
                            status: chargeData.payStatus || '',
                            method: chargeData.payMethod || '',
                            payDate: payDate,
                            companyID: chargeData.companyID,
                            prodID: prodID || 'Unknown',
                            prodName: prodName,

                            addOn:chargeData.addOn || '',
                            addOnDate:chargeData.addOnDate || null,
                            depoPercent:chargeData.depoPercent || 0,
                        });

                        // Check if payDate is within the selected date range
                        if (
                            chargeData.payStatus === 'COMPLETED' &&
                            payDate && // Ensure payDate exists
                            (!initialDate || payDate >= initialDate.toDate()) && // Check start date
                            (!lastDate || payDate <= lastDate.toDate()) // Check end date
                        ) {
                            totalSales += chargeData.Total || 0;
                            inSales += chargeData.inTotal || 0;
                            outSales += chargeData.outTotal || 0;
                        }
                    }
                });

                // Sort and display charges
                charges.sort((a, b) => b.register - a.register);
                filterInvoices(charges); // Pass charges to your filtering logic
                animateNumberChange('totalSales', totalSales);
                animateNumberChange('inHouseSales', inSales);
                animateNumberChange('outSales', outSales);
            });

        });
    } catch (error) {
        console.error('Error fetching charges and products:', error);
        showCustomAlert('Error fetching charges. Please try again.', () => {});
    }
}




// Function to handle COA file download
function generateInvoiceIcon(invoiceFilePath) {
    const storageRef = ref(storage, invoiceFilePath);
    getDownloadURL(storageRef)
        .then((url) => {
            // Create a temporary link
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank'; // Open in a new tab

            // Append the link to the document body and trigger the click event
            document.body.appendChild(a);
            a.click();

            // Clean up the temporary link
            document.body.removeChild(a);
        })
        .catch((error) => {
            console.error('Error downloading Files:', error);
        });
}

// Function to handle COA file download
async function generatePopIcon(popFilePath, prodID) {
    try {
        const storageRef = ref(storage, popFilePath);
        // List all files in the folder
        const files = await listAll(storageRef);

        const zip = new JSZip();

        // Fetch each file
        for (const fileRef of files.items) {
            const fileURL = await getDownloadURL(fileRef);
            const response = await fetch(fileURL);
            const fileBlob = await response.blob();

            // Add file to ZIP
            zip.file(fileRef.name, fileBlob);
        }

        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // Create download link
        const zipFileName = `Proof_of_Payment_${prodID}.zip`;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = zipFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    }   catch (error) {
        console.error("Error downloading or zipping files:", error);
        alert("An error occurred while downloading files.");
    }

}

async function uploadInvoice(chargeData) {
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
                const newFilePath = `COMPANY/${chargeData.companyID}/SAMPLE/${chargeData.prodID}/INVOICE/${file.name}`;
                const newStorageRef = ref(storage, newFilePath);

                // Check if an old invoice exists and delete it
                if (chargeData.invoice !== '-') {
                    const oldFilePath = `COMPANY/${chargeData.companyID}/SAMPLE/${chargeData.prodID}/INVOICE/${chargeData.invoice}`;
                    const oldStorageRef = ref(storage, oldFilePath);

                    try {
                        await deleteObject(oldStorageRef);
                        console.log('Old invoice deleted successfully.');
                    } catch (error) {
                        console.warn('Error deleting old invoice:', error);
                    }
                }

                // Upload the new invoice to Firebase Storage
                await uploadBytes(newStorageRef, file);

                // Get the uploaded file's download URL (optional, if needed elsewhere)
                const downloadURL = await getDownloadURL(newStorageRef);

                const today = Timestamp.now(); // Firebase Timestamp representing the current time


                // Update the invoice field in Firestore
                const chargeDocRef = doc(db, 'CHARGE', chargeData.chargeID);
                await updateDoc(chargeDocRef, {
                    invoice: file.name,
                    payStatus: 'COMPLETED',
                    payDate: today
                });

                const timestamp = new Date().toLocaleString(); // Get current time
                addNotification(`${staffName} uploaded an invoice for testing ${chargeData.prodID} at ${timestamp}`);

                showModal('uploadInvoice');
            } catch (error) {
                console.error('Error uploading invoice:', error);
                alert('Failed to upload invoice. Please try again.');
            }
        }
    });
}

async function uploadPop(chargeData) {
    // Create a file input dynamically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';
    fileInput.multiple = true; // Allow multiple file selection

    // Trigger the file input dialog
    fileInput.click();

    fileInput.addEventListener('change', async (event) => {
        const files = event.target.files; // Get all selected files

        if (files.length > 0) {
            try {
                const timestamp = new Date().toLocaleString(); // Get current time

                for (const file of files) {
                    // Validate file type (optional)
                    if (file.type !== 'application/pdf') {
                        alert(`Invalid file type: ${file.name}. Only PDF files are allowed.`);
                        continue;
                    }

                    // Define the storage path for each file
                    const FilePath = `COMPANY/${chargeData.companyID}/SAMPLE/${chargeData.prodID}/PROOF OF PAYMENT/${file.name}`;
                    const storageRef = ref(storage, FilePath);

                    // Upload the file to Firebase Storage
                    await uploadBytes(storageRef, file);

                    // (Optional) Get the uploaded file's download URL
                    const downloadURL = await getDownloadURL(storageRef);

                }

                // Update Firestore to record that a proof has been uploaded
                const chargeDocRef = doc(db, 'CHARGE', chargeData.chargeID);
                await updateDoc(chargeDocRef, {
                    proof: true // Store file name as key and URL as value
                });

                // Add a notification for each uploaded file
                addNotification(`${staffName} uploaded POP file (${file.name}) for testing ${chargeData.prodID} at ${timestamp}`);

                // Show a modal or provide user feedback
                showModal('uploadPop');
            } catch (error) {
                console.error('Error uploading files:', error);
                alert('Failed to upload files. Please try again.');
            }
        } else {
            alert('No files selected.');
        }
    });
}


async function checkAndDisplayCOARealTime(chargeData) {
    const chargeID = chargeData.chargeID;
    const chargeDocRef = doc(db, "CHARGE", chargeID);

    // Listen for real-time updates to the CHARGE document
    onSnapshot(chargeDocRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {

             const charge = docSnapshot.data();

            if (charge.invoice !== '-') {
                try {
                    const invoicePath = `COMPANY/${chargeData.companyID}/SAMPLE/${chargeData.prodID}/INVOICE/${charge.invoice}`;
                    const invoiceRef = ref(storage, invoicePath);

                    // Get download URL and display file name with icon
                    const invoiceURL = await getDownloadURL(invoiceRef);
                    const invoiceElement = document.getElementById('invoiceFile');
                    invoiceElement.href = invoiceURL;
                    invoiceElement.setAttribute('download', charge.invoice); // This will trigger download
                    invoiceElement.setAttribute('target', '_blank'); // Open in a new tab

                    invoiceElement.innerHTML = `<i class="bi bi-file-earmark-pdf-fill"></i> ${charge.invoice}`;
                    invoiceElement.style.pointerEvents = ''; // Enable the link
                    invoiceElement.style.cursor = ''; // Default cursor
                } catch (error) {

                    // Reset invoice link and text if an error occurs
                    resetInvoiceElement('invoiceFile');
                }
            } else {
                resetInvoiceElement('invoiceFile');
            }
        } else {
            console.error("Charge document does not exist!");
            resetInvoiceElement('invoiceFile');
        }
    });

    // Helper function to reset the invoice element
    resetInvoiceElement('invoiceFile');
}

async function removeInvoice(chargeData) {

    try{
        // Retrieve the PO data from Firestore using the PO ID
        const chargeRef = doc(db, "CHARGE", chargeData.chargeID);
        const chargeSnapshot = await getDoc(chargeRef);

        if (!chargeSnapshot.exists()) {
            throw new Error(`PO with ID ${chargeData.chargeID} does not exist.`);
        }

        const charges = chargeSnapshot.data();

        const filePath = `COMPANY/${chargeData.companyID}/SAMPLE/${chargeData.prodID}/INVOICE/${charges.invoice}`;

        // Create a reference to the file in Firebase Storage
        const fileRef = ref(storage, filePath);

        // Delete the file
        await deleteObject(fileRef);

        try {
            await updateDoc(chargeRef, {
                invoice: '-',
            });
            const timestamp = new Date().toLocaleString(); // Get current time
            addNotification(`${staffName} remove invoice for testing ${chargeData.prodID} at ${timestamp}`);
        }
        catch (error){
            console.log('error updating CHARGE')
        }
    }catch (error) {
        alert("Failed to remove the file. Please try again.");
    }
}

async function editCharge(chargeID) {
    try {
        // Fetch the charge from Firestore using chargeID
        const chargeDocRef = doc(db, 'CHARGE', chargeID);
        const chargeDoc = await getDoc(chargeDocRef);

        if (!chargeDoc.exists()) {
            console.error('Charge not found');
            return;
        }

        const docID = chargeDoc.id;
        const chargeData = chargeDoc.data(); // Get the charge data

        // Automatically select the correct option in the 'state' dropdown
        const statusSelect = document.getElementById('changeStatus');
        statusSelect.value = chargeData.payStatus || ''; // Set the value of the select element

        // Check if the provided state is a valid option
        if (!Array.from(statusSelect.options).some(option => option.value === chargeData.payStatus)) {
            console.error('Invalid status value');
        }

        document.getElementById('payDate').value = chargeData.payDate ? formatDateForInput(chargeData.payDate) : '';

        // Automatically select the correct option in the 'method' dropdown
        const methodSelect = document.getElementById('changeMethod');
        methodSelect.value = chargeData.payMethod || ''; // Set the value of the select element

        // Check if the provided state is a valid option
        if (!Array.from(methodSelect.options).some(option => option.value === chargeData.payMethod)) {
            console.error('Invalid method value');
        }

        document.getElementById('remarksInvoice').textContent = chargeData.remarks;

        // Auto-select the correct checkmark for addOn
        const paymentViaPOCheck = document.getElementById('paymentViaPO');
        const paymentDepositCheck = document.getElementById('paymentDeposit');

        if (chargeData.addOn === 'PO/LOI') {
            paymentViaPOCheck.checked = true;
            paymentDepositCheck.checked = false;

            showContainer('addOnDate');
            document.getElementById('addDate').value = formatDateForInput(chargeData.addOnDate);
            hideContainer('depoPercent');
        } else if (chargeData.addOn === 'Deposit') {
            paymentDepositCheck.checked = true;
            paymentViaPOCheck.checked = false;

            showContainer('addOnDate');
            document.getElementById('addDate').value = formatDateForInput(chargeData.addOnDate);
            showContainer('depoPercent');
            document.getElementById('depoNum').value = chargeData.depoPercent;
        } else {
            // If addOn is empty or unavailable, uncheck both
            paymentViaPOCheck.checked = false;
            paymentDepositCheck.checked = false;

            hideContainer('addOnDate');
            hideContainer('depoPercent');
        }

        const saveButton = document.getElementById('saveData');

        function setSaveOnClick(docID) {
            saveButton.onclick = function () {
                displaySubmission(docID);
            };
        }

        setSaveOnClick(docID);

    } catch (error) {
        console.error('Error fetching charge data:', error);
    }
}


async function displaySubmission(chargeId) {
    showCustomAlert('Updating charge, please wait...', () => {});

    console.log("test");

    // Check if state is valid
    const status = document.getElementById('changeStatus').value;
    const remarks = document.getElementById('remarksInvoice').value;
    const method = document.getElementById('changeMethod').value;
    const dateInput = document.getElementById('payDate').value;
    const date = dateInput ? new Date(dateInput) : null;

    const dateInput2 = document.getElementById('addDate').value;
    const date2 = dateInput2 ? new Date(dateInput2) : null;

    const depoPercent = document.getElementById('depoNum').value;

    const paymentCheckboxes = document.querySelectorAll('.paymentCheckbox');

    // Function to get the value of the selected checkbox
    function getSelectedPaymentMethod() {
        let selectedValue = null;

        paymentCheckboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                selectedValue = checkbox.value; // Get the value of the checked checkbox
            }
        });

        return selectedValue; // Return the selected value (or null if none selected)
    }

    // Get the selected payment method if any checkbox is checked
    const selectedMethod = getSelectedPaymentMethod();
    console.log('Selected Payment Method:', selectedMethod);

    try {
        // Search for matching TESTING documents with chargeId
        const testingCollectionRef = collection(db, 'TESTING');
        const q = query(testingCollectionRef, where('chargeID', '==', chargeId));

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            // Use a for...of loop instead of forEach to use await properly
            for (const docSnapshot of querySnapshot.docs) {
                const prodID = docSnapshot.data().prodID; // Get prodID from the document

                // Correct usage of doc() to reference the charge document
                const chargeDocRef = doc(db, 'CHARGE', chargeId); // Use 'doc' properly here
                await updateDoc(chargeDocRef, {
                    payStatus: status,
                    remarks: remarks,
                    payMethod: method,
                    payDate: date
                });

                // Update other fields only if checkboxes are checked
                if (selectedMethod) {
                    // Update based on selected method
                    if (selectedMethod === 'PO/LOI') {
                        // Only update these fields if payment method is selected
                        await updateDoc(chargeDocRef, {
                            addOn: selectedMethod,
                            addOnDate: date2,
                            depoPercent: 0
                        });
                    }
                    // Update based on selected method
                    else if (selectedMethod === 'Deposit') {
                        // Only update these fields if payment method is selected
                        await updateDoc(chargeDocRef, {
                            addOn: selectedMethod,
                            addOnDate: date2,
                            depoPercent: depoPercent
                        });
                    }
                }

                const timestamp = new Date().toLocaleString(); // Get current time
                addNotification(`${staffName} updated invoice's data for testing ${prodID} at ${timestamp}`);

                // Success modal
                showModal('editCharge'); // Show success modal
            }
        } else {
            console.log('No matching TESTING documents found for chargeId:', chargeId);
        }

        hideCustomAlert();

    } catch (error) {
        hideCustomAlert();
        console.error(`Error updating charge with ID ${chargeId}:`, error);
    }
}





export {fetchInvoices, generateInvoiceIcon, uploadInvoice, checkAndDisplayCOARealTime, removeInvoice, displaySubmission, editCharge, generatePopIcon, uploadPop};