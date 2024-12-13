// Import the necessary Firebase modules
import { app, db, Timestamp, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, onSnapshot } from "./firebase-config.js";


// Save contact data in an array
async function fetchContacts() {
    showCustomAlert('Fetching contacts, please wait...', () => { });
    if (unsubscribe) unsubscribe();
    const contactTableBody = document.querySelector('#contactTable tbody');
    contactTableBody.innerHTML = '';  // Clear the table before populating

    try {
        // Set up a real-time listener for the CONTACT collection
        const contactCollectionRef = collection(db, 'CONTACT');
        
        // Unsubscribe from previous listener if necessary
        const unsubscribe = onSnapshot(contactCollectionRef, (querySnapshot) => {
            // Clear table body and reset contacts array
            contactTableBody.innerHTML = '';  // Reset the table on each update
            contacts = [];  // Reset contacts array

            // Populate the contacts array with the latest data
            querySnapshot.forEach((doc) => {
                const contactData = doc.data();
                contacts.push({
                    id: doc.id,  // Store the Firestore document ID
                    company: contactData.companyID,
                    name: contactData.contactName,
                    email: contactData.contactEmail,
                    phone: contactData.contactNo
                });
            });

            // Sort contacts by contactName in ascending order
            contacts.sort((a, b) => a.name.localeCompare(b.name));

            // Update the table display in real-time
            filterContacts();  // Display filtered table (initially displays all contacts)
        });

        // Optionally return unsubscribe function to clean up later
        return unsubscribe;

    } catch (error) {
        console.error("Error fetching contacts:", error);
    }
}



async function fetchComContact() {

    try {
        const querySnapshot = await getDocs(collection(db, 'COMPANY'));

        querySnapshot.forEach((doc) => {
            const companyData = doc.data();
            const id = doc.id;
            companyMap[doc.id] = companyData.companyName;
        });

    } catch (error) {
        console.error("Error fetching companies:", error);
    }
}

async function retrieveCompanies() {
    const companyMap = {};

    try {
        const querySnapshot = await getDocs(collection(db, 'COMPANY'));
        
        querySnapshot.forEach((doc) => {
            const companyData = doc.data();
            companyMap[doc.id] = companyData.companyName;
        });
    } catch (error) {
        console.error("Error fetching companies:", error);
    }

    return companyMap;  // Return the map of companies
}


// Main function to handle fetching and populating company data
async function fetchOptions(elementID) {
    const companyMap = await retrieveCompanies();
    populateCompanyOptions(companyMap, elementID);  // Pass the ID of the dropdown
}

