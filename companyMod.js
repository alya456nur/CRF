// Import the necessary Firebase modules
import { app, db, Timestamp, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, onSnapshot,ref, listAll, deleteObject,storage } from "./firebase-config.js";


// Save company data in an array
async function fetchCompanies() {
    showCustomAlert('Fetching companies, please wait...', () => { });
    if (unsubscribe) unsubscribe();
    const companyTableBody = document.querySelector('#companyTable tbody');
    companyTableBody.innerHTML = '';  // Clear the table before populating

    try {
        // Set up a real-time listener for the COMPANY collection
        const companyCollectionRef = collection(db, 'COMPANY');
        
        // Unsubscribe from any previous listener if needed
        const unsubscribe = onSnapshot(companyCollectionRef, (querySnapshot) => {
            companyTableBody.innerHTML = '';  // Clear table body on each update
            companies = [];  // Reset companies array on each update

            // Populate the companies array with the latest data
            querySnapshot.forEach((doc) => {
                const companyData = doc.data();
                companies.push({
                    id: doc.id,  // Store the Firestore document ID
                    name: companyData.companyName,
                    city: companyData.companyCity,
                    postcode: companyData.companyPostcode,
                    street: companyData.companyStreet,
                    state: companyData.companyState,
                    address: `${companyData.companyStreet}, ${companyData.companyCity}, ${companyData.companyPostcode}, ${companyData.companyState}`,
                    email: companyData.companyEmail,
                    phone: companyData.companyNo,
                    staff: companyData.staffID
                });
            });

            // Sort companies by companyName in ascending order
            companies.sort((a, b) => a.name.localeCompare(b.name));

            // Update the table display in real-time
            filterTable();  // Display filtered table (initially displays all companies)
        });

        // Optionally return unsubscribe function to clean up later
        return unsubscribe;
        
    } catch (error) {
        console.error("Error fetching companies:", error);
    }
}


async function retrieveStaffsDept() {
    const staffMap2 = {};
    try {
        // Query to filter staff by 'staffDept' being 'Marketing'
        const querySnapshot = await getDocs(
            query(collection(db, 'STAFF'), where('staffDept', '==', 'Marketing'))
        );
        
        querySnapshot.forEach((doc) => {
            const staffData = doc.data();
            // Combine Fname and Lname to create staffName
            const staffName = `${staffData.Fname} ${staffData.Lname}`;

            staffMap2[doc.id] = staffName;
        });
    } catch (error) {
        console.error("Error fetching staff:", error);
    }

    return staffMap2;  // Return the map of staff members in Marketing
}


