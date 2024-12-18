

// Function to update the sidebar content based on staffDept
async function updateSidebarForStaffDept(staffDept) {
    const navLinksWrapper = document.querySelector('.nav-links');

    if (!navLinksWrapper) {
        console.error(".nav-links element not found");
        return;
    }

    // Clear existing nav items
    navLinksWrapper.innerHTML = '';

    // Define nav items for different departments
    const deptNavItems = {
        'Marketing': `
            <a href="/"><i class="bi bi-speedometer2" ></i> DASHBOARD </a>

            <a href="#" onclick="highlightActiveLink(event)" data-page="overview"><i class="bi bi-clipboard-data"></i> OVERVIEW </a>

            <div class="nav-item">
                <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="bi bi-folder"></i> CLIENTS <i class="fa-solid fa-chevron-down"></i></a>
                <div class="sub-nav">
                    <a href="#" onclick="highlightActiveLink(event)" data-page="company"><i class="bi bi-building"></i> COMPANIES </a>
                    <a href="#" onclick="highlightActiveLink(event)" data-page="contact"><i class="bi bi-file-person"></i> CONTACTS </a>
                </div>
            </div>


            <a href="#" onclick="highlightActiveLink(event)" data-page="list"><i class="bi bi-archive"></i> SAMPLES </a>


            <div class="nav-item">
                <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="fa-solid fa-flask"></i> LAB TESTING <i class="fa-solid fa-chevron-down"></i></a>
                <div class="sub-nav">
                    <a href="#" onclick="highlightActiveLink(event)" data-page="testing"><i class="bi bi-list-ul"></i> TESTING LIST </a>
                    <div class="nav-item">
                        <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="bi bi-card-list"></i> PARAMETER <i class="fa-solid fa-chevron-down"></i></a>
                        <div class="sub-nav">
                            <a href="#" onclick="highlightActiveLink(event)" data-page="internal"><i class="fa-solid fa-vial"></i>INTERNAL </a>
                            <a href="#" onclick="highlightActiveLink(event)" data-page="outsource"><i class="fa-solid fa-microscope"></i> OUTSOURCES </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nav-item">
                <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="bi bi-calculator-fill"></i> FINANCE <i class="fa-solid fa-chevron-down"></i></a>
                <div class="sub-nav">
                    <a href="#" onclick="highlightActiveLink(event)" data-page="invoice"><i class="fa-solid fa-file-invoice-dollar"></i> INVOICE </a>
                    <a href="#" onclick="highlightActiveLink(event)" data-page="PO"><i class="fa-solid fa-receipt"></i> PURCHASE ORDER (PO) </a>
                </div>
            </div>

            <div class="nav-item">
                <a href="#" onclick="highlightActiveLink(event)" data-page="report"><i class="bi bi-file-earmark-bar-graph"></i> REPORT </a>
            </div>

            <a href="#" onclick="highlightActiveLink(event)" data-page="profile"><i class="bi bi-person"></i> PROFILE </a>

            <a href="javascript:void(0)" onclick="highlightActiveLink(event)" id="logout-link"><i class="bi bi-box-arrow-right"></i> LOGOUT</a>
        `,
        'Lab': `
            <a href="/"><i class="bi bi-speedometer2" ></i> DASHBOARD </a>

            <a href="#" onclick="highlightActiveLink(event)" data-page="overview"><i class="bi bi-clipboard-data"></i> OVERVIEW </a>

            <div class="nav-item">
                <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="fa-solid fa-flask"></i> LAB TESTING <i class="fa-solid fa-chevron-down"></i></a>
                <div class="sub-nav">
                    <a href="#" onclick="highlightActiveLink(event)" data-page="testing"><i class="bi bi-list-ul"></i> TESTING LIST </a>
                    <div class="nav-item">
                        <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="bi bi-card-list"></i> PARAMETER <i class="fa-solid fa-chevron-down"></i></a>
                        <div class="sub-nav">
                            <a href="#" onclick="highlightActiveLink(event)" data-page="internal"><i class="fa-solid fa-vial"></i>INTERNAL </a>
                            <a href="#" onclick="highlightActiveLink(event)" data-page="outsource"><i class="fa-solid fa-microscope"></i> OUTSOURCES </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nav-item">
                <a href="#" onclick="highlightActiveLink(event)" data-page="report"><i class="bi bi-file-earmark-bar-graph"></i> REPORT </a>
            </div>

            <a href="#" onclick="highlightActiveLink(event)" data-page="profile"><i class="bi bi-person"></i> Profile </a>

            <a href="javascript:void(0)" onclick="highlightActiveLink(event)" id="logout-link"><i class="bi bi-box-arrow-right"></i> Logout</a>
        `,
        'Finance': `
            <a href="/"><i class="bi bi-speedometer2" ></i> DASHBOARD </a>

            <a href="#" onclick="highlightActiveLink(event)" data-page="overview"><i class="bi bi-clipboard-data"></i> OVERVIEW </a>

            <div class="nav-item">
                <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="bi bi-calculator-fill"></i> FINANCE <i class="fa-solid fa-chevron-down"></i></a>
                <div class="sub-nav">
                    <a href="#" onclick="highlightActiveLink(event)" data-page="invoice"><i class="fa-solid fa-file-invoice-dollar"></i> INVOICE </a>
                    <a href="#" onclick="highlightActiveLink(event)" data-page="list"><i class="fa-solid fa-receipt"></i> PURCHASE ORDER (PO) </a>
                </div>
            </div>

            <div class="nav-item">
                <a href="#" onclick="highlightActiveLink(event)" data-page="report"><i class="bi bi-file-earmark-bar-graph"></i> REPORT </a>
            </div>

            <a href="#" onclick="highlightActiveLink(event)" data-page="profile"><i class="bi bi-person"></i> Profile </a>

            <a href="javascript:void(0)" onclick="highlightActiveLink(event)" id="logout-link"><i class="bi bi-box-arrow-right"></i> Logout</a>
        `,
        'Admin': `
            <a href="/"><i class="bi bi-speedometer2" ></i> DASHBOARD </a>

            <a href="#" onclick="highlightActiveLink(event)" data-page="overview"><i class="bi bi-clipboard-data"></i> OVERVIEW </a>

            <a href="#" onclick="highlightActiveLink(event)" data-page="staff"><i class="fa-solid fa-users-gear"></i> STAFF </a>

            <div class="nav-item">
                <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="bi bi-folder"></i> CLIENTS <i class="fa-solid fa-chevron-down"></i></a>
                <div class="sub-nav">
                    <a href="#" onclick="highlightActiveLink(event)" data-page="company"><i class="bi bi-building"></i> COMPANIES </a>
                    <a href="#" onclick="highlightActiveLink(event)" data-page="contact"><i class="bi bi-file-person"></i> CONTACTS </a>
                </div>
            </div>

            <a href="#" onclick="highlightActiveLink(event)" data-page="list"><i class="bi bi-archive"></i> SAMPLES </a>

            <div class="nav-item">
                <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="fa-solid fa-flask"></i> LAB TESTING <i class="fa-solid fa-chevron-down"></i></a>
                <div class="sub-nav">
                    <a href="#" onclick="highlightActiveLink(event)" data-page="testing"><i class="bi bi-list-ul"></i> TESTING LIST </a>
                    <div class="nav-item">
                        <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="bi bi-card-list"></i> PARAMETER <i class="fa-solid fa-chevron-down"></i></a>
                        <div class="sub-nav">
                            <a href="#" onclick="highlightActiveLink(event)" data-page="internal"><i class="fa-solid fa-vial"></i>INTERNAL </a>
                            <a href="#" onclick="highlightActiveLink(event)" data-page="outsource"><i class="fa-solid fa-microscope"></i> OUTSOURCES </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="nav-item">
                <a href="javascript:void(0)" onclick="toggleSubNav(event); highlightActiveLink(event)"><i class="bi bi-calculator-fill"></i> FINANCE <i class="fa-solid fa-chevron-down"></i></a>
                <div class="sub-nav">
                    <a href="#" onclick="highlightActiveLink(event)" data-page="invoice"><i class="fa-solid fa-file-invoice-dollar"></i> INVOICE </a>
                    <a href="#" onclick="highlightActiveLink(event)" data-page="PO"><i class="fa-solid fa-receipt"></i> PURCHASE ORDER (PO) </a>
                </div>
            </div>

            <div class="nav-item">
                <a href="#" onclick="highlightActiveLink(event)" data-page="report"><i class="bi bi-file-earmark-bar-graph"></i> REPORT </a>
            </div>

            <a href="javascript:void(0)" onclick="highlightActiveLink(event)" id="logout-link"><i class="bi bi-box-arrow-right"></i> Logout</a>
        `,
        // Add more departments and their respective nav items here...
    };

    // Insert department-specific nav items
    navLinksWrapper.innerHTML = deptNavItems[staffDept] || '<p>No specific nav for this department</p>';
}


