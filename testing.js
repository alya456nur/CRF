function autoZero(){
    resetInputsToZero();

    document.getElementById('discount').addEventListener('blur', function () {
        // Check if the input is empty
        if (this.value.trim() === '') {
            this.value = 0; // Set to 0 if empty
        }
    });

    document.getElementById('discount2').addEventListener('blur', function () {
        // Check if the input is empty
        if (this.value.trim() === '') {
            this.value = 0; // Set to 0 if empty
        }
    });

    // Add event listeners for input changes
    document.getElementById("inTotal").addEventListener("input", calculateTotal);
    document.getElementById("outTotal").addEventListener("input", calculateTotal);
    document.getElementById("subTotal").addEventListener("input", calculateTotal);
    document.getElementById("sst").addEventListener("input", calculateTotal);
    document.getElementById("discount").addEventListener("input", calculateTotal);

    document.getElementById("inTotal2").addEventListener("input", calculateTotal2);
    document.getElementById("outTotal2").addEventListener("input", calculateTotal2);
    document.getElementById("subTotal2").addEventListener("input", calculateTotal2);
    document.getElementById("sst2").addEventListener("input", calculateTotal2);
    document.getElementById("discount2").addEventListener("input", calculateTotal2);

}


function resetInputsToZero() {
    // Select all input fields you want to reset
    const inputs = document.querySelectorAll('#inTotal, #outTotal, #subTotal, #sst, #discount, #Total, #inTotal2, #outTotal2, #subTotal2, #sst2, #discount2, #Total2');
    
    // Loop through each input and set its value to 0
    inputs.forEach(input => {
        input.value = 0;
    });
}

function calculateTotal() {
    // Get values of inputs
    const inTotal = parseFloat(document.getElementById("inTotal").value) || 0;
    const outTotal = parseFloat(document.getElementById("outTotal").value) || 0;
    const discount = parseFloat(document.getElementById("discount").value) || 0;

    const subtotal = inTotal + outTotal;

    const sst = subtotal * 0.08;

    // Calculate total
    const total = (subtotal + sst) - discount;

    // Update the field
    document.getElementById("subTotal").value = subtotal.toFixed(2); // Display value with 2 decimal points
    document.getElementById("sst").value = sst.toFixed(2); // Display value with 2 decimal points
    document.getElementById("Total").value = total.toFixed(2); // Display value with 2 decimal points
}

function calculateTotal2() {
    // Get values of inputs
    const inTotal = parseFloat(document.getElementById("inTotal2").value) || 0;
    const outTotal = parseFloat(document.getElementById("outTotal2").value) || 0;
    const discount = parseFloat(document.getElementById("discount2").value) || 0;

    const subtotal = inTotal + outTotal;

    const sst = subtotal * 0.08;

    // Calculate total
    const total = (subtotal + sst) - discount;

    // Update the field
    document.getElementById("subTotal2").value = subtotal.toFixed(2); // Display value with 2 decimal points
    document.getElementById("sst2").value = sst.toFixed(2); // Display value with 2 decimal points
    document.getElementById("Total2").value = total.toFixed(2); // Display value with 2 decimal points
}

// Function to update the total price
function updateTotalPrice(elementID,priceChange) {
    const totalInput = document.getElementById(elementID); // Get the inTotal input field
    let currentTotal = parseFloat(totalInput.value) || 0; // Get the current total or default to 0

    currentTotal += priceChange; // Update the total with the price change (add or subtract)
    totalInput.value = currentTotal.toFixed(2); // Update the input with the new total, rounded to 2 decimal places

    if(elementID === 'inTotal' || elementID === 'outTotal'){
        calculateTotal();
    }
    else if(elementID === 'inTotal2' || elementID === 'outTotal2'){
        calculateTotal2();
    }
}