// Handle form submission
async function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission
    showCustomAlert('Adding company, please wait...', () => { });
    
    // Get form values
    const staff = document.getElementById('staffName').value;
    const companyName = document.getElementById('companyName').value;
    const street = document.getElementById('street').value;
    const city = document.getElementById('city').value;
    const postcode = document.getElementById('postcode').value;
    const state = document.getElementById('state').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Add company to Firestore
    try {
        await addDoc(collection(db, 'COMPANY'), {
            companyName: companyName,
            companyStreet: street,
            companyCity: city,
            companyPostcode: postcode,
            companyState: state,
            companyEmail: email,
            companyNo: phone,
            staffID: staff, // Add staffID to the document
        });

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} added a company at ${timestamp}`);

        hideCustomAlert();
        showModal('addModal'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error("Error adding company:", error);
    }

    // Reset the form fields
    const companyForm = document.getElementById('companyForm');
    companyForm.reset(); // Resets all form fields to default

    // Hide form and show the company table again
    const formContainer = document.getElementById('addCompanyForm');
    const tableContainer = document.getElementById('companyTable');
    const addBtn = document.querySelector('.floating-button'); 
    const page = document.getElementById('pagination');
    const filterState = document.getElementById('filterState');
    const search = document.getElementById('searchContainer');


    filterState.classList.remove('hidden');
    search.classList.remove('hidden');

    setTimeout(() => {
        formContainer.classList.remove('active'); 
        changeTitle('<i class="bi bi-building"></i> COMPANIES', 'Clients / Companies');
        tableContainer.classList.remove('hidden');
        page.classList.remove('hidden');
        addBtn.style.display = 'block';
    }, 500);
}


async function editItem(companyId) {
    try {
        // Fetch the company from Firestore using the companyId
        const companyDocRef = doc(db, 'COMPANY', companyId);
        const companyDoc = await getDoc(companyDocRef);

        if (!companyDoc.exists()) {
            console.error('Company not found');
            return;
        }

        const companyToEdit = companyDoc.data(); // Get the company data

        // Populate the form with the selected company's data
        document.getElementById('companyName2').value = companyToEdit.companyName || '';
        document.getElementById('street2').value = companyToEdit.companyStreet || '';
        document.getElementById('city2').value = companyToEdit.companyCity || '';
        document.getElementById('postcode2').value = companyToEdit.companyPostcode || '';
        document.getElementById('email2').value = companyToEdit.companyEmail || '';
        document.getElementById('phone2').value = companyToEdit.companyNo || '';

        // Populate the dropdown and set the default company value
        await fetchStaffOptions3("staffName2");
        const staffSelect = document.getElementById('staffName2');
        staffSelect.value = companyToEdit.staffID || ''; // Set the value of the select element to the contact's companyID


        // Automatically select the correct option in the 'state' dropdown
        const stateSelect = document.getElementById('state2');
        stateSelect.value = companyToEdit.companyState || ''; // Set the value of the select element

        // Check if the provided state is a valid option
        if (!Array.from(stateSelect.options).some(option => option.value === companyToEdit.companyState)) {
            console.error('Invalid state value');
        }

        // Show the form for editing
        const formContainer = document.getElementById('updateCompanyForm');
        const tableContainer = document.getElementById('companyTable');
        const addBtn = document.querySelector('.floating-button'); 
        const page = document.getElementById('pagination');
        const filterState = document.getElementById('filterState');
        const search = document.getElementById('searchContainer');


        filterState.classList.add('hidden');
        search.classList.add('hidden');
        changeTitle('Edit Company', 'Clients / Companies / Edit Company'); 
        tableContainer.classList.add('hidden');
        addBtn.style.display = 'none';
        page.classList.add('hidden');

        // Show the form with a small delay for animation effect
        setTimeout(() => {
            formContainer.classList.add('active');
        }, 500);

        // Modify form submission to update the company
        document.getElementById('upCompanyForm').onsubmit = function(event) {
            event.preventDefault();
            handleEditSubmission(companyId);  // Use the doc.id for submission
        };

    } catch (error) {
        console.error('Error fetching company data:', error);
    }
}



async function handleEditSubmission(companyId) {
    showCustomAlert('Updating company, please wait...', () => {});

    // Get form values
    const staff = document.getElementById('staffName2').value;
    const companyName = document.getElementById('companyName2').value;
    const street = document.getElementById('street2').value;
    const city = document.getElementById('city2').value;
    const postcode = document.getElementById('postcode2').value;
    const state = document.getElementById('state2').value;
    const email = document.getElementById('email2').value;
    const phone = document.getElementById('phone2').value;

    // Check if state is valid
    const stateSelect = document.getElementById('state2');
    if (!Array.from(stateSelect.options).some(option => option.value === state)) {
        console.error('Invalid state value:', state);
        hideCustomAlert();
        return;
    }

    try {
        // Update the company data in Firestore using the document ID
        const companyDocRef = doc(db, 'COMPANY', companyId);
        await updateDoc(companyDocRef, {
            staffID: staff,
            companyName: companyName,
            companyStreet: street,
            companyCity: city,
            companyPostcode: postcode,
            companyState: state,
            companyEmail: email,
            companyNo: phone,
        });

        hideCustomAlert();
        showModal('editModal'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error(`Error updating company with ID ${companyId}:`, error);
    }

    const timestamp = new Date().toLocaleString(); // Get current time
    addNotification(`${staffName} updated company ${companyName} at ${timestamp}`);

    // Reset the form fields
    const companyForm = document.getElementById('upCompanyForm');
    companyForm.reset(); // Resets all form fields to default

    // Hide form and show the company table again
    const formContainer = document.getElementById('updateCompanyForm');
    const tableContainer = document.getElementById('companyTable');
    const addBtn = document.querySelector('.floating-button'); 
    const page = document.getElementById('pagination');
    const filterState = document.getElementById('filterState');
    const search = document.getElementById('searchContainer');


    filterState.classList.remove('hidden');
    search.classList.remove('hidden');

    setTimeout(() => {
        tableContainer.classList.remove('hidden');
        formContainer.classList.remove('active');
        changeTitle('<i class="bi bi-building"></i> COMPANIES', 'Clients / Companies'); 

        page.classList.remove('hidden');
        addBtn.style.display = 'block';
    }, 500);
}




async function deleteCompany(companyId) {
    showCustomAlert('Deleting company, please wait...', () => {}); // Show loading message
    
    try {
        
        // 1. Get all related documents that need to be deleted
        // Get all products associated with the company
        const productsQuery = query(collection(db, 'PRODUCT'), where('companyID', '==', companyId));
        const productsSnapshot = await getDocs(productsQuery);
        const productIds = productsSnapshot.docs.map(doc => doc.id);

        // Get all contacts associated with the company
        const contactsQuery = query(collection(db, 'CONTACT'), where('companyID', '==', companyId));
        const contactsSnapshot = await getDocs(contactsQuery);
        const contactIds = contactsSnapshot.docs.map(doc => doc.id);

        // Get all POs associated with the company
        const poQuery = query(collection(db, 'PO'), where('companyID', '==', companyId));
        const poSnapshot = await getDocs(poQuery);
        const poIds = poSnapshot.docs.map(doc => doc.id);

        let chargeDeletions = [];

        // 2. Delete related CHARGE documents with payStatus not 'COMPLETED'
        const chargesQuery = query(collection(db, 'CHARGE'), where('companyID', '==', companyId), where('payStatus', '!=', 'COMPLETED'));
        const chargesSnapshot = await getDocs(chargesQuery);
        
        chargeDeletions = chargesSnapshot.docs.map(doc => deleteDoc(doc.ref));


        // 3. Check if productIds is not empty before querying TESTING
        let testingDeletions = [];
        if (productIds.length > 0) {
            const testingQuery = query(collection(db, 'TESTING'), where('prodID', 'in', productIds));
            const testingSnapshot = await getDocs(testingQuery);
            
            testingDeletions = testingSnapshot.docs.map(doc => deleteDoc(doc.ref));
        } else {
            console.log("No products found for this company, skipping TESTING deletions.");
        }

        // 4. Perform all deletions asynchronously
        await Promise.all([
            ...chargeDeletions, // Update CHARGE documents
            ...testingDeletions, // Delete TESTING documents (only if not empty)
            ...poIds.map(poId => deleteDoc(doc(db, 'PO', poId))), // Delete PO documents
            ...contactIds.map(contactId => deleteDoc(doc(db, 'CONTACT', contactId))), // Delete CONTACT documents
            ...productIds.map(productId => deleteDoc(doc(db, 'PRODUCT', productId))) // Delete PRODUCT documents
        ]);
        

        // 5. Delete the company folder in Firebase Storage
        const companyFolderRef = ref(storage, `COMPANY/${companyId}`);

        // Recursive function to delete files in subfolders
        async function deleteFilesInFolder(folderRef) {
            const listResult = await listAll(folderRef); // List all items in the current folder

            // Delete each file in the folder
            const deleteFilesPromises = listResult.items.map(fileRef => deleteObject(fileRef));
            await Promise.all(deleteFilesPromises);

            // Recursively delete files in subfolders
            const subfolders = listResult.prefixes;
            for (let subfolder of subfolders) {
                await deleteFilesInFolder(subfolder); // Recursively delete files in subfolder
            }
        }

        // Start deletion of files from the company folder
        await deleteFilesInFolder(companyFolderRef);


        // 6. Finally, delete the company document itself
        const companyDocRef = doc(db, 'COMPANY', companyId);
        const companyDoc = await getDoc(companyDocRef);
        const companyName = companyDoc.data().companyName;

        await deleteDoc(companyDocRef); // Delete the company document

        const timestamp = new Date().toLocaleString(); // Get current time
        addNotification(`${staffName} deleted company ${companyName} at ${timestamp}`);

        hideCustomAlert(); // Hide loading alert
        showModal('deleteModal2'); // Show success modal
    } catch (error) {
        hideCustomAlert(); // Hide loading in case of error
        console.error("Error deleting company:", error); // Log error for debugging
    }
}




export{fetchCompanies, handleFormSubmission, handleEditSubmission, deleteCompany, editItem, retrieveStaffsDept};