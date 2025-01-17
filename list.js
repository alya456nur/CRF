

function toggleButtons() {
    const buttonGroup = document.querySelector('.button-group');
    buttonGroup.classList.toggle('active');
}

function addProd() {
    const formContainer = document.getElementById('addProductForm');
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading

    hideContainer("AddBUTTON");
    hideContainer('productTable');
    hideContainer('pagination');
    hideContainer('filterDate');
    hideSelect2('filterStaff');
    hideSelect2('filterCompany');
    hideContainer('searchContainer');
    hideContainer('pagination');

    setTimeout(() => {
        changeTitle('Add New Sample', 'Samples / List / Add New Sample');
        heading.textContent = 'Add New Sample'; // Restore the original <h1> text
        formContainer.classList.add('active');
        fetchOptions('companyName'); // Populate the dropdown before setting the default value
        autoFillDate("dateReceived");
    }, 500);
}

function addExistProd() {
    const formContainer = document.getElementById('addExistProductForm');
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading

    hideContainer("AddBUTTON");
    hideContainer('productTable');
    hideContainer('pagination');
    hideContainer('filterDate');
    hideSelect2('filterStaff');
    hideSelect2('filterCompany');
    hideContainer('searchContainer');
    hideContainer('pagination');

    setTimeout(() => {
        changeTitle('Add Existing Sample', 'Samples / List / Add Existing Sample');
        heading.textContent = 'Add Existing Sample (Before 2025)'; // Restore the original <h1> text
        formContainer.classList.add('active');
        fetchOptions('companyNameE'); // Populate the dropdown before setting the default value
        autoFillDate("dateReceivedE");
    }, 500);
}


function confirmDeleteP(companyID,prodId) {
    showModal('deleteProd');
    const confirmButton = document.getElementById('confirmDeleteButton');
    confirmButton.onclick = function() {
        cancelProd(companyID,prodId);
        closeModal('deleteProd');
    };
}

function cancelInfoPM() {
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading
    const formContainer = document.getElementById('productInfo');
    const addBtn = document.querySelector('.floating-button');

    formContainer.classList.remove('active');
    showContainer('filterDate');
    showSelect2('filterStaff');
    showSelect2('filterCompany');
    showContainer('searchContainer');

    setTimeout(() => {
        changeTitle('<i class="bi bi-file-spreadsheet"></i> SAMPLES', 'Samples / List');
        heading.textContent = 'List of Samples'; // Restore the original <h1> text
        addBtn.style.display = 'block';
        showContainer('productTable');
        showContainer('pagination');
    }, 500);
}

function cancelAddL() {
    const formContainer = document.getElementById('addProductForm');
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading


    formContainer.classList.remove('active');



    setTimeout(() => {
        changeTitle('<i class="bi bi-file-spreadsheet"></i> SAMPLES', 'Samples / List');
        heading.textContent = 'List of Samples'; // Restore the original <h1> text
        showContainer("AddBUTTON");
        showContainer('productTable');
        showContainer('filterDate');
        showSelect2('filterStaff');
        showSelect2('filterCompany');
        showContainer('searchContainer');
        showContainer('pagination');
    }, 500);
}

function cancelAddExistL() {
    const formContainer = document.getElementById('addExistProductForm');
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading

    formContainer.classList.remove('active');

    setTimeout(() => {
        changeTitle('<i class="bi bi-file-spreadsheet"></i> SAMPLES', 'Samples / List');
        heading.textContent = 'List of Samples'; // Restore the original <h1> text
        showContainer("AddBUTTON");
        showContainer('productTable');
        showContainer('filterDate');
        showSelect2('filterStaff');
        showSelect2('filterCompany');
        showContainer('searchContainer');
        showContainer('pagination');
    }, 500);
}

