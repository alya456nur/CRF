// Import the necessary Firebase modules
import { app, db, auth, storage, ref,getDownloadURL, uploadBytes, Timestamp, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, onSnapshot,  deleteObject  } from "./firebase-config.js";

function formatDate2(dateInput) {
    // If input is a Firestore Timestamp, convert to Date object
    const date = dateInput instanceof Timestamp
        ? dateInput.toDate()
        : new Date(dateInput);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()); // Last two digits of year
    return `${day}/${month}/${year}`;
}

// Function to fetch testings data based on the selected date range
async function fetchTestings() {
    showCustomAlert('Fetching testings, please wait...', () => {});

    // Unsubscribe from previous listener if there is one
    if (unsubscribe) unsubscribe();

    try {
        const testingCollectionRef = collection(db, 'TESTING');

        // Cache for related documents
        const productCache = {};
        const companyCache = {};
        const staffCache = {};

        // Get the selected date range
        const initialDateValue = document.getElementById('initialDate').value;
        const lastDateValue = document.getElementById('lastDate').value;
        const initialDate = initialDateValue ? new Date(initialDateValue) : null;
        const lastDate = lastDateValue ? new Date(lastDateValue) : null;

        // Reset `testingData` before the snapshot listener
        testingData = []; // Ensure `testingData` starts fresh

        // Set up the real-time listener with unsubscribe functionality
        unsubscribe = onSnapshot(testingCollectionRef, async (testingSnapshot) => {
            // Reset counters for each update
            let cancelledCount = 0;
            let ongoingCount = 0;
            let pendingCount = 0;
            let completedCount = 0;

            // Temporary array to build `testingData`
            const tempTestingData = [];

            // Helper function to fetch documents with caching
            const fetchWithCache = async (cache, collectionName, docID) => {
                if (!docID || cache[docID]) return cache[docID];
                const docRef = doc(db, collectionName, docID);
                const docSnap = await getDoc(docRef);
                cache[docID] = docSnap.exists() ? docSnap.data() : null;
                return cache[docID];
            };

            // Process all testing documents concurrently
            await Promise.all(
                testingSnapshot.docs.map(async (testDoc) => {
                    const testData = testDoc.data();
                    const registerDate = testData.dateRegis?.toDate() || null;

                    // Only process tests based on date constraints
                    if ((initialDate && registerDate >= initialDate) || !initialDate) {
                        if ((lastDate && registerDate <= lastDate) || !lastDate) {
                            const prodID = testData.prodID || 'Unknown';
                            const productData = await fetchWithCache(productCache, 'PRODUCT', prodID);

                            const prodName = productData?.prodName || 'Unknown Sample';
                            const appearance = productData?.physcAppearance || 'Unknown';
                            const received = productData?.dateReceived?.toDate() || null;

                            const companyID = productData?.companyID || 'Unknown';
                            const companyData = await fetchWithCache(companyCache, 'COMPANY', companyID);
                            const companyName = companyData?.companyName || 'Unknown Company';
                            const phone = companyData?.companyNo || '-';
                            const email = companyData?.companyEmail || '-';
                            const address = `${companyData?.companyStreet || ''}, ${companyData?.companyPostcode || ''} ${companyData?.companyCity || ''}, ${companyData?.companyState || ''}`.replace(/^\s*,|,\s*$/, '').trim();

                            const staffID = companyData?.staffID || 'Unknown';
                            const staffData = await fetchWithCache(staffCache, 'STAFF', staffID);

                            const staffName = staffData?.Fname && staffData?.Lname ? `${staffData.Fname} ${staffData.Lname}` : 'Unknown Staff';

                            // Combine all data into `tempTestingData`
                            tempTestingData.push({
                                testID: testDoc.id,
                                chargeID: testData.chargeID,
                                outCOA: testData.outCOA || '-',
                                COA: testData.COA || '-',
                                result: testData.resultStatus || '',
                                remarks: testData.remarks || '-',
                                register: testData.dateRegis?.toDate() || null,
                                pay: testData.payResult || 'N/A',
                                inParam: testData.inParam || [],
                                outParam: testData.outParam || [],

                                prodID,
                                prodName,
                                appearance,
                                received,

                                companyID,
                                companyName,
                                phone,
                                email,
                                address,

                                staff: staffID,
                                staffName,
                            });

                            // Count by status
                            switch (testData.resultStatus) {
                                case 'CANCELLED':
                                    cancelledCount++;
                                    break;
                                case 'ONGOING':
                                    ongoingCount++;
                                    break;
                                case 'PENDING':
                                    pendingCount++;
                                    break;
                                case 'COMPLETED':
                                    completedCount++;
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                })
            );

            // Replace `testingData` with `tempTestingData`
            testingData = tempTestingData;

            // Sort by register date
            testingData.sort((a, b) => b.register - a.register);

            // Display filtered table (initially displays all companies)
            filterTestings();
            animateNumberChange('testTotal', testingData.length); // Pass the total count
            animateNumberChange('ongoingTotal', ongoingCount); // Pass the count for ONGOING
            animateNumberChange('cancelTotal', cancelledCount); // Pass the count for CANCELLED
            animateNumberChange('pendTotal', pendingCount); // Pass the count for PENDING
            animateNumberChange('completeTest', completedCount); // Pass the count for COMPLETED
        });
    } catch (error) {
        console.error('Error setting up real-time listener:', error);
    }
}


async function retrieveInternal() {
    const internalMap = {};
    try {
        const querySnapshot = await getDocs(collection(db, 'INTERNAL'));
        
        querySnapshot.forEach((doc) => {
            const internalData = doc.data();
            internalMap[doc.id] = internalData.testName;
        });
    } catch (error) {
        console.error("Error fetching internal testing:", error);
    }

    return internalMap;  // Return the map of companies
}


async function retrieveOutsource() {
    const outMap = {};
    try {
        const querySnapshot = await getDocs(collection(db, 'OUTSOURCE'));
        
        querySnapshot.forEach((doc) => {
            const outData = doc.data();
            outMap[doc.id] = outData.testName;
        });
    } catch (error) {
        console.error("Error fetching outsource:", error);
    }

    return outMap;  // Return the map of companies
}

async function retrieveProducts(companyID) {
    const prodMap = {};
    try {
        const productQuery = query(
            collection(db, 'PRODUCT'),
            where('companyID', '==', companyID), // Filter by companyID
            where('status', '==', 'ACTIVE')     // Filter by status
        );
        const querySnapshot = await getDocs(productQuery);

        querySnapshot.forEach((doc) => {
            const prodData = doc.data();
            prodMap[doc.id] = prodData.prodName;
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }

    return prodMap; // Return the map of products
}



async function fillInfo() {
    document.getElementById('itemID').textContent = ''; // Reset to empty or any default value

    // Reset the input fields
    document.getElementById('received').value = ''; // Reset the date input
    document.getElementById('sampleName').value = ''; // Reset the sample name input
    document.getElementById('appearance').value = ''; // Reset the appearance input

    const companyID = document.getElementById('company').value; // Get selected company ID
    
    if (!companyID) {
        console.error("No company ID selected.");
        return;
    }

    try {
        // Get the company document from Firestore
        const companyDocRef = doc(db, 'COMPANY', companyID);
        const companyDoc = await getDoc(companyDocRef);
        
        if (companyDoc.exists()) {
            fetchStaffProduct();
            const companyData = companyDoc.data();

            // Combine postcode, city, and state for Address 2
            const addressLine2 = `${companyData.companyPostcode || ''}, ${companyData.companyCity || ''}, ${companyData.companyState || ''}`.trim();
            
            // Fill the fields with the company data
            document.getElementById('staffName').textContent = staffMap[companyData.staffID] || 'Unknown Staff';

            document.getElementById('companyName').value = companyData.companyName || '';
            document.getElementById('companyAddress1').value = companyData.companyStreet ? `${companyData.companyStreet},` : '';
            document.getElementById('companyAddress2').value = addressLine2 || '';
            document.getElementById('companyPhone').value = companyData.companyNo || '';
            document.getElementById('companyEmail').value = companyData.companyEmail || '';

            await fetchContacts2(companyID, 'contactName');

            const sampleSelect = document.getElementById('sample');
            sampleSelect.disabled = false; // Enable the select dropdown

            await fetchProductOptions(companyID, 'sample');
        } else {
            console.error("No such company found!");
        }
    } catch (error) {
        console.error("Error retrieving company data:", error);
    }
}

async function fillInfo2() {
    document.getElementById('itemID3').textContent = ''; // Reset to empty or any default value

    // Reset the input fields
    document.getElementById('received3').value = ''; // Reset the date input
    document.getElementById('sampleName3').value = ''; // Reset the sample name input
    document.getElementById('appearance3').value = ''; // Reset the appearance input

    const companyID = document.getElementById('company3').value; // Get selected company ID
    
    if (!companyID) {
        console.error("No company ID selected.");
        return;
    }

    try {
        // Get the company document from Firestore
        const companyDocRef = doc(db, 'COMPANY', companyID);
        const companyDoc = await getDoc(companyDocRef);
        
        if (companyDoc.exists()) {
            fetchStaffProduct();
            const companyData = companyDoc.data();

            // Combine postcode, city, and state for Address 2
            const addressLine2 = `${companyData.companyPostcode || ''}, ${companyData.companyCity || ''}, ${companyData.companyState || ''}`.trim();
            
            // Fill the fields with the company data
            document.getElementById('staffName3').textContent = staffMap[companyData.staffID] || 'Unknown Staff';

            document.getElementById('companyName3').value = companyData.companyName || '';
            document.getElementById('companyAddress13').value = companyData.companyStreet ? `${companyData.companyStreet},` : '';
            document.getElementById('companyAddress23').value = addressLine2 || '';
            document.getElementById('companyPhone3').value = companyData.companyNo || '';
            document.getElementById('companyEmail3').value = companyData.companyEmail || '';

            await fetchContacts2(companyID, 'contactName3');

            const sampleSelect = document.getElementById('sample3');
            sampleSelect.disabled = false; // Enable the select dropdown
            await fetchProductOptions(companyID, 'sample3');
        } else {
            console.error("No such company found!");
        }
    } catch (error) {
        console.error("Error retrieving company data:", error);
    }
}

// New function to fetch and populate contact data into the table
async function fetchContacts2(companyID, elementID) {
    const contactTable = document.getElementById(elementID).getElementsByTagName('tbody')[0]; // Get the tbody of the contact table

    // Clear existing rows in the contact table
    contactTable.innerHTML = '';

    try {
        // Get the contacts collection where companyID matches
        const contactsQuery = query(collection(db, 'CONTACT'), where('companyID', '==', companyID));
        const querySnapshot = await getDocs(contactsQuery);

        if (!querySnapshot.empty) {
            // For each contact document, add a row to the table
            querySnapshot.forEach(doc => {
                const contactData = doc.data();
                
                // Create a new row
                const newRow = contactTable.insertRow();
                
                // Create and append the cells for CONTACT NAME, EMAIL, and NO. TELEPHONE
                const cellName = newRow.insertCell(0);
                const cellEmail = newRow.insertCell(1);
                const cellPhone = newRow.insertCell(2);

                cellName.textContent = contactData.contactName || 'Unknown Contact';
                cellEmail.textContent = contactData.contactEmail || '-';
                cellPhone.textContent = contactData.contactNo || '-';
            });
        } else {
            // If no contacts are found, create a single row with a message
            const newRow = contactTable.insertRow();
            const cell = newRow.insertCell(0);
            // Set colspan to 3 so the message spans across all columns
            cell.colSpan = 3;
            cell.textContent = "No contact persons are available for this company";
            cell.style.textAlign = "center"; // Optional: Center-align the message
        }
    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}



async function fillSample(){

    const sampleID = document.getElementById('sample').value; // Get selected company ID
    
    if (!sampleID) {
        console.error("No product ID selected.");
        return;
    }


    try {
        // Get the product document from Firestore
        const productDocRef = doc(db, 'PRODUCT', sampleID);
        const productDoc = await getDoc(productDocRef);
        
        if (productDoc.exists()) {
            const productData = productDoc.data();
            const productID = productDocRef.id;
            
            // Fill the fields with the company data
            document.getElementById('itemID').textContent = sampleID;

            document.getElementById('received').value = formatDateForInput(productData.dateReceived) || '';
            document.getElementById('sampleName').value = productData.prodName || 'Unknown Product';
            document.getElementById('appearance').value = productData.physcAppearance || '';

        } else {
            console.error("No such product found!");
        }
    } catch (error) {
        console.error("Error retrieving product data:", error);
    }
}


async function paramIn(total, table, name) {
    const inNameSelect = document.getElementById(total); // Get the select element
    const selectedTestName = inNameSelect.value; // Get the selected test name

    if (!selectedTestName) {
        console.error("No testing name selected.");
        return;
    }

    try {
        // Get the document from the 'INTERNAL' collection based on the selected value
        const testDocRef = doc(db, 'INTERNAL', selectedTestName); // Assuming the selected value matches the doc ID in the INTERNAL collection
        const testDoc = await getDoc(testDocRef);

        if (testDoc.exists()) {
            const testData = testDoc.data(); // Retrieve the data of the document

            // Get the table's tbody to check existing rows
            const tableBody = document.getElementById(table).getElementsByTagName('tbody')[0];

            // Check if the item already exists in the table
            const existingRow = Array.from(tableBody.rows).find(
                row => row.cells[0].textContent === testDoc.id // Compare the hidden cell containing the document ID
            );

            if (existingRow) {
                console.warn("This item is already in the table.");
                return; // Do not add the item if it already exists
            }

            // Create a new row
            const newRow = tableBody.insertRow();

            // Insert a hidden cell for the document ID
            const hiddenCell = newRow.insertCell(0);
            hiddenCell.style.display = 'none'; // Hide the ID column
            hiddenCell.textContent = testDoc.id; // Insert the document ID into the hidden cell

            // Insert the test name, parameter, and price into the other cells
            const cellTestName = newRow.insertCell(1);
            const cellParameter = newRow.insertCell(2);
            const cellPrice = newRow.insertCell(3);

            cellTestName.textContent = testData.testName || 'Unknown Test'; // Test Name
            cellParameter.innerHTML = (testData.param || 'Unknown Parameter').replace(/\n/g, '<br>');
            const price = testData.price || 0; // Use default value of 0 if price is missing
            cellPrice.textContent = `RM${price}`; // Price

            // Update the total price
            updateTotalPrice(name, price);

            // Create a delete icon button
            const cellAction = newRow.insertCell(4); // Cell for the delete icon
            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('bi', 'bi-trash', 'delete-icon'); // Add Bootstrap Trash Icon
            deleteIcon.title = 'Delete'; // Add a title for the tooltip
            deleteIcon.onclick = function () {
                // When the icon is clicked, remove the row and update the total price
                tableBody.deleteRow(newRow.rowIndex - 1);
                updateTotalPrice(name, -price); // Subtract the price from the total
            };

            // Append the delete icon to the cell
            cellAction.appendChild(deleteIcon);
        } else {
            console.error("No document found with the selected Testing Name.");
        }
    } catch (error) {
        console.error("Error retrieving the testing document:", error);
    }
}


async function paramOut(total, table, name) {
    const inNameSelect = document.getElementById(total); // Get the select element
    const selectedTestName = inNameSelect.value; // Get the selected test name

    if (!selectedTestName) {
        console.error("No testing name selected.");
        return;
    }

    try {
        // Get the document from the 'INTERNAL' collection based on the selected value
        const testDocRef = doc(db, 'OUTSOURCE', selectedTestName); // Assuming the selected value matches the doc ID in the INTERNAL collection
        const testDoc = await getDoc(testDocRef);

        if (testDoc.exists()) {
            const testData = testDoc.data(); // Retrieve the data of the document

            // Get the table's tbody to check existing rows
            const tableBody = document.getElementById(table).getElementsByTagName('tbody')[0];

            // Check if the item already exists in the table
            const existingRow = Array.from(tableBody.rows).find(
                row => row.cells[0].textContent === testDoc.id // Compare the hidden cell containing the document ID
            );

            if (existingRow) {
                console.warn("This item is already in the table.");
                return; // Do not add the item if it already exists
            }

            // Create a new row
            const newRow = tableBody.insertRow();

            // Insert a hidden cell for the document ID
            const hiddenCell = newRow.insertCell(0);
            hiddenCell.style.display = 'none'; // Hide the ID column
            hiddenCell.textContent = testDoc.id; // Insert the document ID into the hidden cell

            // Insert the test name, parameter, and price into the other cells
            const cellTestName = newRow.insertCell(1);
            const cellParameter = newRow.insertCell(2);
            const cellPrice = newRow.insertCell(3);

            cellTestName.textContent = testData.testName || 'Unknown Test'; // Test Name
            cellParameter.innerHTML = (testData.param || 'Unknown Parameter').replace(/\n/g, '<br>');
            const price = testData.price || 0; // Use default value of 0 if price is missing
            cellPrice.textContent = `RM${price}`; // Price

            // Update the total price
            updateTotalPrice(name, price);

            // Create a delete icon button
            const cellAction = newRow.insertCell(4); // Cell for the delete icon
            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('bi', 'bi-trash', 'delete-icon'); // Add Bootstrap Trash Icon
            deleteIcon.title = 'Delete'; // Add a title for the tooltip
            deleteIcon.onclick = function () {
                // When the icon is clicked, remove the row and update the total price
                tableBody.deleteRow(newRow.rowIndex - 1);
                updateTotalPrice(name, -price); // Subtract the price from the total
            };

            // Append the delete icon to the cell
            cellAction.appendChild(deleteIcon);
        } else {
            console.error("No document found with the selected Testing Name.");
        }
    } catch (error) {
        console.error("Error retrieving the testing document:", error);
    }
}

async function addTestSubmission(event) {
    event.preventDefault(); // Prevent default form submission
    showCustomAlert('Adding testing, please wait...', () => { });

    // Get form values
    const prodID = document.getElementById('sample').value;
    const companyID = document.getElementById('company').value;
    const labRemarks = document.getElementById('labRemarks').value || ''; // Get remarks

    // Retrieve hidden internal and outsource IDs from the tables
    const internalIDs = getHiddenIDs('inTest'); // Fetch hidden IDs from inTest table
    const outsourceIDs = getHiddenIDs('outTest'); // Fetch hidden IDs from outTest table

    // Charge details
    const inTotal = parseFloat(document.getElementById('inTotal').value) || 0;
    const outTotal = parseFloat(document.getElementById('outTotal').value) || 0;
    const subTotal = parseFloat(document.getElementById('subTotal').value) || 0;
    const sst = parseFloat(document.getElementById('sst').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const Total = parseFloat(document.getElementById('Total').value) || 0;

    const today = new Date();

    try {
        // Add charge details to CHARGE collection
        const chargeDocRef = await addDoc(collection(db, 'CHARGE'), {
            companyID,
            inTotal,
            outTotal,
            subTotal,
            sst,
            discount,
            Total,
            remarks: '-',
            invoice: '-',
            proof: '-',
            payStatus: 'NOT COMPLETED',
            dateCreated: today
        });

        const chargeID = chargeDocRef.id; // Get the generated document ID for the charge

        // Add test submission to TESTING collection
        await addDoc(collection(db, 'TESTING'), {
            prodID,
            chargeID, // Link to CHARGE document
            outCOA: '-',
            COA: '-',
            resultStatus: 'PENDING',
            dateRegis: today,
            inParam: internalIDs, // Include internal IDs
            outParam: outsourceIDs, // Include outsource IDs
            remarks: labRemarks
        });

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} requested a new testing at ${timestamp}`);

        hideCustomAlert();
        showModal('addTest'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error("Error adding testing submission:", error);
    }

    cancelAddT();
}

async function cancelTest(testData) {
    showCustomAlert('Cancelling testing, please wait...', () => {}); // Show loading message

    const testID = testData.testID;
    const chargeID = testData.chargeID;
    const prodID = testData.prodID;
    
    try {
        const testDocRef = doc(db, 'TESTING', testID); // Firestore reference to the contact
        await updateDoc(testDocRef, {
            resultStatus: 'CANCELLED'
        });

        const chargeDocRef = doc(db, 'CHARGE', chargeID); // Firestore reference to the contact
        await updateDoc(chargeDocRef, {
            payStatus: 'CANCELLED'
        });

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} cancelled testing ${prodID} at ${timestamp}`);
        
        hideCustomAlert(); // Hide the loading alert
        showModal('deleteTest2'); // Show success modal
    } catch (error) {
        hideCustomAlert(); // Hide loading in case of error
        console.error("Error cancelling testing:", error); // Log error for debugging
    }
}

async function editTest(testData) {
    editTest2();
    autoZero();

    try {
        const testID = testData.testID;
        const prodID = testData.prodID;
        const chargeID = testData.chargeID;

        // Populate company dropdown
        await fetchOptions("company3");
        const companySelect = document.getElementById('company3');
        const companyID = testData.companyID || '';
        companySelect.value = companyID || '';
        $(companySelect).select2({
            placeholder: 'Select a Company',
            allowClear: true,
            width: '100%'
        }).val(companyID).trigger('change');

        await fetchInternalOptions('inName3');
        await fetchOutsourceOptions('outName3');

        // Populate product dropdown
        await fetchProductOptions(companyID, 'sample3');

        // Populate the INTERNAL and OUTSOURCE tables
        await populateTables('inTest3', testData.inParam, 'outTest3', testData.outParam);
        // Fetch the product from Firestore using the product ID
        const chargeDocRef = doc(db, 'CHARGE', chargeID);
        const chargeDoc = await getDoc(chargeDocRef);
        const chargeToEdit = chargeDoc.data();

        document.getElementById('discount2').value = chargeToEdit.discount;
        document.getElementById('labRemarks3').value = testData.remarks;

        const prodSelect = document.getElementById('sample3');
        prodSelect.value = prodID || '';
        $(prodSelect).select2({
            placeholder: 'Select a Sample',
            allowClear: true,
            width: '100%'
        }).val(prodID).trigger('change');

    } catch (error) {
        console.error("Error retrieving testing data:", error);
    }

    // Handle form submission
    document.getElementById('upTestForm').onsubmit = function(event) {
        event.preventDefault();
        handleEditTest(testData); // Submit using the testID
    };
}

async function handleEditTest(testData) {
    showCustomAlert('Updating testing, please wait...', () => {});

    // Get form values
    const productID = document.getElementById('sample3').value;
    const prodSelect = document.getElementById('sample3');
    if (!Array.from(prodSelect.options).some(option => option.value === productID)) {
        console.error('Invalid product value:', productID);
        hideCustomAlert();
        return;
    }

    const company = document.getElementById('company3').value;
    // Check if state is valid
    const companySelect = document.getElementById('company3');
    if (!Array.from(companySelect.options).some(option => option.value === company)) {
        console.error('Invalid state value:', company);
        hideCustomAlert();
        return;
    }

    const remarks = document.getElementById('labRemarks3').value;

    const testID = testData.testID;
    const prodID = testData.prodID;

    const chargeID = testData.chargeID;
    // Fetch the product from Firestore using the product ID
    const chargeDocRef = doc(db, 'CHARGE', chargeID);
    const chargeDoc = await getDoc(chargeDocRef);
    const chargeToEdit = chargeDoc.data();

    // Retrieve hidden internal and outsource IDs from the tables
    const internalIDs = getHiddenIDs('inTest3'); // Fetch hidden IDs from inTest table
    const outsourceIDs = getHiddenIDs('outTest3'); // Fetch hidden IDs from outTest table

    // Charge details
    const inTotal = parseFloat(document.getElementById('inTotal2').value) || 0;
    const outTotal = parseFloat(document.getElementById('outTotal2').value) || 0;
    const subTotal = parseFloat(document.getElementById('subTotal2').value) || 0;
    const sst = parseFloat(document.getElementById('sst2').value) || 0;
    const discount = parseFloat(document.getElementById('discount2').value) || 0;
    const Total = parseFloat(document.getElementById('Total2').value) || 0;

    try {
        // Update the contact data in Firestore using the document ID
        const testDocRef = doc(db, 'TESTING', testID);
        await updateDoc(testDocRef, {
            prodID: productID,
            remarks: remarks,
            inParam: internalIDs,
            outParam: outsourceIDs
        });

        await updateDoc(chargeDocRef, {
            companyID: company,
            inTotal: inTotal,
            outTotal: outTotal,
            subTotal: subTotal,
            sst: sst,
            discount: discount,
            Total: Total
        });

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} edited testing ${prodID} at ${timestamp}`);
        hideCustomAlert();
        showModal('editTest'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error(`Error updating testing with ID ${testID}:`, error);
    }

    cancelEditT();
}

async function fillSample2(){

    const sampleID = document.getElementById('sample3').value; // Get selected company ID
    
    if (!sampleID) {
        console.error("No product ID selected.");
        return;
    }


    try {
        // Get the product document from Firestore
        const productDocRef = doc(db, 'PRODUCT', sampleID);
        const productDoc = await getDoc(productDocRef);
        
        if (productDoc.exists()) {
            const productData = productDoc.data();
            const productID = productDocRef.id;
            
            // Fill the fields with the company data
            document.getElementById('itemID3').textContent = sampleID;

            document.getElementById('received3').value = formatDateForInput(productData.dateReceived) || '';
            document.getElementById('sampleName3').value = productData.prodName || 'Unknown Product';
            document.getElementById('appearance3').value = productData.physcAppearance || '';

        } else {
            console.error("No such product found!");
        }
    } catch (error) {
        console.error("Error retrieving product data:", error);
    }
}

async function populateTables(inTable, inParams, outTable, outParams) {
    // Populate inTest3
    const inTableBody = document.getElementById(inTable).getElementsByTagName('tbody')[0];
    inParams.forEach(async (param) => {
        try {
            // Get the document from the 'INTERNAL' collection based on the ID
            const docRef = doc(db, 'INTERNAL', param);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Check if the item already exists in the table
                const existingRow = Array.from(inTableBody.rows).find(
                    row => row.cells[0].textContent === docSnap.id // Compare the hidden cell containing the document ID
                );

                if (existingRow) {
                    console.warn("This item is already in the table.");
                    return; // Do not add the item if it already exists
                }

                // Create a new row
                const newRow = inTableBody.insertRow();

                // Insert a hidden cell for the document ID
                const hiddenCell = newRow.insertCell(0);
                hiddenCell.style.display = 'none'; // Hide the ID column
                hiddenCell.textContent = docSnap.id; // Insert the document ID into the hidden cell

                // Insert cells with data
                const cellTestName = newRow.insertCell(1);
                const cellParameter = newRow.insertCell(2);
                const cellAmount = newRow.insertCell(3);

                cellTestName.textContent = data.testName || 'Unknown Test';
                cellParameter.innerHTML = (data.param || 'Unknown Parameter').replace(/\n/g, '<br>');
                cellAmount.textContent = `RM${data.price || 0}`;

                updateTotalPrice('inTotal2', data.price);

                // Add delete button
                const cellAction = newRow.insertCell(4); // Cell for the delete icon
                const deleteIcon = document.createElement('i');
                deleteIcon.classList.add('bi', 'bi-trash', 'delete-icon'); // Add Bootstrap Trash Icon
                deleteIcon.title = 'Delete'; // Add a title for the tooltip
                deleteIcon.onclick = function () {
                    inTableBody.deleteRow(newRow.rowIndex - 1);
                    updateTotalPrice('inTotal2', -data.price);
                };
                cellAction.appendChild(deleteIcon);

            }

        } catch (error) {
            console.error("Error fetching internal test data:", error);
        }
    });

    // Populate outTest3
    const outTableBody = document.getElementById(outTable).getElementsByTagName('tbody')[0];
    outParams.forEach(async (param) => {
        try {
            // Get the document from the 'OUTSOURCE' collection based on the ID
            const docRef = doc(db, 'OUTSOURCE', param);
            const docSnap = await getDoc(docRef);



            if (docSnap.exists()) {
                const data = docSnap.data();

                // Check if the item already exists in the table
                const existingRow = Array.from(outTableBody.rows).find(
                    row => row.cells[0].textContent === docSnap.id // Compare the hidden cell containing the document ID
                );


                // Create a new row
                const newRow = outTableBody.insertRow();

                // Insert a hidden cell for the document ID
                const hiddenCell = newRow.insertCell(0);
                hiddenCell.style.display = 'none'; // Hide the ID column
                hiddenCell.textContent = docSnap.id; // Insert the document ID into the hidden cell

                // Insert cells with data
                const cellTestName = newRow.insertCell(1);
                const cellParameter = newRow.insertCell(2);
                const cellAmount = newRow.insertCell(3);

                cellTestName.textContent = data.testName || 'Unknown Test';
                cellParameter.innerHTML = (data.param || 'Unknown Parameter').replace(/\n/g, '<br>');
                cellAmount.textContent = `RM${data.price || 0}`;

                updateTotalPrice('outTotal2', data.price);

                // Add delete button
                const cellAction = newRow.insertCell(4); // Cell for the delete icon
                const deleteIcon = document.createElement('i');
                deleteIcon.classList.add('bi', 'bi-trash', 'delete-icon'); // Add Bootstrap Trash Icon
                deleteIcon.title = 'Delete'; // Add a title for the tooltip
                deleteIcon.onclick = function () {
                    outTableBody.deleteRow(newRow.rowIndex - 1);
                    updateTotalPrice('outTotal2', -data.price);
                };
                cellAction.appendChild(deleteIcon);
            }
        } catch (error) {
            console.error("Error fetching outsource test data:", error);
        }
    });
}


async function populateTables2(inTable, inParams, outTable, outParams) {
    // Populate inTest3
    const inTableBody = document.getElementById(inTable).getElementsByTagName('tbody')[0];
    if (inParams.length === 0) {
        // If the array is empty, display the message
        const newRow = inTableBody.insertRow();
        const cell = newRow.insertCell(0);
        cell.colSpan = 2; // Span across all columns
        cell.textContent = "No parameter for this testing";
        cell.style.textAlign = "center"; // Center align the text
        return; // No need to continue with further processing
    }

    inParams.forEach(async (param) => {
        try {
            const docRef = doc(db, 'INTERNAL', param);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Create a new row
                const newRow = inTableBody.insertRow();

                // Insert cells with data
                const cellTestName = newRow.insertCell(0);
                const cellParameter = newRow.insertCell(1);

                cellTestName.textContent = data.testName || 'Unknown Test';
                cellParameter.innerHTML = (data.param || 'Unknown Parameter').replace(/\n/g, '<br>');

                 // Insert a hidden cell for the document ID
                const hiddenCell = newRow.insertCell(2);
                hiddenCell.style.display = 'none';
                hiddenCell.textContent = docSnap.id;
            }
        } catch (error) {
            console.error("Error fetching internal test data:", error);
        }
    });

    // Populate outTest3
    const outTableBody = document.getElementById(outTable).getElementsByTagName('tbody')[0];
    if (outParams.length === 0) {
        // If the array is empty, display the message
        const newRow = outTableBody.insertRow();
        const cell = newRow.insertCell(0);
        cell.colSpan = 3; // Span across all columns
        cell.textContent = "No parameter for this testing";
        cell.style.textAlign = "center"; // Center align the text
        return; // No need to continue with further processing
    }


    outParams.forEach(async (param) => {
        try {
            const docRef = doc(db, 'OUTSOURCE', param);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Create a new row
                const newRow = outTableBody.insertRow();

                // Insert cells with data
                const cellTestName = newRow.insertCell(0);
                const cellParameter = newRow.insertCell(1);

                cellTestName.textContent = data.testName || 'Unknown Test';
                cellParameter.innerHTML = (data.param || 'Unknown Parameter').replace(/\n/g, '<br>');

                 // Insert a hidden cell for the document ID
                const hiddenCell = newRow.insertCell(2);
                hiddenCell.style.display = 'none';
                hiddenCell.textContent = docSnap.id;
            }
        } catch (error) {
            console.error("Error fetching outsource test data:", error);
        }
    });
}

async function changeStatus(testID, status){

    // Update the contact data in Firestore using the document ID
        const testDocRef = doc(db, 'TESTING', testID);

        // Fetch the document data
        const testDocSnap = await getDoc(testDocRef);

        if (!testDocSnap.exists()) {
            console.error(`Document with testID ${testID} does not exist.`);
            return;
        }

        // Retrieve the current data
        const testData = testDocSnap.data();
        const resultStatus = testData.resultStatus; // Current status
        const prodID = testData.prodID; // Product ID

        if (status === "ONGOING") {
            if (resultStatus !== "ONGOING") {
                const timestamp = new Date().toLocaleString(); // Get current time
                addNotification(`Testing ${prodID} has been updated to ONGOING by ${staffName} at ${timestamp}`);
            }
        }

        await updateDoc(testDocRef, {
            resultStatus: status,
        });

}

async function checkAndDisplayCOA(testData) {
    // Handle Outsource COA (outCOA)
    if (testData.outCOA != '-') {
        try {
            const outFilePath = `COMPANY/${testData.companyID}/SAMPLE/${testData.prodID}/outCOA/${testData.outCOA}`;
            const outFileRef = ref(storage, outFilePath);

            // Get download URL and display file name with icon
            const outFileURL = await getDownloadURL(outFileRef);
            const outFileElement = document.getElementById('outFile');
            outFileElement.href = outFileURL;
            outFileElement.setAttribute('download', testData.outCOA); // This will trigger download

            // Open in a new tab
            outFileElement.setAttribute('target', '_blank');

            outFileElement.innerHTML = `<i class="bi bi-file-earmark-pdf-fill"></i> ${testData.outCOA}`;
            outFileElement.style.pointerEvents = ''; // Enable the link
            outFileElement.style.cursor = ''; // Default cursor
        } catch (error) {
            console.error('Error retrieving outCOA file:', error);
            // Reset outFile link and text if an error occurs
            const outFileElement = document.getElementById('outFile');
            outFileElement.removeAttribute('href'); // Remove href to disable the link
            outFileElement.innerHTML = `No file available`;
            outFileElement.style.pointerEvents = 'none'; // Disable clicking
            outFileElement.style.cursor = 'default'; // Set default cursor
        }
    } else {
        const outFileElement = document.getElementById('outFile');
        outFileElement.removeAttribute('href'); // Remove href to disable the link
        outFileElement.innerHTML = `No file available`;
        outFileElement.style.pointerEvents = 'none'; // Disable clicking
        outFileElement.style.cursor = 'default'; // Set default cursor
    }

    // Handle Internal COA (COA)
    if (testData.COA != '-') {
        try {
            const inFilePath = `COMPANY/${testData.companyID}/SAMPLE/${testData.prodID}/COA/${testData.COA}`;
            const inFileRef = ref(storage, inFilePath);

            // Get download URL and display file name with icon
            const inFileURL = await getDownloadURL(inFileRef);
            const inFileElement = document.getElementById('inFile');
            inFileElement.href = inFileURL;
            inFileElement.setAttribute('download', testData.COA); // This will trigger download

            // Open in a new tab
            inFileElement.setAttribute('target', '_blank');

            inFileElement.innerHTML = `<i class="bi bi-file-earmark-pdf-fill"></i> ${testData.COA}`;
            inFileElement.style.pointerEvents = ''; // Enable the link
            inFileElement.style.cursor = ''; // Default cursor
        } catch (error) {
            console.error('Error retrieving COA file:', error);
            // Reset inFile link and text if an error occurs
            const inFileElement = document.getElementById('inFile');
            inFileElement.removeAttribute('href'); // Remove href to disable the link
            inFileElement.innerHTML = `No file available`;
            inFileElement.style.pointerEvents = 'none'; // Disable clicking
            inFileElement.style.cursor = 'default'; // Set default cursor
        }
    } else {
        const inFileElement = document.getElementById('inFile');
        inFileElement.removeAttribute('href'); // Remove href to disable the link
        inFileElement.innerHTML = `No file available`;
        inFileElement.style.pointerEvents = 'none'; // Disable clicking
        inFileElement.style.cursor = 'default'; // Set default cursor
    }
}




async function uploadFile(inputElement, companyID, prodID, folder, testID) {
    const file = inputElement.files[0];
    if (!file) {
        return;
    }

    const fileName = file.name;
    const filePath = `COMPANY/${companyID}/SAMPLE/${prodID}/${folder}/${fileName}`;
    const storageRef = ref(storage, filePath);

    try {
        // Upload file to Firebase Storage
        await uploadBytes(storageRef, file);

        // Get the download URL
        const fileURL = await getDownloadURL(storageRef);


        // Update the corresponding link
        if (folder === "outCOA") {
            document.getElementById("outFile").href = fileURL;
            document.getElementById("outFile").innerHTML = `<i class="bi bi-file-earmark-pdf-fill"></i> ${fileName}`;
        } else if (folder === "COA") {
            document.getElementById("inFile").href = fileURL;
            document.getElementById("inFile").innerHTML = `<i class="bi bi-file-earmark-pdf-fill"></i> ${fileName}`;
        }

        const testRef = doc(db, "TESTING", testID);  // 'db' is your Firestore instance

        try {
            if(folder === 'outCOA'){
                await updateDoc(testRef, {
                    outCOA: fileName,
                });

                const timestamp = new Date().toLocaleString(); // Get current time
                addNotification(`${staffName} uploaded outCOA for testing ${prodID} at ${timestamp}`);
            }else if(folder === 'COA'){
                await updateDoc(testRef, {
                    COA: fileName,
                });

                const timestamp = new Date().toLocaleString(); // Get current time
                addNotification(`${staffName} uploaded COA for testing ${prodID} at ${timestamp}`);
            }
            changeStatus(testID, "COMPLETED");
        }
        catch (error){
            console.log('error updating TESTING')
        }
    } catch (error) {
        console.error(`Error uploading ${folder}:`, error);
    }
}

async function displayTestSubmission(testData) {
    showCustomAlert('Saving data, please wait...', () => {});

    const testID = testData.testID;
    const companyID = testData.companyID;
    const prodID = testData.prodID;

    // Retrieve the file input elements using their IDs
    const outFileInput = document.getElementById('outFile2');
    const inFileInput = document.getElementById('inFile2');

    // Check if both file inputs are empty
    if (!outFileInput.files.length && !inFileInput.files.length) {
        hideCustomAlert(); // Hide the alert if shown
        showModal("errorFile"); // Show error modal
        return; // Exit function early
    }

    try {
        // Wait for the uploadFile function to finish before proceeding
        await uploadFile(outFileInput, companyID, prodID, "outCOA", testID);
        await uploadFile(inFileInput, companyID, prodID, "COA", testID);

        // Once both uploads are complete, hide the custom alert and show the modal
        hideCustomAlert();
        showModal('editTest');
    } catch (error) {
        console.error("Error during file upload:", error);
        hideCustomAlert();
        // Optionally, show an error modal or message
    }
}



// Function to handle COA file download
function generateCOAIcon(coaFilePath) {
    const storageRef = ref(storage, coaFilePath);
    getDownloadURL(storageRef)
        .then((url) => {
            // Create a temporary link
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank'; // Open in a new tab
            a.innerText = 'Open COA'; // You can change this text or add an icon

            // Append the link to the document body and trigger the click event
            document.body.appendChild(a);
            a.click();

            // Clean up the temporary link
            document.body.removeChild(a);
        })
        .catch((error) => {
            console.error('Error downloading COA:', error);
        });
}

async function removeFile(fileType, testData) {
    try {
        // Determine the file path based on the fileType
        let filePath = "";
        if (fileType === "outCOA") {
            if (testData.outCOA === '-') {
                return;
            }
            filePath = `COMPANY/${testData.companyID}/SAMPLE/${testData.prodID}/outCOA/${testData.outCOA}`;
        } else if (fileType === "COA") {
            if (testData.COA === '-') {
                return;
            }
            filePath = `COMPANY/${testData.companyID}/SAMPLE/${testData.prodID}/COA/${testData.COA}`;
        }

        // Ensure the file path exists
        if (!filePath) {
            console.error("Invalid file type provided for removal.");
            return;
        }

        // Create a reference to the file in Firebase Storage
        const fileRef = ref(storage, filePath);

        // Delete the file
        await deleteObject(fileRef);

        const testRef = doc(db, "TESTING", testData.testID);  // 'db' is your Firestore instance

        try {
            if(fileType === 'outCOA'){
                await updateDoc(testRef, {
                    outCOA: '-',
                });

                const timestamp = new Date().toLocaleString(); // Get current time
                addNotification(`${staffName} remove outCOA file for testing ${testData.prodID} at ${timestamp}`);
            }else if(fileType === 'COA'){
                await updateDoc(testRef, {
                    COA: '-',
                });
                const timestamp = new Date().toLocaleString(); // Get current time
                addNotification(`${staffName} remove COA file for testing ${testData.prodID} at ${timestamp}`);
            }
        }
        catch (error){
            console.log('error updating TESTING')
        }

        // Update the UI after successful deletion
        if (fileType === "outCOA") {
            const outFileElement = document.getElementById("outFile");
            outFileElement.removeAttribute("href");
            outFileElement.innerHTML = `No file available`;
            outFileElement.style.pointerEvents = "none";
            outFileElement.style.cursor = "default";
        } else if (fileType === "COA") {
            const inFileElement = document.getElementById("inFile");
            inFileElement.removeAttribute("href");
            inFileElement.innerHTML = `No file available`;
            inFileElement.style.pointerEvents = "none";
            inFileElement.style.cursor = "default";
        }
    } catch (error) {
        console.error(`Error removing ${fileType} file:`, error);
        alert("Failed to remove the file. Please try again.");
    }
}

export{fetchTestings,retrieveInternal, retrieveOutsource, retrieveProducts, fillInfo, fillSample, paramIn, paramOut, addTestSubmission, cancelTest, removeFile,
editTest, fillInfo2, fillSample2, populateTables, formatDate2, fetchContacts2,populateTables2, checkAndDisplayCOA, uploadFile, displayTestSubmission,generateCOAIcon, changeStatus};