function resetForm(elementID) {
    const form = document.getElementById(elementID);

    // Reset all form fields to their default values
    form.reset();

    if (elementID === 'testForm') {
        document.getElementById("itemID").textContent = "";
        document.getElementById("staffName").textContent = "";
        // Clear dynamically added rows in tables
        document.querySelector("#contactName tbody").innerHTML = "";
        document.querySelector("#inTest tbody").innerHTML = "";
        document.querySelector("#outTest tbody").innerHTML = "";

        // Reset dropdowns that have options populated dynamically
        document.getElementById("company").innerHTML = '<option value="">Select a company</option>';
        document.getElementById("sample").innerHTML = '<option value="">Select a sample</option>';
        document.getElementById("inName").innerHTML = '<option value="">Select a test</option>';
        document.getElementById("outName").innerHTML = '<option value="">Select a test</option>';
    }


    else if (elementID === 'upTestForm') {
        document.getElementById("itemID3").textContent = "";
        document.getElementById("staffName3").textContent = "";
        // Clear dynamically added rows in tables
        document.querySelector("#contactName3 tbody").innerHTML = "";
        document.querySelector("#inTest3 tbody").innerHTML = "";
        document.querySelector("#outTest3 tbody").innerHTML = "";

        // Reset dropdowns that have options populated dynamically
        document.getElementById("company3").innerHTML = '<option value="">Select a company</option>';
        document.getElementById("sample3").innerHTML = '<option value="">Select a sample</option>';
        document.getElementById("inName3").innerHTML = '<option value="">Select a test</option>';
        document.getElementById("outName3").innerHTML = '<option value="">Select a test</option>';
    }

    else if (elementID === 'displayTest') {
        // Clear dynamically added rows in tables
        document.querySelector("#contactName2 tbody").innerHTML = "";
        document.querySelector("#inTest2 tbody").innerHTML = "";
        document.querySelector("#outTest2 tbody").innerHTML = "";
    }
}

function getHiddenIDs(tableId) {
    const table = document.getElementById(tableId);
    const hiddenIDs = [];

    // Iterate through all rows in the table body
    const rows = table.getElementsByTagName('tbody')[0].rows;
    for (const row of rows) {
        const hiddenCell = row.cells[0]; // Assuming the hidden ID is in the first cell
        if (hiddenCell && hiddenCell.textContent) {
            hiddenIDs.push(hiddenCell.textContent.trim()); // Add the ID to the array
        }
    }

    return hiddenIDs;
}



function addTest() {
    const formContainer = document.getElementById('addTestingForm');
    const addBtn = document.querySelector('.floating-button');

    hideContainer('data1');
    hideContainer('data2')
    hideContainer('listHeading');
    hideContainer('filterDate');
    hideContainer('searchContainer');
    hideContainer('filterSearch');
    hideContainer('testingTable');
    hideContainer('pagination');
    addBtn.style.display = 'none';
    setTimeout(() => {
        changeTitle('Add New Test','Lab Testing / Testing List / Add New Test'); 
        formContainer.classList.add('active');
        fetchOptions('company');
        fetchInternalOptions('inName');
        fetchOutsourceOptions('outName');
        autoZero();
        document.getElementById('testForm').addEventListener('submit', addTestSubmission);
    }, 500);
}

