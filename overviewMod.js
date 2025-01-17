// Import the necessary Firebase modules
import { app, db, Timestamp, doc, getDoc, query, where, collection, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot } from "./firebase-config.js";



// Helper function to format date as dd/mm/yy
function formatDate(dateInput) {
    // If input is a Firestore Timestamp, convert to Date object
    const date = dateInput instanceof Timestamp
        ? dateInput.toDate()
        : new Date(dateInput);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()); // Last two digits of year
    return `${day}-${month}-${year}`;
}

// Function to fetch products in real-time with unsubscribe capability
async function fetchProducts() {
    // Retrieve initial and last date values
    const initialDateValue = document.getElementById('initialDate').value;
    const lastDateValue = document.getElementById('lastDate').value;

    if (unsubscribe) unsubscribe();

    // Ensure valid date format for comparison
    let initialDate = null;
    let lastDate = null;

    if (initialDateValue) {
        initialDate = new Date(initialDateValue);
    }

    if (lastDateValue) {
        lastDate = new Date(lastDateValue);
    }

    // Show alert while fetching data
    showCustomAlert('Fetching data, please wait...', () => { });

    try {
        const testingCollectionRef = collection(db, 'TESTING'); // Use the TESTING collection

        // Set up real-time listener for the TESTING collection
        const unsubscribe = onSnapshot(testingCollectionRef, async (snapshot) => {
            overviews = [];
            const testingDocs = snapshot.docs;

            // Using Promise.all to fetch all necessary documents in parallel
            const chargeDocs = await Promise.all(
                testingDocs.map(async (testingDoc) => {
                    const testingData = testingDoc.data();
                    const chargeID = testingData.chargeID; // Get the chargeID from the TESTING document
                    const chargeDocRef = doc(db, 'CHARGE', chargeID);
                    const chargeDocSnap = await getDoc(chargeDocRef);
                    return chargeDocSnap.exists() ? chargeDocSnap.data() : null;
                })
            );

            const productDocs = await Promise.all(
                testingDocs.map(async (testingDoc) => {
                    const testingData = testingDoc.data();
                    const productDocRef = doc(db, 'PRODUCT', testingData.prodID); // Use prodID from TESTING
                    const productDocSnap = await getDoc(productDocRef);
                    return productDocSnap.exists() ? productDocSnap.data() : null;
                })
            );

            const companyDocs = await Promise.all(
                chargeDocs.map(async (chargeData) => {
                    if (chargeData) {
                        const companyDocRef = doc(db, 'COMPANY', chargeData.companyID); // Use companyID from PRODUCT
                        const companyDocSnap = await getDoc(companyDocRef);
                        return companyDocSnap.exists() ? companyDocSnap.data() : null;
                    }
                    return null;
                })
            );

            // Process each document once all the necessary data is fetched
            for (let i = 0; i < testingDocs.length; i++) {
                const testingDoc = testingDocs[i];
                const testingData = testingDoc.data();
                const chargeData = chargeDocs[i];
                const productData = productDocs[i];
                const companyData = companyDocs[i];

                // Skip if resultStatus is "CANCELLED"
                if (testingData.resultStatus === "CANCELLED") {
                    continue; // Skip this iteration
                }

                const regDate = testingData.dateRegis ? testingData.dateRegis.toDate() : null;
                let isValidDate = false;

                // Date filtering logic
                if (initialDate && lastDate) {
                    // If both dates are filled, check if the date is within the range
                    isValidDate = regDate >= initialDate && regDate <= lastDate;
                } else if (initialDate && !lastDate) {
                    // If only initial date is filled, check if the date is after the initial date
                    isValidDate = regDate >= initialDate;
                } else if (!initialDate && lastDate) {
                    // If only last date is filled, check if the date is before the last date
                    isValidDate = regDate <= lastDate;
                } else {
                    // If both dates are empty, include all products
                    isValidDate = true;
                }

                if (isValidDate) {
                    overviews.push({
                        id: testingData.prodID, // Include the TESTING document ID
                        prodName: productData ? productData.prodName : 'Unknown Product', // Handle missing product data
                        company: chargeData ? chargeData.companyID : 'Unknown Company', // Handle missing company data
                        name: productData ? productData.prodName : 'Unknown Product',
                        staff: companyData ? companyData.staffID : 'Unknown Staff', // Handle missing company data
                        result: testingData.resultStatus,
                        date: regDate, // Registration date
                        chargeID: chargeData ? chargeData.id : 'Unknown Charge', // Handle missing charge data
                        pay: chargeData ? chargeData.payStatus : 'Unknown Pay Status', // Handle missing charge data
                    });
                }
            }

            // Sort by register date
            overviews.sort((a, b) => b.id.localeCompare(a.id));
            
            // Filter products after fetching and sorting
            filterProducts(overviews); // Pass the products array to filterProducts()
        });

        // Optionally, return unsubscribe function to clean up later
        return unsubscribe;

    } catch (error) {
        console.error("Error fetching products:", error);
    }
}




async function fetchStaffProduct() {
    try {
        const querySnapshot = await getDocs(collection(db, 'STAFF'));

        querySnapshot.forEach((doc) => {
            const staffData = doc.data();
            const id = doc.id;
            // Combine Fname and Lname to create staffName
            const staffName = `${staffData.Fname} ${staffData.Lname}`;
            // Map the combined name
            staffMap[id] = staffName;
        });

    } catch (error) {
        console.error("Error fetching staff:", error);
    }
}


async function retrieveStaffs() {
    const staffMap = {};
    try {
        const querySnapshot = await getDocs(collection(db, 'STAFF'));
        
        querySnapshot.forEach((doc) => {
            const staffData = doc.data();
            // Combine Fname and Lname to create staffName
            const staffName = `${staffData.Fname} ${staffData.Lname}`;

            staffMap[doc.id] = staffName;
        });
    } catch (error) {
        console.error("Error fetching staff:", error);
    }

    return staffMap;  // Return the map of companies
}


// Main function to handle fetching and populating company data
async function fetchStaffOptions(elementID) {
    const staffMap = await retrieveStaffs();
    populateStaffOptions(staffMap, elementID);  // Pass the ID of the dropdown
}

export{fetchProducts, fetchStaffProduct, retrieveStaffs, fetchStaffOptions, formatDate};


