function filterPO() {
    const searchInput = document.getElementById('chargeSearch').value.toLowerCase();
    const filterCompany = document.getElementById('filterCompany').value;

    const filteredPOs = po.filter(order => {
        const companyName = (companyMap[order.company] || 'Unknown Company').toLowerCase();
        const companyName2 = (companyMap[filterCompany] || 'Unknown Company').toLowerCase();
        const id = order.no.toLowerCase();
        

        // Matching criteria for search and filters
        const matchesSearch = !searchInput || companyName.includes(searchInput) || id.includes(searchInput);
        const matchesCompany = !filterCompany || companyName.includes(companyName2.toLowerCase());

        return matchesSearch && matchesCompany;
    });


    displayFilteredPOs(filteredPOs);
}

function displayFilteredPOs(filteredPOs) {
    const poTableBody = document.querySelector('#POTable tbody');
    poTableBody.innerHTML = '';

    // Calculate start and end index for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredPOs.length);

    filteredPOs.slice(startIndex, endIndex).forEach((po, index) => {
        const row = document.createElement('tr');

        let order = '';
        // Check if COA is available
        if (po.poFile !== '-') {
            const poFilePath = `COMPANY/${po.company}/PO/${po.poFile}`;
            poHTML = `
                <a href="#" class="download-po" data-po="${poFilePath}" title="Download PO"><i class="fa-regular fa-file-pdf"></i> </a>
            `;
        } else {
            poHTML = '-';
        }

        const companyName = companyMap[po.company] || 'Unknown Company';
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${po.no}</td>
            <td>${formatDate(po.poDate)}</td>
            <td>${companyName}</td>
            <td style="text-align: center;">${poHTML}</td>
            <td>
                <i class="fa-solid fa-arrow-up-from-bracket upload-icon" title="Upload PO"></i>
                <i class="bi bi-trash delete-icon" title="Delete"></i>
            </td>
        `;
        poTableBody.appendChild(row);

        // Row click event to display contact information
        row.addEventListener('click', () => displayPOInfo(po));

        if (po.poFile!== '-') {
            const invoiceLink = row.querySelector('.download-po');
            invoiceLink.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the default link behavior
                e.preventDefault(); // Prevent any default navigation
                const invoicePath = invoiceLink.getAttribute('data-po');
                generateInvoiceIcon(invoicePath);
            });
        }

        // Add event listeners for edit and delete icons
        row.querySelector('.upload-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            uploadPO(po);
        });
        row.querySelector('.delete-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeletePO(po.no);
        });
    });

    updatePageInfoPO(filteredPOs.length);
}

function updatePageInfoPO(filteredCount) {
    const pageInfo = document.querySelector('#pageInfo');
    const chargeTableBody = document.querySelector('#POTable tbody');
    const startIndex = (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, filteredCount);

    if (filteredCount === 0) {
        chargeTableBody.innerHTML = '<tr><td colspan="8">No results found</td></tr>';
        pageInfo.textContent = `Showing 0 to 0 of 0 PO`;
    } else {
        pageInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${filteredCount} POs`;
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

function confirmDeletePO(poId) {
    showModal('deletePO');
    const confirmButton = document.getElementById('confirmDeleteButton');
    confirmButton.onclick = function() {
        deletePO(poId);
        closeModal('deletePO');
    };
}

function displayPOInfo(poData) {
    const formContainer = document.getElementById('displayPO');
    const addBtn = document.querySelector('.floating-button'); // Select the add button

    addBtn.style.display = 'none'; // Show the add button
    hideContainer('filterDate');
    hideContainer('searchContainer');
    hideContainer('filterSearch');
    hideContainer('POTable');
    hideContainer('pagination');
    setTimeout(() => {
        changeTitle('Edit Purchase Order (PO)','FINANCE / Purchase Order (PO) / Edit PO'); 
        formContainer.classList.add('active');

        displayPO(poData);
        
    }, 500);
}

function displayPO(poData){
    document.getElementById('poNum').textContent = poData.no;
    document.getElementById('poDate2').value = formatDateForInput(poData.poDate);


   editPO(poData);

    displayPORealTime(poData);

    const removePO = document.getElementById('removePO');

    function poRemove(poNo) {
        removePO.onclick = function () {
            confirmPO(poNo);  // Call the removeFile function with specified arguments
        };
    }
    poRemove(poData.no);

    const poUpload = document.getElementById('poUpload');

    function poAdd(poData) {
        poUpload.onclick = function () {
            // Call the function or perform actions here
            uploadPO(poData);
        };
    }
    poAdd(poData);


    const savePO = document.getElementById('savePO');

    function poSave(poNo) {
        savePO.onclick = function () {
            // Call the function or perform actions here
            displaySubmissionPO(poData.no);
        };
    }
    poSave(poData.no);
}


function cancelDisplayPO(){
    const formContainer = document.getElementById('displayPO');
    const addBtn = document.querySelector('.floating-button'); // Select the add button


    formContainer.classList.remove('active');

    showContainer('filterDate');
    showContainer('searchContainer');
    showContainer('filterSearch');


    setTimeout(() => {
        changeTitle('<i class="fa-solid fa-receipt" style="padding: 2px;"></i> Purchase Order (PO)', 'Finance / Purchase Order (PO)');
        addBtn.style.display = 'block'; // Show the add button
        showContainer('POTable');
        showContainer('pagination');
    }, 500);
}

function addPO(){

    const formContainer = document.getElementById('addPOcont');
    const addBtn = document.querySelector('.floating-button'); // Select the add button

    addBtn.style.display = 'none'; // Show the add button
    hideContainer('filterDate');
    hideContainer('searchContainer');
    hideContainer('filterSearch');
    hideContainer('POTable');
    hideContainer('pagination');
    setTimeout(() => {
        changeTitle('Upload Purchase Order (PO)','FINANCE / Purchase Order (PO) / Upload PO'); 
        formContainer.classList.add('active');
        fetchOptions('company');
        document.getElementById('poForm').addEventListener('submit', addPOSubmission);
    }, 500);

}


function cancelAddPO(){
    const formContainer = document.getElementById('addPOcont');
    const addBtn = document.querySelector('.floating-button'); // Select the add button


    formContainer.classList.remove('active');

    showContainer('filterDate');
    showContainer('searchContainer');
    showContainer('filterSearch');

    const poForm = document.getElementById('poForm');
    poForm.reset();


    setTimeout(() => {
        changeTitle('<i class="fa-solid fa-receipt" style="padding: 2px;"></i> Purchase Order (PO)', 'Finance / Purchase Order (PO)');
        addBtn.style.display = 'block'; // Show the add button
        showContainer('POTable');
        showContainer('pagination');
    }, 500);
}

function confirmPO(poData) {
    showModal('deleteFile');
    const confirmButton = document.getElementById('confirmDeleteButton2');
    confirmButton.onclick = function() {
        removePO(poData);
        closeModal('deleteFile');
    };
}

function getFilteredPOs() {
    const searchInput = document.getElementById('chargeSearch').value.toLowerCase();
    const filterCompany = document.getElementById('filterCompany').value;
    const filterStatus = document.getElementById('filterStatus').value;

    return po.filter(order => {
        const companyName = (companyMap[order.companyID] || 'Unknown Company').toLowerCase();
        const companyName2 = (companyMap[filterCompany] || 'Unknown Company').toLowerCase();
        const name = order.prodName.toLowerCase();
        const id = order.no.toLowerCase();
        

        // Matching criteria for search and filters
        const matchesSearch = !searchInput || companyName.includes(searchInput) || name.includes(searchInput) || id.includes(searchInput);
        const matchesCompany = !filterCompany || companyName.includes(companyName2.toLowerCase());

        return matchesSearch && matchesCompany;
    });
}