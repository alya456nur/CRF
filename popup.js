function toggleDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';

    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.avatar-icon, .avatar-icon *')) {
            const dropdownMenu = document.getElementById('dropdownMenu');
            if (dropdownMenu.style.display === 'block') {
                dropdownMenu.style.display = 'none';
            }
        }
    }
}

function displayNotice(){
    toggleNotificationBar();
    hideNotificationDot();
}

function toggleNotificationBar() {
    const bar = document.getElementById('notificationBar');
    bar.style.display = bar.style.display === 'block' ? 'none' : 'block';

    // Add event listener for clicks outside the notification bar
    document.addEventListener('click', function(event) {
        const bar = document.getElementById('notificationBar');
        const button = document.querySelector('.noti-icon'); // The button that opens the notification bar
        const isRemoveButton = event.target.closest('#removeNoti'); // Check if the clicked element is the removeNoti button

        // Check if the click is outside the bar, not on the button, and not on the removeNoti button
        if (!bar.contains(event.target) && event.target !== button && !isRemoveButton) {
            bar.style.display = 'none';
        }
    });
}



function showNotificationDot() {
    const dot = document.getElementById('notificationDot');
    dot.style.display = 'block';
}

function hideNotificationDot() {
    const dot = document.getElementById('notificationDot');
    dot.style.display = 'none';
}