function animateNumberChange(elementID, newNumber) {
    const element = document.getElementById(elementID);
    const textContent = element.textContent.replace(/,/g, '').trim();
    const currentNumber = Number.isNaN(Number(textContent)) ? 0 : parseInt(textContent, 10);

    const increment = newNumber - currentNumber;
    const absIncrement = Math.abs(increment);

    // Duration is proportional to the size of the change, with a minimum and maximum duration
    const duration = Math.min(2000, Math.max(500, absIncrement * 10));

    const startTime = performance.now();

    function easeOutQuad(t) {
        return t * (2 - t); // Easing function for smoother transitions
    }

    function animate(time) {
        const elapsedTime = time - startTime;
        const progress = Math.min(elapsedTime / duration, 1); // Ensure progress doesn't exceed 1
        const easedProgress = easeOutQuad(progress); // Apply easing

        const currentValue = Math.round(currentNumber + increment * easedProgress);
        element.textContent = formatNumber(currentValue);

        if (progress < 1) {
            requestAnimationFrame(animate); // Continue animation until progress reaches 1
        } else {
            element.textContent = formatNumber(newNumber); // Ensure final value matches
        }
    }

    // Start the animation
    requestAnimationFrame(animate);
}

// Helper function to format numbers with commas
function formatNumber(number) {
    return number.toLocaleString();
}


//set initial date current month of the year
function setInitialDate() {
    const initialDateInput = document.getElementById('initialDate');
    const currentDate = new Date();

    // Get the first day of the current month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Format the date to YYYY-MM-DD without time zone issues
    const year = firstDayOfMonth.getFullYear();
    const month = String(firstDayOfMonth.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
    const day = String(firstDayOfMonth.getDate()).padStart(2, '0'); // Ensure two-digit day

    const formattedDate = `${year}-${month}-${day}`;

    // Set the value of the initialDate input
    initialDateInput.value = formattedDate;
}

function dateListener(num){
    // Add event listeners for initialDate and lastDate changes
    document.getElementById('initialDate').addEventListener('change', function() {
        const initialDateValue = document.getElementById('initialDate').value;
        // Set the min value of lastDate to initialDate
        document.getElementById('lastDate').min = initialDateValue;

        // Automatically adjust the lastDate if it's earlier than the selected initialDate
        if (document.getElementById('lastDate').value && document.getElementById('lastDate').value < initialDateValue) {
            document.getElementById('lastDate').value = initialDateValue;
        }
        if (num === 'dashboard'){
            filterDate(); // Reapply filters after adjusting dates

        }
        else if (num === 'overview'){
            fetchProducts(); // Reapply filters after adjusting dates

        }
        else if (num === 'test'){
            fetchTestings(); // Reapply filters after adjusting dates

        }
        else if (num === 'list'){
            fetchProductsM(); // Reapply filters after adjusting dates

        }
        else if (num === 'invoice'){
            fetchInvoices(); // Reapply filters after adjusting dates

        }
        else if (num === 'PO'){
            fetchPOs(); // Reapply filters after adjusting dates

        }
        
    });

    document.getElementById('lastDate').addEventListener('change', function() {
        const lastDateValue = document.getElementById('lastDate').value;
        // Set the max value of initialDate to lastDate
        document.getElementById('initialDate').max = lastDateValue;

        // Automatically adjust the initialDate if it's later than the selected lastDate
        if (document.getElementById('initialDate').value && document.getElementById('initialDate').value > lastDateValue) {
            document.getElementById('initialDate').value = lastDateValue;
        }
        if (num === 'dashboard'){
            filterDate(); // Reapply filters after adjusting dates

        }
        else if (num === 'overview'){
            fetchProducts(); // Reapply filters after adjusting dates

        }
        else if (num === 'test'){
            fetchTestings(); // Reapply filters after adjusting dates

        }
        else if (num === 'list'){
            fetchProductsM(); // Reapply filters after adjusting dates

        }
        else if (num === 'invoice'){
            fetchInvoices(); // Reapply filters after adjusting dates

        }
        else if (num === 'PO'){
            fetchPOs(); // Reapply filters after adjusting dates

        }
    });
}


function autoFillDate(date) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Add leading zero to month
    const day = String(today.getDate()).padStart(2, '0'); // Add leading zero to day
    const formattedDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
    document.getElementById(date).value = formattedDate; // Set the value of the input field
}

// Function to set today's date as default for date inputs
function setDefaultDates() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = today.getFullYear();

    const formattedDate = `${year}-${month}-${day}`; // Format as YYYY-MM-DD

    document.getElementById('initialDate').value = formattedDate;
    document.getElementById('lastDate').value = formattedDate; // Set both to today's date or adjust as needed
}

