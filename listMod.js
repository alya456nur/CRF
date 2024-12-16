// Import the necessary Firebase modules
import { app, auth, db, Timestamp, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, onSnapshot ,deleteObject, storage, ref, listAll} from "./firebase-config.js";


// Helper function to format date as YYYY-MM-DD for date input
function formatDateForInput(dateInput) {
    // If input is a Firestore Timestamp, convert it to a Date object
    const date = dateInput instanceof Timestamp
        ? dateInput.toDate()
        : new Date(dateInput);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // Returns date in YYYY-MM-DD format
}

const companyCache = {}; // Shared cache for COMPANY documents

async function fetchWithCache(cache, collectionName, docID) {
    if (!docID || cache[docID]) return cache[docID];
    const docRef = doc(db, collectionName, docID);
    const docSnap = await getDoc(docRef);
    cache[docID] = docSnap.exists() ? docSnap.data() : null;
    return cache[docID];
}


// Function to handle the date filtering and fetching products
async function fetchProductsM() {
    showCustomAlert('Fetching products, please wait...', () => { });

    if (unsubscribe) unsubscribe();

    try {
        const productCollectionRef = collection(db, 'PRODUCT');
        products = []; // Reset the products array

        // Set up real-time listener
        const unsubscribe = onSnapshot(productCollectionRef, async (querySnapshot) => {
            const tempProducts = []; // Temporary array for products

            const initialDateValue = document.getElementById('initialDate').value;
            const lastDateValue = document.getElementById('lastDate').value;

            // Convert to Date objects for comparison
            const initialDate = initialDateValue ? new Date(initialDateValue) : null;
            const lastDate = lastDateValue ? new Date(lastDateValue) : null;

            // Fetch company data for each product concurrently using Promise.all
            const productPromises = querySnapshot.docs.map(async (productDoc) => {
                const productData = productDoc.data();
                const companyID = productData.companyID;

                // Fetch company data with caching logic
                const companyData = await fetchWithCache(companyCache, 'COMPANY', companyID);
                const staffID = companyData?.staffID || null;

                // Get the product's dateReceived
                const productDate = productData.dateReceived?.toDate() || null;

                // Apply date filtering logic
                if (
                    (initialDate && productDate && productDate < initialDate) ||
                    (lastDate && productDate && productDate > lastDate)
                ) {
                    return null; // Skip products outside the selected date range
                }

                // Return the product with staffID
                return {
                    id: productDoc.id,
                    name: productData.prodName,
                    company: companyID,
                    date: productDate,
                    appearance: productData.physcAppearance,
                    staff: staffID, // Include the retrieved staffID
                };
            });

            // Wait for all product data to be fetched
            const productsData = await Promise.all(productPromises);

            // Filter out any null values (products that don't meet the date filter)
            const validProducts = productsData.filter(product => product !== null);

            // Sort products by date in descending order
            validProducts.sort((a, b) => b.id.localeCompare(a.id));

            products = validProducts; // Update the products array
            filterProductsM(); // Display filtered and sorted products
        });

        // Optionally, you could provide a cleanup function to unsubscribe from the listener later
        return unsubscribe;
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}




// Handle form submission
async function addProdSubmission(event) {
    event.preventDefault();
    showCustomAlert('Adding product, please wait...', () => { });

    const prodName = document.getElementById('productName').value;
    const appearance = document.getElementById('appearanceS').value;
    const company = document.getElementById('companyName').value;
    const dateInput = document.getElementById('dateReceived').value;
    const date = dateInput ? new Date(dateInput) : null;

    try {
        const currentYear = new Date().getFullYear();
        const yearSuffix = currentYear.toString().slice(-2);

        // Reference to the ID tracker document
        const idTrackerRef = doc(db, 'Meta', 'IDTracker');
        const idTrackerSnap = await getDoc(idTrackerRef);

        let nextIdNumber;

        if (idTrackerSnap.exists() && idTrackerSnap.data()[currentYear]) {
            // Get the current highest ID for this year and increment it
            nextIdNumber = idTrackerSnap.data()[currentYear] + 1;
        } else {
            // If no ID exists for the current year, start with 1
            nextIdNumber = 1;
        }

        // Pad the number with leading zeros to ensure it's always 4 digits
        const paddedNumber = nextIdNumber.toString().padStart(4, '0');

        // Generate prodID in the desired format
        const prodID = `MBC-${paddedNumber}-${yearSuffix}`;

        // Add the new product with the generated prodID as document ID
        await setDoc(doc(db, 'PRODUCT', prodID), {
            prodName: prodName,
            physcAppearance: appearance,
            companyID: company,
            dateReceived: date,
        });

        // Update the ID tracker document with the new highest ID for the year
        await updateDoc(idTrackerRef, { [currentYear]: nextIdNumber });

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} added a new sample at ${timestamp}`);
        hideCustomAlert();
        showModal('addProd'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error("Error adding product:", error);
    }

    const prodForm = document.getElementById('prodForm');
    prodForm.reset();
    cancelAddL();
}


// Make `editProd` async to use await inside
async function editProd(prodID) {
    try {
        // Fetch the product from Firestore using prodID
        const prodDocRef = doc(db, 'PRODUCT', prodID);
        const prodDoc = await getDoc(prodDocRef);

        if (!prodDoc.exists()) {
            console.error('Product not found');
            return;
        }

        const prodToEdit = prodDoc.data(); // Get the product data

        document.getElementById('productName2').value = prodToEdit.prodName;


        appearance = document.getElementById('appearance2');
        appearance.value = prodToEdit.physcAppearance || ''; // Set the value of the select element

        // Check if the provided state is a valid option
        if (!Array.from(appearance.options).some(option => option.value === prodToEdit.physcAppearance)) {
            console.error('Invalid appearance value');
        }

        await fetchOptions('companyName2'); // Populate the dropdown before setting the default value

        const companySelect = document.getElementById('companyName2');

        companySelect.value = prodToEdit.companyID || ''; // Set the selected value

        // Initialize Select2 and update display
        $(companySelect).select2({
            placeholder: 'Select a Company',
            allowClear: true,
            width: '100%' 
        }).val(prodToEdit.companyID).trigger('change');

        document.getElementById('dateReceived2').value = formatDateForInput(prodToEdit.dateReceived) || '';

        const formContainer = document.getElementById('upProductForm');
        const addBtn = document.querySelector('.floating-button');
        const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading

        hideContainer('filterDate');
        hideSelect2('filterStaff');
        hideSelect2('filterCompany');
        hideContainer('searchContainer');

        setTimeout(() => {
            changeTitle('Edit Sample', 'Samples / List / Edit Sample'); 
            heading.textContent = 'Edit Samples';
            formContainer.classList.add('active');
            hideContainer('productTable');
            hideContainer('pagination');
            addBtn.style.display = 'none';
        }, 500);

        // Set form submission handler to update the product
        document.getElementById('upProductForm2').onsubmit = function(event) {
            event.preventDefault();
            EditProductSubmission(prodID);  // Call the submission function
        };

    } catch (error) {
        console.error('Error fetching product data:', error);
    }
}

// EditProductSubmission function to handle the update
async function EditProductSubmission(prodID) {
    showCustomAlert('Updating product, please wait...', () => {});

    // Get form values
    const prodName = document.getElementById('productName2').value;
    const appearance = document.getElementById('appearance2').value;
    const company = document.getElementById('companyName2').value;
    const dateInput = document.getElementById('dateReceived2').value;

    // Check if the selected company value is valid
    const companySelect = document.getElementById('companyName2');
    if (!Array.from(companySelect.options).some(option => option.value === company)) {
        console.error('Invalid company value:', company);
        hideCustomAlert();
        return;
    }

    // Convert date string from input to a Date object
    const date = dateInput ? new Date(dateInput) : null;

    try {
        // Update the product data in Firestore using the document ID
        const prodDocRef = doc(db, 'PRODUCT', prodID);
        await updateDoc(prodDocRef, {
            prodName: prodName,
            physcAppearance: appearance,
            companyID: company,
            dateReceived: date,  // Firestore will store this as a Timestamp
        });

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} edited sample ${prodID} at ${timestamp}`);

        hideCustomAlert();
        showModal('editModal'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error(`Error updating product with ID ${prodID}:`, error);
    }

    cancelUpdateL();
}

