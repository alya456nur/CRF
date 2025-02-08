function filterInvoices() {
    const searchInput = document.getElementById('chargeSearch').value.toLowerCase();
    const filterCompany = document.getElementById('filterCompany').value;
    const filterStatus = document.getElementById('filterStatus').value;

    const filteredCharges = charges.filter(charge => {
        const companyName = (companyMap[charge.companyID] || 'Unknown Company').toLowerCase();
        const companyName2 = (companyMap[filterCompany] || 'Unknown Company').toLowerCase();
        const name = charge.prodName.toLowerCase();
        const id = charge.prodID.toLowerCase();
        const status = charge.status.toLowerCase();
        

        // Matching criteria for search and filters
        const matchesSearch = !searchInput || companyName.includes(searchInput) || name.includes(searchInput) ||  id.includes(searchInput);
        const matchesCompany = !filterCompany || companyName.includes(companyName2.toLowerCase());
        const matchesResult = !filterStatus || status === filterStatus.toLowerCase();

        return matchesSearch && matchesCompany && matchesResult;
    });


    displayFilteredInvoices(filteredCharges);
}

function displayFilteredInvoices(filteredCharges) {
    const chargeTableBody = document.querySelector('#chargeTable tbody');
    chargeTableBody.innerHTML = '';

    // Calculate start and end index for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredCharges.length);

    // Get the button element
    const exportButton = document.getElementById('exportExcl');

    function exportFile(filteredCharges) {
        exportButton.onclick = function () {
            exportToExcel(filteredCharges);
        };
    }

    exportFile(filteredCharges);


    filteredCharges.slice(startIndex, endIndex).forEach((charge, index) => {
        const row = document.createElement('tr');

        // Check if COA is available
        if (charge.invoice !== '-') {
            const invoiceFilePath = `COMPANY/${charge.companyID}/SAMPLE/${charge.prodID}/INVOICE/${charge.invoice}`;
            invoiceHTML = `
                <a href="#" class="download-invoice" data-invoice="${invoiceFilePath}" title="Download Invoice"><i class="fa-regular fa-file-pdf"></i> </a>
            `;
        } else {
            invoiceHTML = '-';
        }

        // Check if COA is available
        if (charge.proof) {
            const proofFilePath = `COMPANY/${charge.companyID}/SAMPLE/${charge.prodID}/PROOF OF PAYMENT`;
            proofHTML = `
                <a href="#" class="download-pop" data-pop="${proofFilePath}" title="Download POP"><i class="fa-regular fa-file-zipper"></i> </a>
            `;
        } else {
            proofHTML = '-';
        }

        const isCancel = charge.status === 'NOT COMPLETED';
        const isComplete = charge.status === 'COMPLETED';

        const companyName = companyMap[charge.companyID] || 'Unknown Company';
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${charge.prodID}</td>
            <td>${formatDate(charge.register)}</td>
            <td>${companyName}</td>
            <td>${charge.prodName}</td>
            <td>RM ${charge.inTotal}</td>
            <td>RM ${charge.outTotal}</td>
            <td>RM ${charge.subtotal}</td>
            <td>RM ${charge.sst}</td>
            <td>RM ${charge.total}</td>
            <td>${getStatusHTML(charge.status)}</td>
            <td style="text-align: center;">${invoiceHTML}</td>
            <td style="text-align: center;">${proofHTML}</td>
            <td style="text-align: center;">
                <i class="fa-solid fa-arrow-up-from-bracket upload-icon ${!isCancel ? 'disabled-icon' : ''}" title="${isCancel ? 'Upload Invoice' : 'Disabled'}"></i>
            </td>
            <td style="text-align: center;">
                <i class="fa-solid fa-arrow-up-from-bracket upload-pop ${!isComplete ? 'disabled-icon' : ''}" title="${isComplete ? 'Upload POP' : 'Disabled'}"></i>
            </td>
        `;
        chargeTableBody.appendChild(row);

        // Handle COA download event
        if (charge.invoice !== '-') {
            const invoiceLink = row.querySelector('.download-invoice');
            invoiceLink.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the default link behavior
                e.preventDefault(); // Prevent any default navigation
                const invoicePath = invoiceLink.getAttribute('data-invoice');
                generateInvoiceIcon(invoicePath);
            });
        }

        // Handle COA download event
        if (charge.proof) {
            const popLink = row.querySelector('.download-pop');
            popLink.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the default link behavior
                e.preventDefault(); // Prevent any default navigation
                const popPath = popLink.getAttribute('data-pop');
                generatePopIcon(popPath, charge.prodID);
            });
        }

        const uploadIcon = row.querySelector('.upload-icon');
        const uploadPOP= row.querySelector('.upload-pop');

        if (isCancel) {
            // Add event listener for delete icon
            uploadIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                uploadInvoice(charge);
            });
        } else {
            // Add a visual cue to show the icon is disabled (optional)
            uploadIcon.classList.add('disabled');
            uploadIcon.setAttribute('title', 'Disabled');
        }

        if (isComplete) {
            // Add event listener for delete icon
            uploadPOP.addEventListener('click', (e) => {
                e.stopPropagation();
                popFunctions(charge);
            });
        } else {
            // Add a visual cue to show the icon is disabled (optional)
            uploadPOP.classList.add('disabled');
            uploadPOP.setAttribute('title', 'Disabled');
        }

        // Row click event to display charge information
        row.addEventListener('click', () => displayChargeInfo(charge));
    });

    updatePageInfoI(filteredCharges.length);
}

function updatePageInfoI(filteredCount) {
    const pageInfo = document.querySelector('#pageInfo');
    const chargeTableBody = document.querySelector('#chargeTable tbody');
    const startIndex = (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, filteredCount);

    if (filteredCount === 0) {
        chargeTableBody.innerHTML = '<tr><td colspan="12">No results found</td></tr>';
        pageInfo.textContent = `Showing 0 to 0 of 0 charge`;
    } else {
        pageInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${filteredCount} charges`;
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

function getFilterInvoices() {
    const searchInput = document.getElementById('chargeSearch').value.toLowerCase();
    const filterCompany = document.getElementById('filterCompany').value;
    const filterStatus = document.getElementById('filterStatus').value;

    return charges.filter(charge => {
        const companyName = (companyMap[charge.companyID] || 'Unknown Company').toLowerCase();
        const companyName2 = (companyMap[filterCompany] || 'Unknown Company').toLowerCase();
        const staffName = (charge.staffName || 'Unknown Staff').toLowerCase();
        const name = charge.prodName.toLowerCase();
        const id = charge.prodID.toLowerCase();
        const result = charge.status.toLowerCase();
        

        // Matching criteria for search and filters
        const matchesSearch = !searchInput || companyName.includes(searchInput) || name.includes(searchInput) || staffName.includes(searchInput)|| id.includes(searchInput);
        const matchesCompany = !filterCompany || companyName.includes(companyName2.toLowerCase());
        const matchesResult = !filterStatus || result.includes(filterStatus.toLowerCase());

        return matchesSearch && matchesCompany && matchesResult;
    });
}

function displayChargeInfo(chargeData) {
    const formContainer = document.getElementById('displayInvoice');

    hideContainer('exportExcel');

    hideContainer('data');

    hideContainer('filterDate');
    hideContainer('searchContainer');
    hideContainer('filterSearch');
    hideContainer('chargeTable');
    hideContainer('pagination');
    setTimeout(() => {
        changeTitle('Invoice Upload','FINANCE / INVOICE / Invoice Upload'); 
        formContainer.classList.add('active');

        displayCharge(chargeData);
        
    }, 500);
}


function displayCharge(chargeData){
    editCharge(chargeData.chargeID);
    document.getElementById('prodID').textContent = chargeData.prodID;
    document.getElementById('dateRegis').textContent = formatDate(chargeData.register);

    const companyName = companyMap[chargeData.companyID] || 'Unknown Company';
    document.getElementById('companyName').textContent = companyName;
    document.getElementById('prodName').textContent = chargeData.prodName;
    
    checkAndDisplayCOARealTime(chargeData);

    const removeInvoice = document.getElementById('removeInvoice');

    function setSaveOnClick(chargeData) {
        removeInvoice.onclick = function () {
            confirmInvoice(chargeData);
        };
    }
    setSaveOnClick(chargeData);

    const upload = document.getElementById('invoiceUpload');

    function uploadIn(chargeData) {
        upload.onclick = function () {
            uploadInvoice(chargeData);
        };
    }
    uploadIn(chargeData);

    // Select all checkboxes with the class 'paymentCheckbox'
    const paymentCheckboxes = document.querySelectorAll('.paymentCheckbox');

    // Add a click event listener to each checkbox
    paymentCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                // Uncheck all other checkboxes
                paymentCheckboxes.forEach((cb) => {
                    if (cb !== event.target) {
                        cb.checked = false;
                    }
                });

                // Logic to show/hide containers based on the selected checkbox
                if (event.target.id === 'paymentViaPO') {
                    showContainer('addOnDate');
                    hideContainer('depoPercent');
                } else if (event.target.id === 'paymentDeposit') {
                    showContainer('addOnDate');
                    showContainer('depoPercent');
                }
            } else {
                // If both checkboxes are unchecked, hide both containers
                if (![...paymentCheckboxes].some(cb => cb.checked)) {
                    hideContainer('addOnDate');
                    hideContainer('depoPercent');
                }
            }
        });
    });
}


