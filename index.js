// Import the necessary Firebase modules
import { app , auth, db, storage,functions,httpsCallable, logEvent, ref,onSnapshot , getDownloadURL, uploadBytes,  doc, query, where, getDoc, collection, getDocs, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged,setPersistence,browserSessionPersistence} from "./firebase-config.js";

import {addNotification, removeNotification, clearNotifications, loadNotifications} from './popupMod.js';

import {fetchStaff, handleEditStaff, handleStaffRegister, deleteStaff,checkIfEmailExists} from './staffMod.js';

import {populateYearOptions, filterDate, populateAll, fetchChartData} from './dashboardMod.js';
import { fetchCompanies, handleFormSubmission, editItem, handleEditSubmission, deleteCompany, retrieveStaffsDept} from './companyMod.js';
import { fetchContacts, addContactSubmission, EditContactSubmission, deleteContact, editContact, retrieveCompanies, fetchComContact, fetchOptions} from './contactMod.js';
import {fetchProducts, fetchStaffProduct, retrieveStaffs, fetchStaffOptions,formatDate} from './overviewMod.js';
import {fetchProductsM, editProd, EditProductSubmission, formatDateForInput, addProdSubmission, addExistProdSubmission , cancelProd, fetchStaffOptions2, populateStaffOptions2, fetchStaffOptions3, fetchWithCache,deleteFolder} from './listMod.js';
import{loadProfileData, saveChanges, submitEmailChange, submitPasswordChange} from './profileMod.js';
import {fetchInternal, deleteInternal, editInternal, handleEditInternal, addInternalSubmission} from './internalMod.js';
import {fetchOutsources, deleteOutsource, editOutsource, handleEditOutsource, addOutsourceSubmission} from './outsourceMod.js';
import {fetchTestings,retrieveInternal, retrieveOutsource, retrieveProducts,fillInfo, fillSample, paramIn, paramOut, addTestSubmission, generateCOAIcon,changeStatus, removeFile,
cancelTest, editTest, fillInfo2, fillSample2, populateTables, formatDate2, fetchContacts2, populateTables2, checkAndDisplayCOA, uploadFile, displayTestSubmission} from './testingMod.js';
import {fetchInvoices, generateInvoiceIcon, uploadInvoice,checkAndDisplayCOARealTime, removeInvoice, displaySubmission,editCharge, generatePopIcon, uploadPop} from './invoiceMod.js';
import {renderChart, listenToCharges } from './reportMod.js';
import {fetchPOs, uploadPO, deletePO,displayPORealTime, removePO, displaySubmissionPO,editPO, addPOSubmission} from './poMod.js';

// Set the authentication persistence to session-based

let isLoggingOut = false; // Flag to check if logout is in progress


// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (isLoggingOut) {
      return;
    }

    if (user) {
      try {
        // Set persistence
        await setPersistence(auth, browserSessionPersistence).catch((error) => {
          console.error("Error setting persistence:", error);
        });

        document.getElementById("top-nav").style.display = "flex";
        document.getElementById("sidebar").style.display = "flex";

        // Set global userId
        userId = user.uid;
        const userDoc = await getDoc(doc(db, "STAFF", userId)); // Accessing the user's staff document

        if (userDoc.exists()) {
          // Set global staffName and staffDept
          staffDept = userDoc.data().staffDept;
          Fname = userDoc.data().Fname;
          Lname = userDoc.data().Lname;

          // Combine First Name and Last Name
          staffName = `${Fname} ${Lname}`; // Concatenate with a space

          // Update username and department elements
          document.getElementById("username").textContent = staffName;
          document.getElementById("department").textContent = staffDept;

          // Set admin role if staffDept is "Admin"
          if (staffDept === "Admin") {
            try {
              // Use Firebase Admin SDK to set custom claims for the user
              const setAdminRole = httpsCallable(functions, 'setAdminRole');
              await setAdminRole({ userId: user.uid});
            } catch (error) {
              console.error("Error setting admin role:", error);
            }
          }

          // Logout handlers
          const logoutLink2 = document.querySelector('#logout2');
          if (logoutLink2) {
              logoutLink2.addEventListener('click', function(event) {
                  event.preventDefault();
                  logoutUser();
              });
          }

          await updateSidebarForStaffDept(staffDept);

          const logoutLink = document.querySelector('#logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(event) {
                  event.preventDefault();
                  logoutUser();
                });
            };

          // Once the user is authenticated and the sidebar is ready, load page content
          await loadPageContent();
          await loadNotifications(userId);
          justWindow();
          loadPics();
        } else {
          console.error("No user document found!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      // Reset global variables if the user is not authenticated
      userId = null;
      staffName = null;
      staffDept = null;

      // Redirect to login page
      window.location.href = '/auth';
    }
  });
});

