
function addCompany() {
    const tableContainer = document.getElementById('companyTable');
    const formContainer = document.getElementById('addCompanyForm');
    const addBtn = document.querySelector('.floating-button');
    const heading = document.getElementById('listHeading');
    const page = document.getElementById('pagination');
    const filterState = document.getElementById('filterState');
    const search = document.getElementById('searchContainer');

    page.classList.add('hidden');
    filterState.classList.add('hidden');
    search.classList.add('hidden');
    tableContainer.classList.add('hidden');
    addBtn.style.display = 'none';
    changeTitle("Add Company","Clients / Companies / Add Company");
    heading.textContent = 'Add Company';

    setTimeout(() => {
        formContainer.classList.add('active');
        fetchStaffOptions2("staffName");
    }, 500);
}

function cancelAdd() {
    const tableContainer = document.getElementById('companyTable');
    const formContainer = document.getElementById('addCompanyForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading
    const page = document.getElementById('pagination');
    const filterState = document.getElementById('filterState');
    const search = document.getElementById('searchContainer');


    filterState.classList.remove('hidden');
    search.classList.remove('hidden');
    formContainer.classList.remove('active');

    const companyForm = document.getElementById('companyForm');
    companyForm.reset();

    setTimeout(() => {
        tableContainer.classList.remove('hidden');
        changeTitle('<i class="bi bi-building"></i> COMPANIES', 'Clients / Companies');
        heading.textContent = 'List of Companies'; // Restore the original <h1> text
        page.classList.remove('hidden');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}


function cancelUpdate() {
    const tableContainer = document.getElementById('companyTable');
    const formContainer = document.getElementById('updateCompanyForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading
    const page = document.getElementById('pagination');
    const filterState = document.getElementById('filterState');
    const search = document.getElementById('searchContainer');


    filterState.classList.remove('hidden');
    search.classList.remove('hidden');

    formContainer.classList.remove('active');
    // Reset the form fields
    const companyForm = document.getElementById('upCompanyForm');
    companyForm.reset(); // Resets all form fields to default

    setTimeout(() => {
        tableContainer.classList.remove('hidden');
        changeTitle('<i class="bi bi-building"></i> COMPANIES', 'Clients / Companies');
        heading.textContent = 'List of Companies'; // Restore the original <h1> text
        page.classList.remove('hidden');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}


function cancelInfo() {
    const tableContainer = document.getElementById('companyTable');
    const formContainer = document.getElementById('companyInfo');
    const addBtn = document.querySelector('.floating-button'); // Select the add button
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading
    const page = document.getElementById('pagination');
    const filterState = document.getElementById('filterState');
    const search = document.getElementById('searchContainer');


    filterState.classList.remove('hidden');
    search.classList.remove('hidden');
    formContainer.classList.remove('active');

    const companyForm = document.getElementById('companyForm');
    companyForm.reset();

    setTimeout(() => {
        tableContainer.classList.remove('hidden');
        changeTitle('<i class="bi bi-building"></i> COMPANIES', 'Clients / Companies');
        heading.textContent = 'List of Companies'; // Restore the original <h1> text
        page.classList.remove('hidden');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}

function confirmDelete(companyId) {
    showModal('deleteModal');
    const confirmButton = document.getElementById('confirmDeleteButton');
    confirmButton.onclick = function() {
        deleteCompany(companyId);
        closeModal('deleteModal');
    };
}



window.onclick = function(event) {
    const addModal = document.getElementById('addModal');
    const deleteModal = document.getElementById('deleteModal');
    if (event.target === addModal) {
        closeModal('addModal');
    }
    if (event.target === deleteModal) {
        closeModal('deleteModal');
    }
};

// Function to show the custom alert
function showCustomAlert(message, callback) {
    document.getElementById('alertMessage').innerText = message;
    document.getElementById('customAlert').classList.remove('hidden');
    document.getElementById('loadingSpinner').classList.remove('hidden');

    // Start the callback after a delay (simulating some processing or redirection)
        if (typeof callback === 'function') {
            callback();
        }
}


// Function to hide the custom alert
function hideCustomAlert() {
    document.getElementById('customAlert').classList.add('hidden');
    document.getElementById('loadingSpinner').classList.add('hidden');
}

function displayFilteredCompanies(filteredCompanies) {
    const companyTableBody = document.querySelector('#companyTable tbody');
    companyTableBody.innerHTML = '';

    // Calculate start and end index for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredCompanies.length);

    // Loop through the companies for the current page
    filteredCompanies.slice(startIndex, endIndex).forEach((company, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${company.name}</td>
            <td>${company.address}</td>
            <td>${company.email}</td>
            <td>${company.phone}</td>
            <td>${staffMap[company.staff] || 'Unknown Staff'}</td>
            <td>
                <i class="bi bi-pencil-square green-icon edit-icon" title="Edit"></i>
                <i class="bi bi-trash delete-icon" title="Delete"></i>
            </td>
        `;
        companyTableBody.appendChild(row);

        // Row click event to display company information
        row.addEventListener('click', () => displayCompanyInfo(company));

        // Add event listeners for edit and delete icons
        row.querySelector('.edit-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            editItem(company.id);
        });
        row.querySelector('.delete-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDelete(company.id);
        });
    });

    // Update pagination info
    updatePageInfo(filteredCompanies.length);
}


// Function to display company info in the designated area
function displayCompanyInfo(company) {
    
    // Display the modal or info section
    const tableContainer = document.getElementById('companyTable');
    const formContainer = document.getElementById('companyInfo');
    const addBtn = document.querySelector('.floating-button');
    const heading = document.getElementById('listHeading');
    const page = document.getElementById('pagination');
    const filterState = document.getElementById('filterState');
    const search = document.getElementById('searchContainer');

    page.classList.add('hidden');
    filterState.classList.add('hidden');
    search.classList.add('hidden');
    tableContainer.classList.add('hidden');
    addBtn.style.display = 'none';
    changeTitle('<i class="bi bi-building"></i> Company Information', 'Clients / Companies / Details');
    heading.textContent = 'Company Information';

    setTimeout(() => {
        formContainer.classList.add('active');

        const staffName = staffMap[company.staff] || 'Unknown Staff';

        document.getElementById('staff').textContent = staffName;
        document.getElementById('companyName3').textContent = company.name;
        document.getElementById('street3').textContent = company.street;
        document.getElementById('city3').textContent = company.city;
        document.getElementById('postcode3').textContent = company.postcode;
        document.getElementById('state3').textContent = company.state;
        document.getElementById('email3').textContent = company.email;
        document.getElementById('phone3').textContent = company.phone;
    }, 500);
}


function updatePageInfo(filteredCount) {
    const pageInfo = document.querySelector('#pageInfo');
    const companyTableBody = document.querySelector('#companyTable tbody');
    
    if (filteredCount === 0) {
        companyTableBody.innerHTML = '<tr><td colspan="6">No results found</td></tr>';
        // If no companies match the filter
        pageInfo.textContent = `Showing 0 to 0 of 0 companies`;
    } else {
        // Update the text to reflect how many companies are being displayed
        const startIndex = (currentPage - 1) * rowsPerPage + 1;
        const endIndex = Math.min(currentPage * rowsPerPage, filteredCount);

        pageInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${filteredCount} companies`;
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



// This function filters and searches the company list
function filterTable() {
    const searchInput = document.getElementById('companySearch').value.toLowerCase();
    const filterState = document.getElementById('filterState').value;

    const filteredCompanies = companies.filter(company => {
        const staffName = (staffMap[company.staff] || 'Unknown Staff').toLowerCase();
        const companyName = company.name.toLowerCase();
        const companyAddress = company.address.toLowerCase();
        const companyState = company.state.toLowerCase();

        // Check if the search term matches company name or address
        const matchesSearch = companyName.includes(searchInput) || companyAddress.includes(searchInput) || staffName.includes(searchInput);

        // Check if the selected state matches companyState (if a state is selected)
        const matchesState = !filterState || companyState.includes(filterState.toLowerCase());

        // Both search and filter criteria must be true
        return matchesSearch && matchesState;
    });

    // Display the filtered companies on the page
    displayFilteredCompanies(filteredCompanies);
}

// This function filters and returns the filtered companies based on search and filter criteria
function getFilteredCompanies() {
    const searchInput = document.getElementById('companySearch').value.toLowerCase();
    const filterState = document.getElementById('filterState').value;

    return companies.filter(company => {
        const companyName = company.name.toLowerCase();
        const companyAddress = company.address.toLowerCase();
        const companyState = company.state.toLowerCase();

        // Check if the search term matches company name or address
        const matchesSearch = companyName.includes(searchInput) || companyAddress.includes(searchInput);

        // Check if the selected state matches companyState (if a state is selected)
        const matchesState = !filterState || companyState.includes(filterState.toLowerCase());

        // Both search and filter criteria must be true
        return matchesSearch && matchesState;
    });
}