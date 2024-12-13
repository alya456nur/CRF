
function addContact() {
    const tableContainer = document.getElementById('contactTable');
    const formContainer = document.getElementById('addContactForm');
    const addBtn = document.querySelector('.floating-button');
    const heading = document.getElementById('listHeading');
    const page = document.getElementById('pagination');
    const search = document.getElementById('searchContainer');

    page.classList.add('hidden');
    search.classList.add('hidden');
    tableContainer.classList.add('hidden');
    addBtn.style.display = 'none';
    changeTitle('Add Contact', 'Clients / Contacts / Add Contact');
    heading.textContent = 'Add Contact';

    setTimeout(() => {
        formContainer.classList.add('active');
        fetchOptions('company');
    }, 500);
}

function cancelAddC() {
    const tableContainer = document.getElementById('contactTable');
    const formContainer = document.getElementById('addContactForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading
    const page = document.getElementById('pagination');
    const search = document.getElementById('searchContainer');


    search.classList.remove('hidden');
    formContainer.classList.remove('active');

    const contactForm = document.getElementById('contactForm');
    contactForm.reset();

    setTimeout(() => {
        tableContainer.classList.remove('hidden');
        changeTitle('<i class="bi bi-file-person"></i> CONTACTS', 'Clients / Contacts');
        heading.textContent = 'List of Contacts'; // Restore the original <h1> text
        page.classList.remove('hidden');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}


function cancelUpdateC() {
    const tableContainer = document.getElementById('contactTable');
    const formContainer = document.getElementById('updateContactForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading
    const page = document.getElementById('pagination');
    const search = document.getElementById('searchContainer');


    search.classList.remove('hidden');

    formContainer.classList.remove('active');
    // Reset the form fields
    const contactForm = document.getElementById('upContactForm');
    contactForm.reset(); // Resets all form fields to default

    setTimeout(() => {
        tableContainer.classList.remove('hidden');
        changeTitle('<i class="bi bi-file-person"></i> CONTACTS', 'Clients / Contacts');
        heading.textContent = 'List of Contacts'; // Restore the original <h1> text
        page.classList.remove('hidden');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}


function cancelInfoC() {
    const tableContainer = document.getElementById('contactTable');
    const formContainer = document.getElementById('contactInfo');
    const addBtn = document.querySelector('.floating-button'); // Select the add button
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading
    const page = document.getElementById('pagination');
    const search = document.getElementById('searchContainer');


    search.classList.remove('hidden');
    formContainer.classList.remove('active');

    const contactForm = document.getElementById('contactForm');
    contactForm.reset();

    setTimeout(() => {
        tableContainer.classList.remove('hidden');
        changeTitle('<i class="bi bi-file-person"></i> CONTACTS', 'Clients / Contacts');
        heading.textContent = 'List of Contacts'; // Restore the original <h1> text
        page.classList.remove('hidden');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}

function confirmDeleteC(contactId) {
    showModal('deleteContact');
    const confirmButton = document.getElementById('confirmDeleteButton');
    confirmButton.onclick = function() {
        deleteContact(contactId);
        closeModal('deleteContact');
    };
}




// Function to populate dropdown options
function populateCompanyOptions(companyMap, companySelectId) {
    const companySelect = document.getElementById(companySelectId);
    companySelect.innerHTML = '';  // Clear the dropdown initially

    // Add placeholder as the default option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select a Company';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    companySelect.appendChild(placeholderOption);

    // Add each company as an option
    for (const [id, name] of Object.entries(companyMap)) {
        const option = document.createElement('option');
        option.value = id;  // Set the document ID as the value
        option.textContent = name;  // Display companyName as the text
        companySelect.appendChild(option);
    }

    // Initialize Select2 on the company select element after options are loaded
    $(companySelect).select2({
        placeholder: 'Select a Company',
        allowClear: true,
        width: '100%'  // Adjust the width as needed
    });
}


function updatePageInfoC(filteredCount) {
    const pageInfo = document.querySelector('#pageInfo');
    const contactTableBody = document.querySelector('#contactTable tbody');
    if (filteredCount === 0) {
        contactTableBody.innerHTML = '<tr><td colspan="6">No results found</td></tr>';
        // If no companies match the filter
        pageInfo.textContent = `Showing 0 to 0 of 0 contacts`;
    } else {
        // Update the text to reflect how many companies are being displayed
        const startIndex = (currentPage - 1) * rowsPerPage + 1;
        const endIndex = Math.min(currentPage * rowsPerPage, filteredCount);

        pageInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${filteredCount} contacts`;
    }

    // Disable/enable pagination buttons based on filtered results
    document.getElementById('firstPage').disabled = currentPage === 1 || filteredCount === 0;
    document.getElementById('prevPage').disabled = currentPage === 1 || filteredCount === 0;
    document.getElementById('nextPage').disabled = filteredCount <= currentPage * rowsPerPage || filteredCount === 0;
    
    // Calculate total number of pages
    const totalPages = Math.ceil(filteredCount / rowsPerPage);

    // Disable lastPage button if currentPage is the last page
    document.getElementById('lastPage').disabled = currentPage === totalPages || filteredCount === 0;
    hideCustomAlert();
}

function displayFilteredContacts(filteredContacts) {
    const contactTableBody = document.querySelector('#contactTable tbody');
    contactTableBody.innerHTML = '';

    // Calculate start and end index for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredContacts.length);

    filteredContacts.slice(startIndex, endIndex).forEach((contact, index) => {
        const row = document.createElement('tr');

        const companyName = companyMap[contact.company] || 'Unknown Company';
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${contact.name}</td>
            <td>${companyName}</td>
            <td>${contact.email}</td>
            <td>${contact.phone}</td>
            <td>
                <i class="bi bi-pencil-square green-icon edit-icon" title="Edit"></i>
                <i class="bi bi-trash delete-icon" title="Delete"></i>
            </td>
        `;
        contactTableBody.appendChild(row);

        // Row click event to display contact information
        row.addEventListener('click', () => displayContactInfo(contact));

        // Add event listeners for edit and delete icons
        row.querySelector('.edit-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            editContact(contact.id);
        });
        row.querySelector('.delete-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteC(contact.id);
        });
    });

    updatePageInfoC(filteredContacts.length);
}

// Function to display contact info in the designated area
function displayContactInfo(contact) {
    
    // Display the modal or info section
    const tableContainer = document.getElementById('contactTable');
    const formContainer = document.getElementById('contactInfo');
    const addBtn = document.querySelector('.floating-button');
    const heading = document.getElementById('listHeading');
    const page = document.getElementById('pagination');
    const search = document.getElementById('searchContainer');

    page.classList.add('hidden');
    search.classList.add('hidden');
    tableContainer.classList.add('hidden');
    addBtn.style.display = 'none';
    changeTitle('<i class="bi bi-file-person"></i> Contact Information', 'Clients / Contacts / Details');
    heading.textContent = 'Contact Information';

    setTimeout(() => {
        formContainer.classList.add('active');

        const companyName = companyMap[contact.company] || 'Unknown Company';

        document.getElementById('contactName3').textContent = contact.name;
        document.getElementById('company3').textContent = companyName;
        document.getElementById('email3').textContent = contact.email;
        document.getElementById('phone3').textContent = contact.phone;
    }, 500);
}



// This function filters and searches the contact list
function filterContacts() {
    const searchInput = document.getElementById('contactSearch').value.toLowerCase();

    // Filter contacts by name and company name
    const filteredContacts = contacts.filter(contact => {
        const contactName = contact.name.toLowerCase();
        const companyName = (companyMap[contact.company] || 'Unknown Company').toLowerCase();

        // Check if the search term matches contact name or company name
        return contactName.includes(searchInput) || companyName.includes(searchInput);
    });

    // Display the filtered contacts
    displayFilteredContacts(filteredContacts);
}


function getFilteredContacts() {
    const searchInput = document.getElementById('contactSearch').value.toLowerCase();

    // Filter contacts by name and company name
    return contacts.filter(contact => {
        const contactName = contact.name.toLowerCase();
        const companyName = (companyMap[contact.company] || 'Unknown Company').toLowerCase();

        // Check if the search term matches contact name or company name
        return contactName.includes(searchInput) || companyName.includes(searchInput);
    });

}