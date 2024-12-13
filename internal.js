function filterInternal() {
    const searchInput = document.getElementById('internalSearch').value.toLowerCase();

    const filteredInternals = internals.filter(internal => {
        const internalName = internal.name.toLowerCase();
        const internalParam = internal.parameter.toLowerCase();

        // Check if the search term matches internal name or address
        const matchesSearch = internalName.includes(searchInput) || internalParam.includes(searchInput);

        // Both search and filter criteria must be true
        return matchesSearch;
    });

    // Display the filtered companies on the page
    displayFilteredInternals(filteredInternals);
}

function getFilteredInternals() {
    const searchInput = document.getElementById('internalSearch').value.toLowerCase();

    return internals.filter(internal => {
        const internalName = internal.name.toLowerCase();
        const internalParam = internal.parameter.toLowerCase();

        // Check if the search term matches internal name or address
        const matchesSearch = internalName.includes(searchInput) || internalParam.includes(searchInput);

        // Both search and filter criteria must be true
        return matchesSearch;
    });
}

function displayFilteredInternals(filteredInternals) {
    const internalTableBody = document.querySelector('#internalTable tbody');
    internalTableBody.innerHTML = '';

    // Calculate start and end index for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredInternals.length);

    // Loop through the internals for the current page
    filteredInternals.slice(startIndex, endIndex).forEach((internal, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${internal.name}</td>
            <td>${internal.parameter.replace(/\n/g, '<br>')}</td>
            <td>RM ${internal.price}</td>
            <td>
                <i class="bi bi-pencil-square green-icon edit-icon" title="Edit"></i>
                <i class="bi bi-trash delete-icon" title="Delete"></i>
            </td>
        `;
        internalTableBody.appendChild(row);

        // Add event listeners for edit and delete icons
        row.querySelector('.edit-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            editInternal(internal.id);
        });
        row.querySelector('.delete-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteIn(internal.id);
        });
    });

    // Update pagination info
    updatePageInfoIn(filteredInternals.length);
}

function updatePageInfoIn(filteredInternals) {
    const pageInfo = document.querySelector('#pageInfo');
    const internalTableBody = document.querySelector('#internalTable tbody');
    
    if (filteredInternals === 0) {
        internalTableBody.innerHTML = '<tr><td colspan="6">No results found</td></tr>';
        // If no internals match the filter
        pageInfo.textContent = `Showing 0 to 0 of 0 testings`;
    } else {
        // Update the text to reflect how many internals are being displayed
        const startIndex = (currentPage - 1) * rowsPerPage + 1;
        const endIndex = Math.min(currentPage * rowsPerPage, filteredInternals);

        pageInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${filteredInternals} testings`;
    }

    // Disable/enable pagination buttons based on filtered results
    document.getElementById('firstPage').disabled = currentPage === 1 || filteredInternals === 0;
    document.getElementById('prevPage').disabled = currentPage === 1 || filteredInternals === 0;
    document.getElementById('nextPage').disabled = filteredInternals <= currentPage * rowsPerPage || filteredInternals === 0;
    
    // Calculate total number of pages
    const totalPages = Math.ceil(filteredInternals / rowsPerPage);

    // Disable lastPage button if currentPage is the last page
    document.getElementById('lastPage').disabled = currentPage === totalPages || filteredInternals === 0;

    hideCustomAlert();
}

function confirmDeleteIn(internalId) {
    showModal('deleteIn');
    const confirmButton = document.getElementById('confirmDeleteButton');
    confirmButton.onclick = function() {
        deleteInternal(internalId);
        closeModal('deleteIn');
    };
}


function cancelUpdateIn() {
    const formContainer = document.getElementById('updateInternalForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button


    formContainer.classList.remove('active');

    showContainer('listHeading');
    showContainer('searchContainer');


    setTimeout(() => {
        changeTitle('<i class="fa-solid fa-vial"></i> PARAMETER LIST', 'Lab Testing / Parameter List / Internal');
        showContainer('internalTable');
        showContainer('pagination');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}

function addInternal() {
    const formContainer = document.getElementById('addInternalForm');
    const addBtn = document.querySelector('.floating-button');

    hideContainer('searchContainer');
    hideContainer('listHeading');
    addBtn.style.display = 'none';
    hideContainer('internalTable');
    hideContainer('pagination');
    setTimeout(() => {
        changeTitle('Internal Testing Parameter', 'Lab Testing / Parameter List / Internal / Add Parameter'); 
        formContainer.classList.add('active');
    }, 500);
}


function cancelAddIn() {
    const formContainer = document.getElementById('addInternalForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button


    formContainer.classList.remove('active');

    showContainer('listHeading');
    showContainer('searchContainer');


    setTimeout(() => {
        changeTitle('<i class="fa-solid fa-vial"></i> PARAMETER LIST', 'Lab Testing / Parameter List / Internal');
        showContainer('internalTable');
        showContainer('pagination');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}