// Handle form submission
async function addContactSubmission(event) {
    event.preventDefault(); // Prevent default form submission
    showCustomAlert('Adding contact, please wait...', () => { });
    
    // Get form values
    const contactName = document.getElementById('contactName').value;
    const companyID = document.getElementById('company').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Add contact to Firestore
    try {
        await addDoc(collection(db, 'CONTACT'), {
            companyID: companyID,
            contactName: contactName,
            contactEmail: email,
            contactNo: phone,
        });

        hideCustomAlert();
        showModal('addContact'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error("Error adding contact:", error);
    }

    // Reset the form fields
    const contactForm = document.getElementById('contactForm');
    contactForm.reset(); // Resets all form fields to default

    // Hide form and show the contact table again
    const formContainer = document.getElementById('addContactForm');
    const tableContainer = document.getElementById('contactTable');
    const addBtn = document.querySelector('.floating-button'); 
    const page = document.getElementById('pagination');
    const search = document.getElementById('searchContainer');


    search.classList.remove('hidden');

    formContainer.classList.remove('active'); 
    changeTitle('<i class="bi bi-file-person"></i> CONTACTS', 'Clients / Contacts');

    setTimeout(() => {
        tableContainer.classList.remove('hidden');
        page.classList.remove('hidden');
        addBtn.style.display = 'block';
    }, 500);
}


async function editContact(contactId) {
    try {
        // Fetch the contact from Firestore using the contactId
        const contactDocRef = doc(db, 'CONTACT', contactId);
        const contactDoc = await getDoc(contactDocRef);

        if (!contactDoc.exists()) {
            console.error('Contact not found');
            return;
        }

        const contactToEdit = contactDoc.data(); // Get the contact data

        // Populate the form with the selected contact's data
        document.getElementById('contactName2').value = contactToEdit.contactName || '';
        document.getElementById('email2').value = contactToEdit.contactEmail || '';
        document.getElementById('phone2').value = contactToEdit.contactNo || '';

        // Populate the dropdown and set the default company value
        await fetchOptions('company2'); // Populate the dropdown before setting the default value
        const companySelect = document.getElementById('company2');
        companySelect.value = contactToEdit.companyID || ''; // Set the value of the select element to the contact's companyID

        // Initialize Select2 to ensure the selected value is displayed correctly
        $(companySelect).select2({
            placeholder: 'Select a Company',
            allowClear: true,
            width: '100%'  // Adjust the width as needed
        }).val(contactToEdit.companyID).trigger('change'); // Set and trigger Select2 to update the display

        // Check if the provided companyID is a valid option
        if (!Array.from(companySelect.options).some(option => option.value === contactToEdit.companyID)) {
            console.error('Invalid company value');
        }

        // Show the form for editing
        const formContainer = document.getElementById('updateContactForm');
        const tableContainer = document.getElementById('contactTable');
        const addBtn = document.querySelector('.floating-button'); 
        const page = document.getElementById('pagination');
        const search = document.getElementById('searchContainer');

        search.classList.add('hidden');
        changeTitle('Edit Contact', 'Clients / Contacts / Edit Contact'); 
        tableContainer.classList.add('hidden');
        addBtn.style.display = 'none';
        page.classList.add('hidden');

        // Show the form with a small delay for animation effect
        setTimeout(() => {
            formContainer.classList.add('active');
        }, 500);

        // Modify form submission to update the contact
        document.getElementById('upContactForm').onsubmit = function(event) {
            event.preventDefault();
            EditContactSubmission(contactId);  // Use the doc.id for submission
        };

    } catch (error) {
        console.error('Error fetching contact data:', error);
    }
}



async function EditContactSubmission(contactId) {
    showCustomAlert('Updating contact, please wait...', () => {});

    // Get form values
    const contactName = document.getElementById('contactName2').value;
    const company = document.getElementById('company2').value;
    const email = document.getElementById('email2').value;
    const phone = document.getElementById('phone2').value;

    // Check if state is valid
    const companySelect = document.getElementById('company2');
    if (!Array.from(companySelect.options).some(option => option.value === company)) {
        console.error('Invalid state value:', company);
        hideCustomAlert();
        return;
    }

    try {
        // Update the contact data in Firestore using the document ID
        const contactDocRef = doc(db, 'CONTACT', contactId);
        await updateDoc(contactDocRef, {
            companyID: company,
            contactName: contactName,
            contactEmail: email,
            contactNo: phone,
        });

        hideCustomAlert();
        showModal('editTest'); // Show success modal
    } catch (error) {
        hideCustomAlert();
        console.error(`Error updating contact with ID ${contactId}:`, error);
    }

    // Reset the form fields
    const contactForm = document.getElementById('upContactForm');
    contactForm.reset(); // Resets all form fields to default

    // Hide form and show the contact table again
    const formContainer = document.getElementById('updateContactForm');
    const tableContainer = document.getElementById('contactTable');
    const addBtn = document.querySelector('.floating-button'); 
    const page = document.getElementById('pagination');
    const search = document.getElementById('searchContainer');


    search.classList.remove('hidden');
    formContainer.classList.remove('active');
    changeTitle('<i class="bi bi-file-person"></i> CONTACTS', 'Clients / Contacts'); 

    setTimeout(() => {
        tableContainer.classList.remove('hidden');
        page.classList.remove('hidden');
        addBtn.style.display = 'block';
    }, 500);
}




async function deleteContact(contactId) {
    showCustomAlert('Deleting contact, please wait...', () => {}); // Show loading message
    
    try {
        const contactDocRef = doc(db, 'CONTACT', contactId); // Firestore reference to the contact
        await deleteDoc(contactDocRef); // Delete the contact document from Firestore
        
        hideCustomAlert(); // Hide the loading alert
        showModal('deleteModal2'); // Show success modal
    } catch (error) {
        hideCustomAlert(); // Hide loading in case of error
        console.error("Error deleting contact:", error); // Log error for debugging
    }
}


export{fetchContacts, addContactSubmission, EditContactSubmission, deleteContact, editContact, retrieveCompanies, fetchComContact, fetchOptions};