// Function to toggle sidebar and store its state
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('main-content-placeholder');
    const topNav = document.getElementById('top-nav');
    sidebar.classList.toggle('active');

    // Check window width to adjust content margin
    if (window.innerWidth > 768) { // Only apply margin shift on larger screens
        if (sidebar.classList.contains('active')) {
            localStorage.setItem('sidebarState', 'expanded');
            content.classList.add('expanded');
            topNav.classList.add('collapsed'); // Full width
        } else {
            localStorage.setItem('sidebarState', 'collapsed');
            content.classList.remove('expanded');
            topNav.classList.remove('collapsed'); // Collapsed
        }
    } else {
        localStorage.setItem('sidebarState', 'collapsed');
        content.classList.remove('expanded');
        topNav.classList.remove('collapsed'); // Collapsed
    }
}

// Function to restore sidebar state from localStorage
function restoreSidebarState() {
    const sidebarState = localStorage.getItem('sidebarState');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('main-content-placeholder');
    const topNav = document.getElementById('top-nav');

    // Check window width to adjust content margin
    if (window.innerWidth > 1080) { // Only apply margin shift on larger screens
        if (sidebarState === 'collapsed') {
            sidebar.classList.remove('active');
            content.classList.remove('expanded');
            topNav.classList.remove('collapsed'); // Apply collapsed styles
        } else {
            sidebar.classList.add('active');
            content.classList.add('expanded');
            topNav.classList.add('collapsed'); // Apply expanded styles
        }
    } else {
        sidebar.classList.add('active');
        content.classList.add('expanded');
        topNav.classList.add('collapsed'); // Apply expanded styles
    }
}