async function populateStaffOptions2(staffMap, staffSelectId) {
    const staffSelect = document.getElementById(staffSelectId);
    staffSelect.innerHTML = '';  // Clear the dropdown initially

    // Get the current user's UID from Firebase Authentication (assuming you're using Firebase)
    const user = auth.currentUser;
    if (!user) {
        console.error('User not authenticated');
        return;
    }

    const userUid = user.uid;

    try {
        // Fetch the user's staff document based on their UID
        const staffDoc = await getDoc(doc(db, "STAFF", userUid));;
        if (!staffDoc.exists) {
            console.error('No staff document found for the user');
            return;
        }

        const userStaffName = staffName; // Assuming 'staffName' field exists

        // Add placeholder as the default option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = 'Select a Staff';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        staffSelect.appendChild(placeholderOption);

        // Add each staff member as an option
        for (const [id, name] of Object.entries(staffMap)) {
            const option = document.createElement('option');
            option.value = id;  // Set the document ID as the value
            option.textContent = name;  // Display staff name as the text

            // Set the current user's staffName as the default selected option
            if (name === userStaffName) {
                option.selected = true;
            }

            staffSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error retrieving staff information:', error);
    }
}

async function deleteProd(companyID, prodID) {
    showCustomAlert('Deleting product, please wait...', () => {}); // Show loading message

    try {
        // 1. Query all TESTING documents that reference the prodID
        const testingQuery = query(collection(db, 'TESTING'), where('prodID', '==', prodID));
        const testingSnapshot = await getDocs(testingQuery);

        const deletePromises = testingSnapshot.docs.map(async (testingDoc) => {  // Renamed 'doc' to 'testingDoc'
            const testingData = testingDoc.data();
            const chargeID = testingData.chargeID; // Retrieve the chargeID from TESTING document

            // 3. Fetch the associated CHARGE document
            const chargeDocRef = doc(db, 'CHARGE', chargeID); // Use 'doc()' correctly here
            const chargeDocSnap = await getDoc(chargeDocRef);

            if (chargeDocSnap.exists()) {
                const chargeData = chargeDocSnap.data();

                // 4. Only delete the TESTING document if payStatus is not 'COMPLETED' and resultStatus is not 'ONGOING' or 'COMPLETED'
                if (chargeData.payStatus !== 'COMPLETED' &&
                    testingData.resultStatus !== 'ONGOING' &&
                    testingData.resultStatus !== 'COMPLETED') {
                    
                    // Delete the TESTING document
                    await deleteDoc(testingDoc.ref); // Use 'testingDoc.ref' to delete the TESTING document

                    // Delete the CHARGE document
                    await deleteDoc(chargeDocRef); // Delete the CHARGE document
                }
            }
        });

        // 5. Wait for all TESTING documents to be deleted
        await Promise.all(deletePromises);

        // 6. Delete the PRODUCT document
        const prodDocRef = doc(db, 'PRODUCT', prodID);
        await deleteDoc(prodDocRef); // Delete the PRODUCT document from Firestore

        // 7. Delete the product file from the company folder in Firebase Storage (recursively)
        await deleteFolder(`COMPANY/${companyID}/SAMPLE/${prodID}`);

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} deleted sample ${prodID} at ${timestamp}`);

        // 8. Hide the loading alert, show success modal
        hideCustomAlert();
        showModal('deleteProd2'); // Show success modal
    } catch (error) {
        // In case of error, hide the loading alert and log the error
        hideCustomAlert();
        console.error("Error deleting product:", error);
    }
}

// Recursive function to delete all files in a folder and its subfolders
async function deleteFolder(folderPath) {
    const storageRef = ref(storage, folderPath);

    try {
        // Get a list of all files and subdirectories in the folder
        const listResult = await listAll(storageRef);

        // Delete all files in the folder
        const deletePromises = listResult.items.map(async (itemRef) => {
            await deleteObject(itemRef); // Delete each file
        });

        // Wait for all files to be deleted
        await Promise.all(deletePromises);

        // Recursively delete files in any subfolders
        const subfolderDeletePromises = listResult.prefixes.map((subfolderRef) => {
            return deleteFolder(subfolderRef.fullPath); // Recurse into subfolder
        });

        await Promise.all(subfolderDeletePromises); // Wait for all subfolders to be deleted

    } catch (error) {
        console.error('Error deleting folder from Firebase Storage:', error);
    }
}





async function fetchStaffOptions2(elementID) {
    const staffMap2 = await retrieveStaffsDept();
    populateStaffOptions2(staffMap2, elementID);  // Pass the ID of the dropdown
}

async function fetchStaffOptions3(elementID) {
    const staffMap = await retrieveStaffsDept();
    populateStaffOptions3(staffMap, elementID);  // Pass the ID of the dropdown
}

export{fetchProductsM, editProd, EditProductSubmission, formatDateForInput, addProdSubmission, deleteProd, fetchStaffOptions2, populateStaffOptions2, fetchStaffOptions3, fetchWithCache, deleteFolder};