function cancelDisplayInvoice() {
    const formContainer = document.getElementById('displayInvoice');
    const form = document.getElementById('chargeForm');
    
    // Reset the form fields
    form.reset();

    // Reset other dynamic content if necessary
    document.getElementById('prodID').textContent = '';
    document.getElementById('dateRegis').textContent = '';
    document.getElementById('companyName').textContent = '';
    document.getElementById('prodName').textContent = '';
    document.getElementById('remarksInvoice').value = '';
    document.getElementById('invoiceUpload').value = '';
    document.getElementById('invoiceFile').href = '';

    // Hide the form container
    formContainer.classList.remove('active');

    // Show other elements
    showContainer('exportExcel');
    showContainer('data');
    showContainer('filterDate');
    showContainer('searchContainer');
    showContainer('filterSearch');

    setTimeout(() => {
        changeTitle('<i class="fa-solid fa-file-invoice-dollar" style="padding: 2px;"></i>Price for Lab Testing', 'Finance / Invoice');
        showContainer('chargeTable');
        showContainer('pagination');
    }, 500);
}


// Helper function to reset the invoice element
function resetInvoiceElement(elementID) {
    const invoiceElement = document.getElementById(elementID);
    invoiceElement.removeAttribute('href'); // Remove href to disable the link
    invoiceElement.innerHTML = `No file available`;
    invoiceElement.style.pointerEvents = 'none'; // Disable clicking
    invoiceElement.style.cursor = 'default'; // Set default cursor
}

function confirmInvoice(chargeData) {
    showModal('deleteFile');
    const confirmButton = document.getElementById('confirmDeleteButton2');
    confirmButton.onclick = function() {
        removeInvoice(chargeData);
        closeModal('deleteFile');
    };
}