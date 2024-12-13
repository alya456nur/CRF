function filterOutsources() {
    const searchInput = document.getElementById('outsourceSearch').value.toLowerCase();

    const filteredOutsources = outsources.filter(outsource => {
        const outsourceName = outsource.name.toLowerCase();

        const outsourceParam = outsource.parameter.toLowerCase();

        // Check if the search term matches outsource name or address
        const matchesSearch = outsourceName.includes(searchInput) || outsourceParam.includes(searchInput);

        // Both search and filter criteria must be true
        return matchesSearch;
    });

    // Display the filtered companies on the page
    displayFilteredOutsources(filteredOutsources);
}

function getFilteredOutsources() {
    const searchInput = document.getElementById('outsourceSearch').value.toLowerCase();

    return outsources.filter(outsource => {
        const outsourceName = outsource.name.toLowerCase();
        const outsourceParam = outsource.parameter.toLowerCase();

        // Check if the search term matches outsource name or address
        const matchesSearch = outsourceName.includes(searchInput) || outsourceParam.includes(searchInput);

        // Both search and filter criteria must be true
        return matchesSearch;
    });
}

function displayFilteredOutsources(filteredOutsources) {
    const outsourceTableBody = document.querySelector('#outsourceTable tbody');
    outsourceTableBody.innerHTML = '';

    // Calculate start and end index for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredOutsources.length);

    // Loop through the outsources for the current page
    filteredOutsources.slice(startIndex, endIndex).forEach((outsource, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${outsource.name}</td>
            <td>${outsource.parameter.replace(/\n/g, '<br>')}</td>
            <td>RM ${outsource.price}</td>
            <td>
                <i class="bi bi-pencil-square green-icon edit-icon" title="Edit"></i>
                <i class="bi bi-trash delete-icon" title="Delete"></i>
            </td>
        `;
        outsourceTableBody.appendChild(row);

        // Add event listeners for edit and delete icons
        row.querySelector('.edit-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            editOutsource(outsource.id);
        });
        row.querySelector('.delete-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteOut(outsource.id);
        });
    });

    // Update pagination info
    updatePageInfoOut(filteredOutsources.length);       
}

function updatePageInfoOut(filteredCount) {
    const pageInfo = document.querySelector('#pageInfo');
    const outsourceTableBody = document.querySelector('#outsourceTable tbody');
    
    if (filteredCount === 0) {
        outsourceTableBody.innerHTML = '<tr><td colspan="6">No results found</td></tr>';
        // If no outsources match the filter
        pageInfo.textContent = `Showing 0 to 0 of 0 testings`;
    } else {
        // Update the text to reflect how many outsources are being displayed
        const startIndex = (currentPage - 1) * rowsPerPage + 1;
        const endIndex = Math.min(currentPage * rowsPerPage, filteredCount);

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

function confirmDeleteOut(outsourceId) {
    showModal('deleteOut');
    const confirmButton = document.getElementById('confirmDeleteButton');
    confirmButton.onclick = function() {
        deleteOutsource(outsourceId);
        closeModal('deleteOut');
    };
}


function cancelUpdateOut() {
    const formContainer = document.getElementById('updateOutsourceForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button


    formContainer.classList.remove('active');

    showContainer('listHeading');
    showContainer('searchContainer');


    setTimeout(() => {
        changeTitle('<i class="fa-solid fa-vial"></i> PARAMETER LIST', 'Lab Testing / Parameter List / Outsource');
        showContainer('outsourceTable');
        showContainer('pagination');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}

function addOutsource() {
    const formContainer = document.getElementById('addOutsourceForm');
    const addBtn = document.querySelector('.floating-button');

    hideContainer('searchContainer');
    hideContainer('listHeading');
    addBtn.style.display = 'none';
    hideContainer('outsourceTable');
    hideContainer('pagination');
    
    setTimeout(() => {
        changeTitle('Outsource Testing Parameter', 'Lab Testing / Parameter List / Outsource / Add Parameter'); 
        formContainer.classList.add('active');
    }, 500);
}


function cancelAddOut() {
    const formContainer = document.getElementById('addOutsourceForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button


    formContainer.classList.remove('active');

    showContainer('listHeading');
    showContainer('searchContainer');


    setTimeout(() => {
        changeTitle('<i class="fa-solid fa-vial"></i> PARAMETER LIST', 'Lab Testing / Parameter List / Outsource');
        showContainer('outsourceTable');
        showContainer('pagination');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}