function cancelAddT() {
    const formContainer = document.getElementById('addTestingForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button


    formContainer.classList.remove('active');

    showContainer('data1');
    showContainer('data2');

    showContainer('listHeading');
    showContainer('filterDate');
    showContainer('searchContainer');
    showContainer('filterSearch');


    resetForm('testForm');

    setTimeout(() => {
        changeTitle('<i class="fa-regular fa-rectangle-list" style="padding: 2px;"></i>Registered Samples', 'Lab Testing / Testing List');
        showContainer('testingTable');
        showContainer('pagination');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}

function editTest2() {
    const formContainer = document.getElementById('updateTestingForm');
    const addBtn = document.querySelector('.floating-button');

    hideContainer('data1');
    hideContainer('data2');

    hideContainer('listHeading');
    hideContainer('filterDate');
    hideContainer('searchContainer');
    hideContainer('filterSearch');
    hideContainer('testingTable');
    hideContainer('pagination');
    addBtn.style.display = 'none';
    setTimeout(() => {
        changeTitle('Edit Test','Lab Testing / Testing List / Edit Test'); 
        formContainer.classList.add('active');
    }, 500);
}


function cancelEditT() {
    const formContainer = document.getElementById('updateTestingForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button


    formContainer.classList.remove('active');

    showContainer('data1');
    showContainer('data2');

    showContainer('listHeading');
    showContainer('filterDate');
    showContainer('searchContainer');
    showContainer('filterSearch');
    showContainer('testingTable');
    showContainer('pagination');


    resetForm('upTestForm');

    setTimeout(() => {
        changeTitle('<i class="fa-regular fa-rectangle-list" style="padding: 2px;"></i>Registered Samples', 'Lab Testing / Testing List');
        showContainer('testingTable');
        showContainer('pagination');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}


function displayTest(testData){
    document.getElementById('itemID2').textContent = testData.prodID;

    document.getElementById('staffName2').textContent = testData.staffName;
    document.getElementById('companyName2').textContent = testData.companyName;
    document.getElementById('companyAddress2').textContent = testData.address;
    document.getElementById('companyPhone2').textContent = testData.phone;
    document.getElementById('companyEmail2').textContent = testData.email;

    fetchContacts2(testData.companyID, 'contactName2');

    document.getElementById('sampleName2').textContent = testData.prodName;
    document.getElementById('appearance2').textContent = testData.appearance;
    document.getElementById('received2').textContent = formatDate2(testData.received);

    const removeOutCOA = document.getElementById('removeOutCOA');
    const removeCOA = document.getElementById('removeCOA');

    function delOutCOA(testData) {
        removeOutCOA.onclick = function () {
            confirmOutCOA(testData);  // Call the removeFile function with specified arguments
        };
    }
    delOutCOA(testData);

    function delCOA(testData) {
        removeCOA.onclick = function () {
            confirmCOA(testData);  // Call the removeFile function with specified arguments
        };
    }
    delCOA(testData);
    
    populateTables2('inTest2', testData.inParam, 'outTest2', testData.outParam);

    checkAndDisplayCOA(testData);

    document.getElementById('labRemarks2').textContent = testData.remarks;

}

function confirmCOA(testData) {
    showModal('deleteFile');
    const confirmButton = document.getElementById('confirmDeleteButton2');
    confirmButton.onclick = function() {
        removeFile('COA', testData);
        closeModal('deleteFile');
    };
}

function confirmOutCOA(testData) {
    showModal('deleteFile');
    const confirmButton = document.getElementById('confirmDeleteButton2');
    confirmButton.onclick = function() {
        removeFile('outCOA', testData); 
        closeModal('deleteFile');
    };
}

function displayTestInfo(testData) {
    const formContainer = document.getElementById('displayTestingForm');
    const addBtn = document.querySelector('.floating-button');

    hideContainer('listHeading');
    hideContainer('filterDate');
    hideContainer('searchContainer');
    hideContainer('filterSearch');
    hideContainer('testingTable');
    hideContainer('pagination');
    addBtn.style.display = 'none';
    setTimeout(() => {
        changeTitle('Sample Testing Request','Lab Testing / Testing List / View More Details'); 
        formContainer.classList.add('active');
        if(testData.result === 'PENDING' && staffDept === "Lab"){
            changeStatus(testData.testID, "ONGOING");
        }
        displayTest(testData);

        const saveButton = document.getElementById('saveData');

        function setSaveOnClick(testData) {
            saveButton.onclick = function () {
                displayTestSubmission(testData);
            };
        }

        setSaveOnClick(testData);

    }, 500);
}

function cancelDisplay() {
    const formContainer = document.getElementById('displayTestingForm');
    const addBtn = document.querySelector('.floating-button'); // Select the add button


    formContainer.classList.remove('active');

    showContainer('data1');
    showContainer('data2')
    showContainer('listHeading');
    showContainer('filterDate');
    showContainer('searchContainer');
    showContainer('filterSearch');
    showContainer('testingTable');
    showContainer('pagination');

    resetForm('displayTest');


    setTimeout(() => {
        changeTitle('<i class="fa-regular fa-rectangle-list" style="padding: 2px;"></i>Registered Samples', 'Lab Testing / Testing List');
        showContainer('testingTable');
        showContainer('pagination');
        addBtn.style.display = 'block'; // Show the add button
    }, 500);
}

function confirmCancel(testId) {
    showModal('deleteTest');
    const confirmButton = document.getElementById('confirmDeleteButton');
    confirmButton.onclick = function() {
        cancelTest(testId);
        closeModal('deleteTest');
    };
}

function filterTestings() {
    const searchInput = document.getElementById('testSearch').value.toLowerCase();
    const filterCompany = document.getElementById('filterCompany').value;
    const filterStatus = document.getElementById('filterStatus').value;

    const filteredTests = testingData.filter(test => {
        const companyName = (companyMap[test.companyID] || 'Unknown Company').toLowerCase();
        const companyName2 = (companyMap[filterCompany] || 'Unknown Company').toLowerCase();
        const staffName = (test.staffName || 'Unknown Staff').toLowerCase();
        const name = test.prodName.toLowerCase();
        const id = test.prodID.toLowerCase();
        const result = test.result.toLowerCase();
        

        // Matching criteria for search and filters
        const matchesSearch = !searchInput || companyName.includes(searchInput) || name.includes(searchInput) || staffName.includes(searchInput)|| id.includes(searchInput);
        const matchesCompany = !filterCompany || companyName.includes(companyName2.toLowerCase());
        const matchesResult = !filterStatus || result.includes(filterStatus.toLowerCase());

        return matchesSearch && matchesCompany && matchesResult;
    });


    displayFilteredTests(filteredTests);
}


function displayFilteredTests(filteredTests) {
    const testingTableBody = document.querySelector('#testingTable tbody');
    testingTableBody.innerHTML = ''; // Clear the table content

    // Calculate start and end index for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredTests.length);

    filteredTests.slice(startIndex, endIndex).forEach((test, index) => {
        const row = document.createElement('tr');


        const companyName = companyMap[test.companyID] || 'Unknown Company';
        const isEditable = test.result === 'PENDING' || test.result === 'ONGOING'; // Check if the test result is PENDING
        const isCancel = test.result === 'PENDING' || test.result === 'ONGOING';

        let coaHTML = '';
        // Check if COA is available
        if (test.COA !== '-') {
            const coaFilePath = `COMPANY/${test.companyID}/SAMPLE/${test.prodID}/COA/${test.COA}`;
            coaHTML = `
                <a href="#" class="download-coa" data-coa="${coaFilePath}" title="Download COA"><i class="bi bi-file-earmark-arrow-down"></i> </a>
            `;
        } else {
            coaHTML = '-';
        }

        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${test.prodID}</td>
            <td>${formatDate(test.register)}</td>
            <td>${test.companyName || 'Unknown Company'}</td>
            <td>${test.prodName}</td>
            <td >${getStatusHTML(test.result)}</td>
            <td style="text-align: center;">${coaHTML}</td>

            <td>
                <i class="bi bi-pencil-square green-icon edit-icon ${!isEditable ? 'disabled-icon' : ''}" title="Edit"></i>
                <i class="fa-solid fa-ban delete-icon ${!isCancel ? 'disabled-icon' : ''}" title="${isCancel ? 'Cancel' : 'Cancel disabled'}"></i>
            </td>
        `;

        testingTableBody.appendChild(row);

        // Handle COA download event
        if (test.COA !== '-') {
            const coaLink = row.querySelector('.download-coa');
            coaLink.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the default link behavior
                e.preventDefault(); // Prevent any default navigation
                const coaPath = coaLink.getAttribute('data-coa');
                generateCOAIcon(coaPath);
            });
        }

        // Get edit icon element
        const editIcon = row.querySelector('.edit-icon');
        const deleteIcon = row.querySelector('.delete-icon');

        // Disable edit icon if test.result is not PENDING
        if (isEditable) {
            editIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                editTest(test);
            });
        } else {
            // Add a visual cue to show the icon is disabled (optional)
            editIcon.classList.add('disabled');
            editIcon.setAttribute('title', 'Edit disabled');
        }

        // Disable delete icon if test.result is not PENDING or ONGOING
        if (isCancel) {
            // Add event listener for delete icon
            row.querySelector('.delete-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                confirmCancel(test);
            });
        } else {
            // Add a visual cue to show the icon is disabled (optional)
            deleteIcon.classList.add('disabled');
            deleteIcon.setAttribute('title', 'Cancel disabled');
        }

        row.addEventListener('click', () => {
            displayTestInfo(test); // Assuming 'test' is the relevant data
        });
    });

    updatePageInfoT(filteredTests.length);
}



function updatePageInfoT(filteredCount) {
    const pageInfo = document.querySelector('#pageInfo');
    const productTableBody = document.querySelector('#testingTable tbody');
    const startIndex = (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, filteredCount);

    if (filteredCount === 0) {
        productTableBody.innerHTML = '<tr><td colspan="8">No results found</td></tr>';
        pageInfo.textContent = `Showing 0 to 0 of 0 testing`;
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

function getFilterTestings() {
    const searchInput = document.getElementById('testSearch').value.toLowerCase();
    const filterCompany = document.getElementById('filterCompany').value;
    const filterStatus = document.getElementById('filterStatus').value;


    return testingData.filter(test => {
        const companyName = (companyMap[test.companyID] || 'Unknown Company').toLowerCase();
        const companyName2 = (companyMap[filterCompany] || 'Unknown Company').toLowerCase();
        const staffName = (test.staffName || 'Unknown Staff').toLowerCase();
        const name = test.prodName.toLowerCase();
        const id = test.prodID.toLowerCase();
        const result = test.result.toLowerCase();
        

        // Matching criteria for search and filters
        const matchesSearch = !searchInput || companyName.includes(searchInput) || name.includes(searchInput) || staffName.includes(searchInput)|| id.includes(searchInput);
        const matchesCompany = !filterCompany || companyName.includes(companyName2.toLowerCase());
        const matchesResult = !filterStatus || result.includes(filterStatus.toLowerCase());

        return matchesSearch && matchesCompany && matchesResult;
    });
}



function populateInternal(internalMap, internalSelectId) {
    const internalSelect = document.getElementById(internalSelectId);
    internalSelect.innerHTML = '';  // Clear the dropdown initially

    // Add placeholder as the default option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select a Test';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    internalSelect.appendChild(placeholderOption);

    // Add each company as an option
    for (const [id, name] of Object.entries(internalMap)) {
        const option = document.createElement('option');
        option.value = id;  // Set the document ID as the value
        option.textContent = name;  // Display companyName as the text
        internalSelect.appendChild(option);
    }

    $(internalSelect).select2({
        placeholder: 'Select a Test',
        allowClear: true,
        width: '100%'  // Adjust the width as needed
    });
}


async function fetchInternalOptions(elementID) {
    const internalMap = await retrieveInternal();
    populateInternal(internalMap, elementID);  // Pass the ID of the dropdown
}


function populateOutsource(outsourceMap, outsourceSelectId) {
    const outsourceSelect = document.getElementById(outsourceSelectId);
    outsourceSelect.innerHTML = '';  // Clear the dropdown initially

    // Add placeholder as the default option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select a Test';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    outsourceSelect.appendChild(placeholderOption);

    // Add each company as an option
    for (const [id, name] of Object.entries(outsourceMap)) {
        const option = document.createElement('option');
        option.value = id;  // Set the document ID as the value
        option.textContent = name;  // Display companyName as the text
        outsourceSelect.appendChild(option);
    }

    $(outsourceSelect).select2({
        placeholder: 'Select a Test',
        allowClear: true,
        width: '100%'  // Adjust the width as needed
    });
}


async function fetchOutsourceOptions(elementID) {
    const outsourceMap = await retrieveOutsource();
    populateOutsource(outsourceMap, elementID);  // Pass the ID of the dropdown
}



function populateProducts(productMap, productSelectId) {
    const productSelect = document.getElementById(productSelectId);
    productSelect.innerHTML = '';  // Clear the dropdown initially

    // Add placeholder as the default option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select a sample';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    productSelect.appendChild(placeholderOption);

    // Add each company as an option
    for (const [id, name] of Object.entries(productMap)) {
        const option = document.createElement('option');
        option.value = id;  // Set the document ID as the value
        option.textContent = name;  // Display companyName as the text
        productSelect.appendChild(option);
    }

    $(productSelect).select2({
        placeholder: 'Select a Sample',
        allowClear: true,
        width: '100%'  // Adjust the width as needed
    });
}

function populateProducts2(productMap, productSelectId, prodID) {
    const productSelect = document.getElementById(productSelectId);
    productSelect.innerHTML = '';  // Clear the dropdown initially

    // Add placeholder as the default option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select a sample';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    productSelect.appendChild(placeholderOption);

    // Add each company as an option
    for (const [id, name] of Object.entries(productMap)) {
        const option = document.createElement('option');
        option.value = id;  // Set the document ID as the value
        option.textContent = name;  // Display companyName as the text
        productSelect.appendChild(option);
    }

    productSelect.value = prodID || '';
    $(productSelect).select2({
        placeholder: 'Select a Sample',
        allowClear: true,
        width: '100%'
    }).val(prodID).trigger('change');
}

async function fetchProductOptions(companyID,elementID) {
    const productMap = await retrieveProducts(companyID);
    populateProducts(productMap, elementID);  // Pass the ID of the dropdown
}

async function fetchProductOptions2(companyID,elementID, prodID) {
    const productMap = await retrieveProducts(companyID);
    populateProducts2(productMap, elementID, prodID);  // Pass the ID of the dropdown
}