// Function to toggle sub-nav and change the arrow icon
function toggleSubNav(event) {
    const parentLink = event.target.closest('.nav-item').querySelector('a'); // Get the anchor tag
    const subNav = event.target.closest('.nav-item').querySelector('.sub-nav'); // Get the sub-nav
    const chevronIcon = parentLink.querySelector('i.fa-chevron-down, i.fa-chevron-up'); // Get the chevron icon

    // Toggle sub-nav visibility
    subNav.classList.toggle('active');
    
    // Change the chevron icon direction
    if (subNav.classList.contains('active')) {
        // If sub-nav is active, change to up arrow
        chevronIcon.classList.remove('fa-chevron-down');
        chevronIcon.classList.add('fa-chevron-up');
    } else {
        // If sub-nav is not active, change to down arrow
        chevronIcon.classList.remove('fa-chevron-up');
        chevronIcon.classList.add('fa-chevron-down');
    }
    
    // Highlight the active link
    highlightActiveLink(event);
}


// Function to highlight active nav link
function highlightActiveLink(event) {
    event.preventDefault();

    // Remove 'active' class from all nav links
    const allNavLinks = document.querySelectorAll('.nav-links a');
    allNavLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Add 'active' class to the clicked nav link
    const clickedLink = event.target;
    clickedLink.classList.add('active');
}

// Function to close sidebar when clicking outside (mobile only)
function closeSidebar(event) {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');

    if (sidebar.classList.contains('active') && !sidebar.contains(event.target) && !event.target.matches('.menu-toggle')) {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            content.style.marginLeft = "0"; // Keep it aligned on mobile
        }
    }
}


// Add event listener for clicks
document.addEventListener('click', closeSidebar);

// Add event listeners for all nav links to apply highlighting functionality
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', highlightActiveLink);
});