function justWindow(){
    window.addNotification = addNotification;
    window.removeNotification = removeNotification;
    window.clearNotifications = clearNotifications;
}

async function loadPageContent() {
  // Function to load content based on path after authentication
  let path = window.location.pathname.replace('/', ''); // Get the current path and strip leading '/'
  
  // If the path is empty, set it to the index page (default to 'dashboard')
  if (!path) {
    path = 'dashboard';
  }

  // List of valid paths
  const validPaths = ['contact', 'company', 'dashboard', 'overview', 'list', 'profile', 'internal', 
                      'outsource', 'testing', 'invoice', 'PO', 'report', 'staff'];

  // Check if path is valid, else redirect to '404.html'
  if (!validPaths.includes(path)) {
    window.location.replace('/404.html'); // Redirect to 404 page
  } else {
    await loadContent(path); // Load valid page content
  }
}


export async function snapTest(){
    const testCollectionRef = collection(db, "TESTING");
    // Real-time listener for document count in the "TESTING" collection
    onSnapshot(testCollectionRef, (snapshot) => {
      const testTotal = snapshot.size; // Get the document count
      
      // Get the element where the count is displayed
      const testTotalElement = document.getElementById("testTotal");
      
      // Animate the number change
      animateNumberChange(testTotalElement, testTotal);
    });
}

export async function snapTestStatus(status, elementID) {
  const testCollectionRef = collection(db, "TESTING");

  // Create a query to filter documents where payStatus is 'COMPLETED'
  const completedTestsQuery = query(testCollectionRef, where("payStatus", "==", status));

  // Real-time listener for document count in the "TESTING" collection with payStatus = 'COMPLETED'
  onSnapshot(completedTestsQuery, (snapshot) => {
    const testTotal = snapshot.size; // Get the document count
    
    // Get the element where the count is displayed
    const testTotalElement = document.getElementById(elementID);
    
    // Animate the number change
    animateNumberChange(testTotalElement, testTotal);
  });
}

// Handle link clicks
document.addEventListener('click', function(event) {
    const target = event.target;

    // Use a specific data attribute to distinguish SPA links
    if (target.matches('a[data-page]')) {
        event.preventDefault();  // Prevent full page reload
        const page = target.getAttribute('data-page');  // Get the page from data attribute
        loadContent(page);  // Load the corresponding content
    }
});


// Track user inactivity
let inactivityTime = 0;

function resetTimer() {
    inactivityTime = 0; // Reset the inactivity timer
}

// Event listeners to reset timer on user activity
document.addEventListener('click', resetTimer);
document.addEventListener('keydown', resetTimer);
document.addEventListener('mousemove', resetTimer);
document.addEventListener('touchstart', resetTimer); // For touch devices

// Logout after 30 minutes of inactivity
const inactivityLimit = 30 * 60 * 1000; // 30 minutes in milliseconds
setInterval(() => {
    inactivityTime += 1000; // Increment inactivity time every second
    if (inactivityTime >= inactivityLimit) {
        isLoggingOut = true; // Set the flag before sign-out
        signOut(auth)
        .then(() => {
          showCustomAlert('You have been signed out due to inactivity.')
          window.location.href = '/auth'; // Redirect to login page
        })
        .catch((error) => {
          console.error('Error logging out:', error);
          showCustomAlert('Logout failed. Please try again.');
        })
        .finally(() => {
          isLoggingOut = false; // Reset the flag after sign-out completes
        });
    }
}, 1000); // Check every second


// Handle back/forward button navigation
window.onpopstate = function(event) {
  if (event.state?.page) {
    loadContent(event.state.page); // Load the page stored in the history state
  } else {
    loadContent('dashboard'); // Load default page if no state
  }
};

