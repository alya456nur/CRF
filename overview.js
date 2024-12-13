


// Adjust the page information display based on filtered product count
function updatePageInfoP(filteredCount) {
    const pageInfo = document.querySelector('#pageInfo');
    const productTableBody = document.querySelector('#productTable tbody');
    const startIndex = (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, filteredCount);

    if (filteredCount === 0) {
        productTableBody.innerHTML = '<tr><td colspan="8">No results found</td></tr>';
        pageInfo.textContent = `Showing 0 to 0 of 0 testings`;
    } else {
        pageInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${filteredCount} testings`;
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



// Function to display filtered products in the table
function displayFilteredProducts(filteredProducts) {
    const productTableBody = document.querySelector('#productTable tbody');
    productTableBody.innerHTML = '';  // Clear the table content

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredProducts.length);


    filteredProducts.slice(startIndex, endIndex).forEach((product, index) => {
        const row = document.createElement('tr');

        const companyName = companyMap[product.company] || 'Unknown Company';
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${product.id}</td>
            <td>${product.prodName}</td>
            <td>${formatDate(product.date)}</td>
            <td>${companyName || 'Unknown Company'}</td>
            <td>${staffMap[product.staff] || 'Unknown Staff'}</td>
            <td>${getStatusHTML(product.result)}</td>
            <td>${getStatusHTML(product.pay)}</td>
        `;

        productTableBody.appendChild(row);
    });

    updatePageInfoP(filteredProducts.length);
}


// Function to filter products and update the display
function filterProducts() {
    
    const searchInput = document.getElementById('productSearch').value.toLowerCase();
    const filterStaff = document.getElementById('filterStaff').value;
    const filterResult = document.getElementById('filterResult').value;
    const filterPay = document.getElementById('filterPay').value;
    const filterCompany = document.getElementById('filterCompany').value;
    const initialDate = new Date(document.getElementById('initialDate').value);
    const lastDate = new Date(document.getElementById('lastDate').value);

    const filteredProducts = overviews.filter(product => {
        const companyName = (companyMap[product.company] || 'Unknown Company').toLowerCase();
        const companyName2 = (companyMap[filterCompany] || 'Unknown Company').toLowerCase();
        const staffName = (staffMap[product.staff] || 'Unknown Staff').toLowerCase();
        const staffName2 = (staffMap[filterStaff] || 'Unknown Staff').toLowerCase();
        const name = product.prodName.toLowerCase();
        const id = product.id.toLowerCase();
        
        // Convert Firestore timestamp to JavaScript Date
        const productDate = product.date; // Assuming product.date is a Firestore Timestamp

        // Date range check (only apply if dates are selected)
        const withinDateRange = (isNaN(initialDate) || productDate >= initialDate) &&
                                (isNaN(lastDate) || productDate <= lastDate);

        // Matching criteria for search and filters
        const matchesSearch = !searchInput || companyName.includes(searchInput) || name.includes(searchInput) || staffName.includes(searchInput)|| id.includes(searchInput);
        const matchesStaff = !filterStaff || staffName.includes(staffName2.toLowerCase());
        const matchesResult = !filterResult || product.result === filterResult;
        const matchesPay = !filterPay || product.pay === filterPay;
        const matchesCompany = !filterCompany || companyName.includes(companyName2.toLowerCase());

        return matchesSearch && matchesStaff && matchesResult && matchesPay && matchesCompany && withinDateRange;
    });

    displayFilteredProducts(filteredProducts);
}

function getFilteredOverview(){
    
    const searchInput = document.getElementById('productSearch').value.toLowerCase();
    const filterStaff = document.getElementById('filterStaff').value;
    const filterResult = document.getElementById('filterResult').value;
    const filterPay = document.getElementById('filterPay').value;
    const filterCompany = document.getElementById('filterCompany').value;
    const initialDate = new Date(document.getElementById('initialDate').value);
    const lastDate = new Date(document.getElementById('lastDate').value);

    return overviews.filter(product => {
        const companyName = (companyMap[product.company] || 'Unknown Company').toLowerCase();
        const companyName2 = (companyMap[filterCompany] || 'Unknown Company').toLowerCase();
        const staffName = (staffMap[product.staff] || 'Unknown Staff').toLowerCase();
        const staffName2 = (staffMap[filterStaff] || 'Unknown Staff').toLowerCase();
        const name = product.prodName.toLowerCase();
        const id = product.id.toLowerCase();
        
        // Convert Firestore timestamp to JavaScript Date
        const productDate = product.date; // Assuming product.date is a Firestore Timestamp

        // Date range check (only apply if dates are selected)
        const withinDateRange = (isNaN(initialDate) || productDate >= initialDate) &&
                                (isNaN(lastDate) || productDate <= lastDate);

        // Matching criteria for search and filters
        const matchesSearch = !searchInput || companyName.includes(searchInput) || name.includes(searchInput) || staffName.includes(searchInput)|| id.includes(searchInput);
        const matchesStaff = !filterStaff || staffName.includes(staffName2.toLowerCase());
        const matchesResult = !filterResult || product.result === filterResult;
        const matchesPay = !filterPay || product.pay === filterPay;
        const matchesCompany = !filterCompany || companyName.includes(companyName2.toLowerCase());

        return matchesSearch && matchesStaff && matchesResult && matchesPay && matchesCompany && withinDateRange;
    });
}

// Function to populate dropdown options
function populateStaffOptions(staffMap, staffSelectId) {
    const staffSelect = document.getElementById(staffSelectId);
    staffSelect.innerHTML = '';  // Clear the dropdown initially

    // Add placeholder as the default option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select a Staff';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    staffSelect.appendChild(placeholderOption);

    // Add each company as an option
    for (const [id, name] of Object.entries(staffMap)) {
        const option = document.createElement('option');
        option.value = id;  // Set the document ID as the value
        option.textContent = name;  // Display companyName as the text
        staffSelect.appendChild(option);
    }

    // Initialize Select2 on the company select element after options are loaded
    $(staffSelect).select2({
        placeholder: 'Select a Staff',
        allowClear: true,
        width: '100%'  // Adjust the width as needed
    });
}





