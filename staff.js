function addStaff(){
	hideContainer("staffList");

	setTimeout(() => {
		changeTitle('Register Staff','Staff / Staff List / Register Staff');
		showMe("regStaff");
		document.getElementById('staffForm').addEventListener('submit', handleStaffRegister);
    }, 500);
}

function cancelStaff(){
	hideMe("regStaff");

    const staffForm = document.getElementById('staffForm');
    staffForm.reset(); // Resets all form fields to default

	setTimeout(() => {
		changeTitle('<i class="fa-solid fa-users-gear" style="padding: 2px;"></i> STAFF','Staff/Staff List');
		showContainer("staffList");
    }, 500);
}

function editStaff(staffData){
	hideContainer("staffList");

	setTimeout(() => {
		changeTitle('Edit Staff','Staff / Staff List / Edit Staff');
		showMe("updateStaff");
		displayStaff(staffData);
    }, 500);
}

function displayStaff(staffData){ 
	document.getElementById('dept2').value = staffData.dept;

	document.getElementById('FName2').value = staffData.Fname;
	document.getElementById('LName2').value = staffData.Lname;
	document.getElementById('contact2').value = staffData.phone;
	document.getElementById('email2').value = staffData.email;

	// Modify form submission to update the company
    document.getElementById('upStaffForm').onsubmit = function(event) {
        event.preventDefault();
        handleEditStaff(staffData);  // Use the doc.id for submission
    };
}

function cancelUpStaff(){
	hideMe("updateStaff");

	const staffForm = document.getElementById('upStaffForm');
    staffForm.reset(); // Resets all form fields to default

	setTimeout(() => {
		changeTitle('<i class="fa-solid fa-users-gear" style="padding: 2px;"></i> STAFF','Staff/Staff List');
		showContainer("staffList");
    }, 500);
}

function filterStaff() {
    const searchInput = document.getElementById('staffSearch').value.toLowerCase();

    const filteredStaffs = staffs.filter(staff => {
        const staffName = staff.name.toLowerCase();
        const staffDept = staff.dept.toLowerCase();

        // Check if the search term matches company name or address
        const matchesSearch = staffName.includes(searchInput) || staffDept.includes(searchInput);
        // Both search and filter criteria must be true
        return matchesSearch;
    });

    // Display the filtered companies on the page
    displayFilteredStaffs(filteredStaffs);
}

function displayFilteredStaffs(filteredStaffs) {
    const staffTableBody = document.querySelector('#staffTable tbody');
    staffTableBody.innerHTML = '';

    // Calculate start and end index for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredStaffs.length);

    // Loop through the staffs for the current page
    filteredStaffs.slice(startIndex, endIndex).forEach((staff, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${staff.name}</td>
            <td>${staff.dept}</td>
            <td>${staff.email}</td>
            <td>${staff.phone}</td>
            <td>
                <i class="bi bi-pencil-square green-icon edit-icon" title="Edit"></i>
                <i class="bi bi-trash delete-icon" title="Delete"></i>
            </td>
        `;
        staffTableBody.appendChild(row);

        // Add event listeners for edit and delete icons
        row.querySelector('.edit-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            editStaff(staff);
        });
        row.querySelector('.delete-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            confirmDeleteStaff(staff.id);
        });
    });

    // Update pagination info
    updatePageInfoS(filteredStaffs.length);
}


function updatePageInfoS(filteredCount) {
    const pageInfo = document.querySelector('#pageInfo');
    const staffTableBody = document.querySelector('#staffTable tbody');
    
    if (filteredCount === 0) {
        staffTableBody.innerHTML = '<tr><td colspan="6">No results found</td></tr>';
        // If no companies match the filter
        pageInfo.textContent = `Showing 0 to 0 of 0 staff`;
    } else {
        // Update the text to reflect how many companies are being displayed
        const startIndex = (currentPage - 1) * rowsPerPage + 1;
        const endIndex = Math.min(currentPage * rowsPerPage, filteredCount);

        pageInfo.textContent = `Showing ${startIndex} to ${endIndex} of ${filteredCount} staffs`;
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


function confirmDeleteStaff(staffId) {
    showModal('deleteStaff');
    const confirmButton = document.getElementById('confirmDeleteButton');
    confirmButton.onclick = function() {
        deleteStaff(staffId);
        closeModal('deleteStaff');
    };
}

function getFilteredStaff() {
    const searchInput = document.getElementById('staffSearch').value.toLowerCase();

    return staffs.filter(staff => {
        const staffName = staff.name.toLowerCase();
        const staffDept = staff.dept.toLowerCase();

        // Check if the search term matches staff name or address
        const matchesSearch = staffName.includes(searchInput) || staffDept.includes(searchInput);
        // Both search and filter criteria must be true
        return matchesSearch;
    });
}