async function loadPics() {
    const user = auth.currentUser;

    if (user) {
        const uid = user.uid;
        const userDocRef = doc(db, "STAFF", uid);

        try {
            // Check for profile picture in Firebase Storage
            const profilePicRef = ref(storage, `Staff/${uid}/pics`);
            const avatarImgs = document.querySelectorAll(".avatar-icon"); // Select both elements

            // Try to get the picture URL
            try {
                const profilePicUrl = await getDownloadURL(profilePicRef);

                // Update both the top nav and sidebar profile picture
                avatarImgs.forEach(avatarImg => {
                    avatarImg.innerHTML = `<img src="${profilePicUrl}" alt="Profile Picture" class="profile-pic">`;
                });
            } catch (error) {
                console.error("Profile picture not found, using default icon:");
                
                // Fallback to default icon for both elements
                avatarImgs.forEach(avatarImg => {
                    avatarImg.innerHTML = `<i class="bi bi-person"></i>`; // fallback to person icon
                });
            }
        } catch (error) {
            console.error("Error fetching document:", error);
        }
    } else {
        console.error("User not authenticated");
    }
}



// Function to load content dynamically only for logged-in users
async function loadContent(page) {
    try{
        const response = await fetch(`${page}.html`);
    
        if (!response.ok) {
          throw new Error('Page not found');
        }

        const data = await response.text();
        document.getElementById('main-content-placeholder').innerHTML = data;
        currentPage = 1;
            
        // Only push state if it’s a new page
        if (window.history.state?.page !== page) {
            window.history.pushState({ page }, '', `/${page}`);
        }

        if (page === 'dashboard') {
            window.listenToCharges = listenToCharges;
            window.renderChart = renderChart;
            window.filterDate = filterDate;
            window.fetchChartData = fetchChartData;
            
            dateListener('dashboard');
            setInitialDate();
            populateAll();
        }
        else if (page === 'staff'){
            window.handleEditStaff = handleEditStaff;
            window.handleStaffRegister = handleStaffRegister;
            window.deleteStaff = deleteStaff;
            window.checkIfEmailExists = checkIfEmailExists;

            fetchStaff();
        }
        // Additional page-specific logic
        else if (page === 'company') {
            window.deleteCompany = deleteCompany;
            window.handleEditSubmission = handleEditSubmission;
            window.editItem = editItem;
            window.fetchStaffOptions2 = fetchStaffOptions2;
            window.populateStaffOptions2 = populateStaffOptions2;
            window.fetchStaffOptions3 = fetchStaffOptions3;
            window.retrieveStaffs = retrieveStaffs;
            window.retrieveStaffsDept = retrieveStaffsDept;

            fetchStaffProduct();
            fetchCompanies();
            document.getElementById('companyForm').addEventListener('submit', handleFormSubmission);
        } else if (page === 'contact') {
            window.deleteContact = deleteContact;
            window.EditContactSubmission = EditContactSubmission;
            window.editContact = editContact;
            window.retrieveCompanies = retrieveCompanies;
            window.fetchOptions = fetchOptions;

            fetchComContact();
            fetchContacts();
            document.getElementById('contactForm').addEventListener('submit', addContactSubmission);
        } else if (page === 'overview') {
            window.retrieveStaffs = retrieveStaffs;
            window.fetchStaffOptions = fetchStaffOptions;
            window.formatDate = formatDate;
             window.fetchProducts = fetchProducts;

            dateListener('overview');
            setInitialDate();
            fetchStaffProduct();
            fetchComContact();
            fetchProducts();
            fetchStaffOptions('filterStaff');
            fetchOptions('filterCompany');
        } else if (page === 'list') {
            window.retrieveStaffs = retrieveStaffs;
            window.formatDate = formatDate;
            window.editProd = editProd;
            window.EditProductSubmission = EditProductSubmission;
            window.fetchOptions = fetchOptions;
            window.formatDateForInput = formatDateForInput;
            window.addProdSubmission = addProdSubmission;
            window.cancelProd = cancelProd;
            window.fetchStaffOptions2 = fetchStaffOptions2;
            window.populateStaffOptions2 = populateStaffOptions2;
            window.fetchStaffOptions3 = fetchStaffOptions3;
            window.fetchWithCache = fetchWithCache;
            window.fetchProductsM = fetchProductsM;
            window.deleteFolder = deleteFolder;

            fetchStaffProduct();
            fetchComContact();

            dateListener('list');
            setInitialDate();
            fetchProductsM();
            fetchStaffOptions('filterStaff');
            fetchOptions('filterCompany');
            document.getElementById('prodForm2').addEventListener('submit', addExistProdSubmission);
        }
        else if (page === 'internal') {
            window.deleteInternal = deleteInternal;
            window.editInternal = editInternal;
            window.handleEditInternal = handleEditInternal;
            window.addInternalSubmission = addInternalSubmission;

            fetchInternal();
            document.getElementById('internalForm').addEventListener('submit', addInternalSubmission);
        }
        else if (page === 'outsource') {
            window.deleteOutsource = deleteOutsource;
            window.editOutsource = editOutsource;
            window.handleEditOutsource = handleEditOutsource;
            window.addOutsourceSubmission = addOutsourceSubmission;

            fetchOutsources();
            document.getElementById('outsourceForm').addEventListener('submit', addOutsourceSubmission);
        }

        else if (page === 'testing') {
            window.fetchTestings = fetchTestings;
            window.formatDate = formatDate;
            window.fetchOptions = fetchOptions;
            window.formatDateForInput = formatDateForInput;
            window.retrieveInternal = retrieveInternal;
            window.retrieveOutsource = retrieveOutsource;
            window.retrieveProducts = retrieveProducts;
            window.fetchStaffProduct = fetchStaffProduct;
            window.fillInfo = fillInfo;
            window.fillSample = fillSample;
            window.paramIn = paramIn;
            window.paramOut = paramOut;
            window.addTestSubmission = addTestSubmission;
            window.cancelTest = cancelTest;
            window.editTest = editTest;
            window.fillInfo2 = fillInfo2;
            window.fillSample2 = fillSample2;
            window.populateTables = populateTables;
            window.formatDate2 = formatDate2;
            window.fetchContacts2 = fetchContacts2;
            window.populateTables2 = populateTables2;
            window.checkAndDisplayCOA = checkAndDisplayCOA;
            window.uploadFile = uploadFile;
            window.displayTestSubmission = displayTestSubmission;
            window.generateCOAIcon = generateCOAIcon;
            window.changeStatus = changeStatus;
            window.removeFile = removeFile;

            dateListener('test');
            setInitialDate();

            fetchTestings();
            fetchOptions('filterCompany');


        }
        else if (page === 'invoice') {
            window.retrieveCompanies = retrieveCompanies;
            window.fetchOptions = fetchOptions;
            window.formatDate = formatDate;
            window.generateInvoiceIcon = generateInvoiceIcon;
            window.uploadInvoice = uploadInvoice;
            window.checkAndDisplayCOARealTime = checkAndDisplayCOARealTime;
            window.removeInvoice = removeInvoice;
            window.displaySubmission = displaySubmission;
            window.fetchInvoices = fetchInvoices;
            window.editCharge = editCharge;
            window.formatDateForInput = formatDateForInput;
            window.generatePopIcon = generatePopIcon;
            window.uploadPop = uploadPop;

            dateListener('invoice');
            setInitialDate();

            fetchComContact();

            fetchInvoices();

            fetchOptions('filterCompany');
        }
        else if (page === 'PO') {
            window.retrieveCompanies = retrieveCompanies;
            window.fetchOptions = fetchOptions;
            window.formatDate = formatDate;
            window.generateInvoiceIcon = generateInvoiceIcon;
            window.uploadPO = uploadPO;
            window.deletePO = deletePO;
            window.displayPORealTime = displayPORealTime;
            window.removePO = removePO;
            window.displaySubmissionPO = displaySubmissionPO;
            window.editPO = editPO;
            window.formatDateForInput = formatDateForInput;
            window.addPOSubmission = addPOSubmission;
            window.fetchPOs = fetchPOs;

            dateListener('PO');
            setInitialDate();

            fetchComContact();

            fetchPOs();

            fetchOptions('filterCompany');
        }
        else if(page == 'report'){
            window.listenToCharges = listenToCharges;
            window.renderChart = renderChart;

            active();
            listenToCharges("monthly");

        }
        else if(page == 'profile'){
            window.loadProfileData = loadProfileData;
            window.saveChanges = saveChanges;
            window.submitEmailChange = submitEmailChange;
            window.submitPasswordChange = submitPasswordChange;

            loadProfileData();
        }
    } catch (error) {
        console.error('Error loading content:', error);
    }
}


// Logout function
function logoutUser() {
    isLoggingOut = true; // Set the flag before sign-out
    signOut(auth)
        .then(() => {
          // Show the custom alert with a loading spinner and pass the redirection callback
            showCustomAlert('Logging out, please wait...', () => {
              window.location.href = '/auth'; // Redirect to login page after a delay
          });
        })
        .catch((error) => {
            console.error('Error logging out:', error);
            showCustomAlert('Logout failed. Please try again.');
        })
        .finally(() => {
            isLoggingOut = false; // Reset the flag after sign-out completes
        });
}


// Function to close the custom alert
 function closeCustomAlert() {
    document.getElementById('customAlert').classList.add('hidden');
    document.getElementById('loadingSpinner').classList.add('hidden');
}