function goToLastPage(name) {
    if (name === 'staff') {
        const filteredStaff = getFilteredStaff(); // Assuming this function returns the filtered company list
        const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);
        currentPage = totalPages;
        filterStaff();
    }
    else if (name === 'company'){
        const filteredCompanies = getFilteredCompanies(); // Assuming this function returns the filtered company list
        const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);
        currentPage = totalPages;
        filterTable(); // Call with the updated current page
    }
    else if(name === 'contacts'){
        const filteredContacts = getFilteredContacts(); // Assuming this function returns the filtered company list
        const totalPages = Math.ceil(filteredContacts.length / rowsPerPage);
        currentPage = totalPages;
        filterContacts();
    }
    else if(name === 'overview'){
        const filteredOverview = getFilteredOverview(); // Assuming this function returns the filtered company list
        const totalPages = Math.ceil(filteredOverview.length / rowsPerPage);
        currentPage = totalPages;
        filterProducts();
    }
    else if(name === 'list'){
        const filteredProducts = getFilteredProducts(); // Assuming this function returns the filtered company list
        const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
        currentPage = totalPages;
        filterProductsM();
    }
    else if(name === 'testing'){
        const filteredTestings = getFilterTestings(); // Assuming this function returns the filtered company list
        const totalPages = Math.ceil(filteredTestings.length / rowsPerPage);
        currentPage = totalPages;
        filterTestings();
    }
    else if(name === 'internal'){
        const filteredInternals = getFilteredInternals(); // Assuming this function returns the filtered company list
        const totalPages = Math.ceil(filteredInternals.length / rowsPerPage);
        currentPage = totalPages;
        filterInternal();
    }
    else if(name === 'outsource'){
        const filteredOutsources = getFilteredOutsources(); // Assuming this function returns the filtered company list
        const totalPages = Math.ceil(filteredOutsources.length / rowsPerPage);
        currentPage = totalPages;
        filterOutsources();
    }

    else if(name === 'invoice'){
        const filteredInvoices = getFilterInvoices(); // Assuming this function returns the filtered company list
        const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);
        currentPage = totalPages;
        filterInvoices();
    }
    else if(name === 'PO'){
        const filteredPOs = getFilteredPOs(); // Assuming this function returns the filtered company list
        const totalPages = Math.ceil(filteredPOs.length / rowsPerPage);
        currentPage = totalPages;
        filteredPOs();
    }
}


function goToFirstPage(name) {
    currentPage = 1;
    if (name === 'staff') {
        filterStaff();
    }
    else if (name === 'company'){
        filterTable(); // Call with the updated current page
    }
    else if(name === 'contacts'){
        filterContacts();
    }
    else if(name === 'overview'){
        filterProducts();
    }
    else if(name === 'list'){
        filterProductsM();
    }
    else if(name === 'testing'){
        filterTestings();
    }
    else if(name === 'internal'){
        filterInternal();
    }
    else if(name === 'outsource'){
        filterOutsources();
    }
    else if(name === 'invoice'){
        filterInvoices();
    }
    else if(name === 'PO'){
        filteredPOs();
    }
}
// Function to change page
function changePage(direction, name) {
    currentPage += direction;
    if (name === 'staff') {
        filterStaff();
    }
    else if (name === 'company'){
        filterTable(); // Call with the updated current page
    }
    else if(name === 'contacts'){
        filterContacts();
    }
    else if(name === 'overview'){
        filterProducts();
    }
    else if(name === 'list'){
        filterProductsM();
    }
    else if(name === 'testing'){
        filterTestings();
    }
    else if(name === 'internal'){
        filterInternal();
    }
    else if(name === 'outsource'){
        filterOutsources();
    }
    else if(name === 'invoice'){
        filterInvoices();
    }
    else if(name === 'PO'){
        filteredPOs();
    }
}

function changeTitle(title, subtitle) {
    // Select the elements to be updated
    const titleElement = document.querySelector('.contentTitle h3');
    const subtitleElement = document.querySelector('.contentTitle h6');

    // Update the title text and icon
    titleElement.innerHTML = title;

    // Update the subtitle text
    subtitleElement.textContent = subtitle;
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const addBtn = document.querySelector('.floating-button'); // Select the add button
    const heading = document.getElementById('listHeading');

    if (modal) {
        modal.style.display = 'none';
    }
}

// Function to show the custom alert
function AlertMe(message) {
    showModal("alertUser");
    const Message = document.getElementById('Message');
    Message.innerHTML = message.replace(/\n/g, '<br>'); // Replace newlines with HTML line breaks
}


function hideContainer(containerId) {
    document.getElementById(containerId).classList.add('hidden'); // Adds 'hidden' class
}

function hideSelect2(elementId) {
    const selectElement = $(`#${elementId}`);
    selectElement.select2('destroy'); // Destroy the Select2 instance
    selectElement.addClass('hidden'); // Add the hidden class
}

function showContainer(containerId) {
    document.getElementById(containerId).classList.remove('hidden'); // Removes 'hidden' class
}

function showMe(containerId) {
    document.getElementById(containerId).classList.add('show'); // Adds 'hidden' class
}
function hideMe(containerId) {
    document.getElementById(containerId).classList.remove('show'); // Removes 'hidden' class
}


