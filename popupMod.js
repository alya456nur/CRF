import { app, db, auth, storage, ref,getDownloadURL, uploadBytes, Timestamp, doc, getDoc,serverTimestamp , query, where, collection, getDocs, addDoc, updateDoc, setDoc, deleteDoc, onSnapshot,  deleteObject, orderBy, writeBatch    } from "./firebase-config.js";


async function loadNotifications(userUID) {
    const notificationList = document.getElementById('notificationList');
    // Preload the ringtone to ensure it plays without delay
    const ringtone = new Audio('audio/notification.wav');
    ringtone.preload = 'auto'; // Preload the audio

    try {
        // Get notifications from Firestore, sorted by timestamp in descending order
        const notifyCollectionRef = collection(db, "STAFF", userUID, "notify");
        const q = query(notifyCollectionRef, orderBy("timestamp", "desc"));

        // Real-time listener to fetch notifications as they change
        onSnapshot(q, async (querySnapshot) => {
            // Clear the existing notifications in the UI before loading the new ones
            notificationList.innerHTML = '';

            // Get all notifications in the snapshot
            const notificationsArray = [];
            querySnapshot.forEach((doc) => {
                notificationsArray.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            // Check if a new notification was added
            if (
                notificationsArray.length > 0 &&
                (!lastNotificationTimestamp || notificationsArray[0].timestamp > lastNotificationTimestamp)
            ) {
                let notificationTimestamp;

                // Check if timestamp is a Firestore Timestamp
                if (notificationsArray[0].timestamp instanceof Timestamp) {
                    notificationTimestamp = notificationsArray[0].timestamp.toDate();
                } else if (notificationsArray[0].timestamp instanceof Date) {
                    notificationTimestamp = notificationsArray[0].timestamp;
                } else {
                    // If it's a Unix timestamp (milliseconds)
                    notificationTimestamp = new Date(notificationsArray[0].timestamp);
                }

                const currentTime = Date.now();

                // Format the timestamp to check within the last minute
                const formattedTimestamp = notificationTimestamp.getTime(); // Get the timestamp in milliseconds


                // Check if the new notification is within the last minute (60000 ms)
                if (currentTime - formattedTimestamp <= 1000) { // 60 * 1000 = 1 minute
                    ringtone.play().catch(error => {
                        console.error("Error playing ringtone:", error);
                    });
                }

                showNotificationDot(); // Show red dot to indicate new notifications

                // Update the last notification timestamp
                lastNotificationTimestamp = notificationsArray[0].timestamp;
            }

            // Check if the number of notifications exceeds the max limit
            if (notificationsArray.length > maxNotifications) {
                // Get the oldest notifications that need to be deleted
                const notificationsToDelete = notificationsArray.slice(maxNotifications);

                // Delete the excess notifications from Firestore
                for (const notification of notificationsToDelete) {
                    try {
                        const docRef = doc(db, "STAFF", userUID, "notify", notification.id);
                        await deleteDoc(docRef);
                    } catch (error) {
                        console.error("Error deleting excess notification:", error);
                    }
                }
            }

            // Update the UI with the latest (up to maxNotifications) notifications
            notificationsArray.slice(0, maxNotifications).forEach((notification) => {
                const newNotification = document.createElement('div');
                newNotification.className = 'notification-item';
                newNotification.setAttribute('data-doc-id', notification.id); // Store the docID in the element
                newNotification.innerHTML = `
                    <span>${notification.message}</span>
                    <button onclick="removeNotification(this, '${userUID}')" id="removeNoti">×</button>
                `;
                notificationList.appendChild(newNotification);
            });

            // Show the red dot if there are notifications
            if (notificationsArray.length > 0) {
                showNotificationDot();
            }
        });
    } catch (error) {
        console.error("Error loading notifications from Firestore:", error);
    }
}


async function addNotification(message) {
    const notificationList = document.getElementById('notificationList');

    const staffCollectionRef = collection(db, "STAFF");
    try {
        const staffSnapshot = await getDocs(staffCollectionRef);

        // Iterate over each staff document and add the notification to their notify sub-collection
        for (const staffDoc of staffSnapshot.docs) {
            const userUID = staffDoc.id;

            // Save the new notification to each user's notify collection
            let docID;
            const timestamp = new Date(); // Get current time
            try {
                const notifyCollectionRef = collection(db, "STAFF", userUID, "notify");
                const docRef = await addDoc(notifyCollectionRef, {
                    message: message,
                    timestamp: timestamp
                });
                docID = docRef.id;
            } catch (error) {
                console.error(`Error saving notification to Firestore for ${userUID}:`, error);
                return; // Stop if Firestore operation fails
            }
        }
    } catch (error) {
        console.error("Error fetching staff documents from Firestore:", error);
    }
}



async function removeNotification(button, userUID) {
    const item = button.parentElement; // Get the notification item element
    const docID = item.getAttribute('data-doc-id'); // Retrieve the Firestore docID
    const index = Array.from(item.parentElement.children).indexOf(item); // Get the index of the item
    notifications.splice(index, 1); // Remove the notification from the array
    item.remove(); // Remove the item from the DOM

    // Remove the notification from Firestore
    try {
        const docRef = doc(db, "STAFF", userUID, "notify", docID);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error removing notification from Firestore:", error);
    }

    // Check if the notifications array is empty
    if (notifications.length === 0) {
        hideNotificationDot();
    }
}


// Clear notifications from Firestore for a specific user
async function clearNotifications(userUID) {
    notifications = []; // Clear local notifications array
    const notificationList = document.getElementById('notificationList');
    notificationList.innerHTML = ''; // Clear the UI list

    // Clear notifications from Firestore
    try {
        const notifyCollectionRef = collection(db, "STAFF", userUID, "notify");
        const querySnapshot = await getDocs(notifyCollectionRef);
        
        // Create a write batch
        const batch = writeBatch(db); // Use writeBatch to perform multiple operations

        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref); // Add the delete operation for each notification
        });

        await batch.commit(); // Commit all batch operations
    } catch (error) {
        console.error("Error clearing notifications from Firestore:", error);
    }

    hideNotificationDot(); // Hide the notification dot
}


export{addNotification, removeNotification, clearNotifications, loadNotifications};