function cancelUpdateL() {
    const formContainer = document.getElementById('upProductForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button
    const heading = document.getElementById('listHeading'); // Select the <h1> element with the id listHeading


    formContainer.classList.remove('active');

    showContainer('filterDate');
    showSelect2('filterStaff');
    showSelect2('filterCompany');
    showContainer('searchContainer');


    setTimeout(() => {
        changeTitle('<i class="bi bi-file-spreadsheet"></i> SAMPLES', 'Samples / List');
        heading.textContent = 'List of Samples'; // Restore the original <h1> text
        showContainer('productTable');
        showContainer('pagination');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}

// Adjust the page information display based on filtered product count
function updatePageInfoPM(filteredCount) {
    const pageInfo = document.querySelector('#pageInfo');
    const productTableBody = document.querySelector('#productTable tbody');
    const startIndex = (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, filteredCount);

    if (filteredCount === 0) {
        productTableBody.innerHTML = '<tr><td colspan="8">No results found</td></tr>';
        pageInfo.textContent = `Showing 0 to 0 of 0 samples`;
    } else {
        pageInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${filteredCount} samples`;
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


// Function to display product info in the designated area, including charge data
function displayProductInfoM(product) {
    
    // Display the modal or info section
    const heading = document.getElementById('listHeading');
    const formContainer = document.getElementById('productInfo');
    const addBtn = document.querySelector('.floating-button');

    addBtn.style.display = 'none';
    hideContainer('filterDate');
    hideSelect2('filterStaff');
    hideSelect2('filterCompany');
    hideContainer('searchContainer');


    hideContainer('pagination');
    hideContainer('productTable');


    changeTitle('<i class="bi bi-file-spreadsheet"></i> Sample Information', 'Samples / List / Details');
    heading.textContent = 'Sample Information';

    setTimeout(() => {
        formContainer.classList.add('active');

        const companyName = companyMap[product.company] || 'Unknown Company';
        const staffName = staffMap[product.staff] || 'Unknown Staff';

        // Display product data
        document.getElementById('prodId').textContent = product.id;
        document.getElementById('appearance').textContent = product.appearance;
        document.getElementById('name').textContent = product.name;
        document.getElementById('date').textContent = formatDate(product.date);
        document.getElementById('staff').textContent = staffName;
        document.getElementById('company').textContent = companyName;
    }, 500);
}


// Function to display filtered products in the table
function displayFilteredProductsM(filteredProducts) {
    const productTableBody = document.querySelector('#productTable tbody');
    productTableBody.innerHTML = '';  // Clear the table content

    // Calculate start and end index for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredProducts.length);


    filteredProducts.slice(startIndex, endIndex).forEach((product, index) => {
        const row = document.createElement('tr');

        const isCancel = product.status === 'CANCELLED';

        const companyName = companyMap[product.company] || 'Unknown Company';
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${formatDate(product.date)}</td>
            <td>${companyName || 'Unknown Company'}</td>
            <td>${staffMap[product.staff] || 'Unknown Staff'}</td>
            <td>${getStatusHTML(product.status)}</td>
            <td>
                <i class="bi bi-pencil-square green-icon edit-icon ${isCancel ? 'disabled-icon' : ''}" title="${!isCancel ? 'Edit' : 'Disabled'}"></i>
                <i class="fa-solid fa-ban delete-icon ${isCancel ? 'disabled-icon' : ''}" title="${!isCancel ? 'Cancel' : 'Disabled'}"></i>
            </td>
        `;

        productTableBody.appendChild(row);


        const editBtn = row.querySelector('.edit-icon')

        const deleteBtn = row.querySelector('.delete-icon');

        if (!isCancel) {
            // Add event listeners for edit and delete icons
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editProd(product.id);
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                confirmDeleteP(product.company,product.id);
            });
        } else {
            // Add a visual cue to show the icon is disabled (optional)
            editBtn.classList.add('disabled');
            editBtn.setAttribute('title', 'Disabled');

            // Add a visual cue to show the icon is disabled (optional)
            deleteBtn.classList.add('disabled');
            deleteBtn.setAttribute('title', 'Disabled');
        }

        // Row click event to display product information
        row.addEventListener('click', () => displayProductInfoM(product));
    });

    updatePageInfoPM(filteredProducts.length);
}

// Function to filter products and update the display
function filterProductsM() {
    const searchInput = document.getElementById('productSearch').value.toLowerCase();
    const filterStaff = document.getElementById('filterStaff').value;
    const filterCompany = document.getElementById('filterCompany').value;

    const filteredProducts = products.filter(product => {
        const companyName = (companyMap[product.company] || 'Unknown Company').toLowerCase();
        const companyName2 = (companyMap[filterCompany] || 'Unknown Company').toLowerCase();
        const staffName = (staffMap[product.staff] || 'Unknown Staff').toLowerCase();
        const staffName2 = (staffMap[filterStaff] || 'Unknown Staff').toLowerCase();
        const name = product.name.toLowerCase();
        const id = product.id.toLowerCase();
        
        // Convert Firestore timestamp to JavaScript Date
        const productDate = product.date; // Assuming product.date is a Firestore Timestamp

        // Matching criteria for search and filters
        const matchesSearch = !searchInput || companyName.includes(searchInput) || name.includes(searchInput) || staffName.includes(searchInput)|| id.includes(searchInput);
        const matchesStaff = !filterStaff || staffName.includes(staffName2.toLowerCase());
        const matchesCompany = !filterCompany || companyName.includes(companyName2.toLowerCase());

        return matchesSearch && matchesStaff && matchesCompany;
    });

    displayFilteredProductsM(filteredProducts);
}

function getFilteredProducts() {
    const searchInput = document.getElementById('productSearch').value.toLowerCase();
    const filterStaff = document.getElementById('filterStaff').value;
    const filterCompany = document.getElementById('filterCompany').value;
    return products.filter(product => {
        const companyName = (companyMap[product.company] || 'Unknown Company').toLowerCase();
        const companyName2 = (companyMap[filterCompany] || 'Unknown Company').toLowerCase();
        const staffName = (staffMap[product.staff] || 'Unknown Staff').toLowerCase();
        const staffName2 = (staffMap[filterStaff] || 'Unknown Staff').toLowerCase();
        const name = product.name.toLowerCase();
        const id = product.id.toLowerCase();
        
        // Convert Firestore timestamp to JavaScript Date
        const productDate = product.date; // Assuming product.date is a Firestore Timestamp

        // Matching criteria for search and filters
        const matchesSearch = !searchInput || companyName.includes(searchInput) || name.includes(searchInput) || staffName.includes(searchInput)|| id.includes(searchInput);
        const matchesStaff = !filterStaff || staffName.includes(staffName2.toLowerCase());
        const matchesCompany = !filterCompany || companyName.includes(companyName2.toLowerCase());

        return matchesSearch && matchesStaff && matchesCompany;
    });
}


// Function to populate dropdown options
function populateStaffOptions3(staffMap, staffSelectId) {
    const staffSelect = document.getElementById(staffSelectId);
    staffSelect.innerHTML = '';  // Clear the dropdown initially

    // Add placeholder as the default option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select a Staff';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    staffSelect.appendChild(placeholderOption);

    // Add each staff as an option
    for (const [id, name] of Object.entries(staffMap)) {
        const option = document.createElement('option');
        option.value = id;  // Set the document ID as the value
        option.textContent = name;  // Display staff name as the text
        staffSelect.appendChild(option);
    }

    // If the selected value is null or empty, reset to default "Select a Staff"
    if (!staffSelect.value) {
        staffSelect.value = ''; // Ensure the default option is selected if no valid value
    }
}