function showSelect2(elementId) {
    const selectElement = document.getElementById(elementId);
    selectElement.classList.remove('hidden'); // Remove the hidden class
    if (elementId  == 'filterStaff'){
        $(selectElement).select2({ // Reinitialize Select2
            placeholder: 'Select a Staff',
            allowClear: true,
            width: '100%'
        });
    }
    else if(elementId  == 'filterCompany'){
        $(selectElement).select2({ // Reinitialize Select2
            placeholder: 'Select a Company',
            allowClear: true,
            width: '100%'
        });
    }
}

function validatePassword(password) {
    const errors = [];
    if (password.length < 8) errors.push("Password must be at least 8 characters long.");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter.");
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter.");
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number.");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Password must contain at least one special character.");

    return errors;
}


function getStatusHTML(status) {
    let backgroundColor;
    let textColor;

    switch (status) {
        case 'CANCELLED':
            backgroundColor = 'red'; // Semi-transparent white
            textColor = 'white'; // Neon Red
            break;

        case 'ONGOING':
            backgroundColor = '#00d8ff'; // Semi-transparent white
            textColor = 'white'; // Neon Yellow
            break;

        case 'DEPOSIT':
            backgroundColor = 'purple'; // Semi-transparent white
            textColor = 'white'; // Neon Yellow
            break;

        case 'PENDING':
        case 'NOT COMPLETED':
            backgroundColor = '#ff7f00'; // Semi-transparent white
            textColor = 'white'; // Neon Yellow
            break;

        case 'ACTIVE':
        case 'COMPLETED':
            backgroundColor = '#0fce0f'; // Semi-transparent white
            textColor = 'white'; // Neon Green
            break;
            
        default:
            backgroundColor = '#B0BEC5'; // Semi-transparent white
            textColor = 'white'; // Neon Grey
            break;
    }

    return `
        <div style="
            display: inline-block; 
            width: 120px; 
            height: 20px; 
            background-color: ${backgroundColor}; 
            border: 2px solid ${backgroundColor}; 
            border-radius: 15px;
            color: ${textColor}; 
            text-align: center; 
            line-height: 20px;
            font-size: 12px;
            box-shadow: 0 0 5px ${backgroundColor}, 0 0 10px ${backgroundColor}; /* Neon glow effect */
        ">
            ${status}
        </div>
    `;
}

function resetTable(tableID) {
    // Get the table element by its ID
    const table = document.getElementById(tableID);
    
    // Check if the table exists
    if (table) {
        // Clear all rows in the table body (tbody)
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = ''; // Clear all rows
        }
    } else {
        console.error("Table not found with ID:", tableID);
    }
}


function enableEditIN(fieldId) {
    // Get the field by its ID
    const field = document.getElementById(fieldId);

    if (field) {
        if (field.disabled) {
            // If the field is disabled, enable it
            field.disabled = false;

            // Add a class or style to indicate that it's editable
            field.classList.add("editable");
            field.focus(); // Focus the field for convenience

            // Remove any existing validation errors
            field.setCustomValidity(""); 
        } else {
            // If the field is already enabled, disable it
            field.disabled = true;

            // Remove the 'editable' class or style
            field.classList.remove("editable");
        }
    } else {
        console.error(`Field with ID '${fieldId}' not found.`);
    }
}

function updateFileName(input, elementID) {
    const fileNameInput = document.getElementById(elementID);
    const file = input.files[0]; // Get the selected file
    fileNameInput.value = file ? file.name : "No file chosen"; // Update the text field
}

function toggleVisibility(inputId) {
    var passwordInput = document.getElementById(inputId);
    var eyeIcon = document.getElementById('eyeIcon' + capitalizeFirstLetter(inputId));

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.add('bi-eye');
        eyeIcon.classList.remove('bi-eye-slash');
    } else {
        passwordInput.type = "password";
        eyeIcon.classList.add('bi-eye-slash');
        eyeIcon.classList.remove('bi-eye');
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function exportToExcel(data) {
    // Create a new array that includes only the necessary fields
    const filteredData = data.map(item => ({
        'Date of Payment': item.payDate ? item.payDate.toLocaleDateString() : '-',
        'Testing ID': item.prodID,
        'In-House Total': item.inTotal,
        'Outsources Total': item.outTotal,
        'Subtotal': item.subtotal,
        'SST (8%)': item.sst,
        'Total Amount': item.total,
        'Payment Status': item.status,
        'Payment Method': item.method,
    }));

    // Convert the filtered data to a sheet
    const ws = XLSX.utils.json_to_sheet(filteredData);

    // Create a new workbook and append the sheet
    const wb = XLSX.utils.book_new();

    // Get today's date in a readable format
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Append the sheet with the name including today's date
    XLSX.utils.book_append_sheet(wb, ws, `Sales Data (${formattedDate})`);

    // Generate a random number for the file name
    const randomID = Math.floor(Math.random() * 1000000); // Generate a random number between 0 and 999999
    const fileName = `sales_data_${randomID}.xlsx`; // Append random ID to the file name

    // Trigger the file download
    XLSX.writeFile(wb, fileName);
}
