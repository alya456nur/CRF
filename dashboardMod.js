import { app, db, doc, getDoc, query, where, collection, getDocs, onSnapshot } from "./firebase-config.js";

// Function to filter and fetch data from the TESTING and CHARGE collections based on the selected dates
async function filterDate() {
    document.getElementById("greet").textContent = `Hello ${Fname}!`;

    // Get the initial and last dates from the input fields
    const initialDate = document.getElementById('initialDate').value;
    const lastDate = document.getElementById('lastDate').value;

    // Prepare Firestore query based on selected dates
    const startDate = initialDate ? new Date(initialDate) : new Date('2000-01-01'); // Use minimum date if not provided
    const endDate = lastDate ? new Date(lastDate) : new Date(); // Use current date if not provided

    // Set up the query for the TESTING collection
    const testingRef = collection(db, "TESTING");
    const testingQuery = query(
        testingRef,
        where("dateRegis", ">=", startDate),
        where("dateRegis", "<=", endDate)
    );

    // Set up the query for the CHARGE collection
    const chargesRef = collection(db, "CHARGE");
    const chargeQuery = query(
        chargesRef,
        where("payDate", ">=", startDate),
        where("payDate", "<=", endDate),
        where("payStatus","==", "COMPLETED")
    );

    // Real-time listener for TESTING collection
    const unsubscribeTesting = onSnapshot(testingQuery, (querySnapshot) => {
        let resultStatusCounts = {
            PENDING: 0,
            ONGOING: 0,
            COMPLETED: 0,
            CANCELLED: 0
        };
        let totalDocs = 0;

        querySnapshot.forEach(doc => {
            totalDocs++; // Increment the total document count
            const resultStatus = doc.data().resultStatus;

            // Count the occurrences of each resultStatus
            if (resultStatusCounts.hasOwnProperty(resultStatus)) {
                resultStatusCounts[resultStatus]++;
            }
        });

        // Animate the real-time updates for the TESTING collection status counts
        animateNumberChange('testTotal', totalDocs);
        animateNumberChange('ongoingTotal', resultStatusCounts.ONGOING);
        animateNumberChange('cancelTotal', resultStatusCounts.CANCELLED);
        animateNumberChange('pendTotal', resultStatusCounts.PENDING);
        animateNumberChange('completeTest', resultStatusCounts.COMPLETED);

    }, (error) => {
        console.error("Error fetching real-time data from TESTING collection:", error);
    });

    // Real-time listener for CHARGE collection (for sales data)
    const unsubscribeCharge = onSnapshot(chargeQuery, (querySnapshot) => {
        let totalSales = 0;
        let inHouseSales = 0;
        let outSales = 0;

        querySnapshot.forEach(doc => {
            const chargeData = doc.data();

            if (chargeData.payStatus === 'COMPLETED') {
                totalSales += chargeData.Total || 0;
                inHouseSales += chargeData.inTotal || 0;
                outSales += chargeData.outTotal || 0;
            }
        });

        // Animate the real-time updates for sales data
        animateNumberChange('totalSales', totalSales);
        animateNumberChange('inHouseSales', inHouseSales);
        animateNumberChange('outSales', outSales);

    }, (error) => {
        console.error("Error fetching real-time data from CHARGE collection:", error);
    });
}


async function populateYearOptions() {
    try {
        const querySnapshot = await getDocs(collection(db, 'CHARGE'));
        const years = new Set(); // Using a Set to ensure uniqueness

        querySnapshot.forEach((doc) => {
            const chargeData = doc.data();
            const dateCreated = chargeData?.payDate?.toDate(); // Assuming it's a Firestore Timestamp
            if (dateCreated) {
                const year = dateCreated.getFullYear(); // Extract the year from dateCreated
                years.add(year); // Add year to the Set
            }
        });

        // Get the year <select> element and clear any existing options
        const yearSelect = document.getElementById('year');
        yearSelect.innerHTML = ''; // Clear the options

        // Create and append the options for each year
        years.forEach((year) => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        // Set the default selected year to the current year
        const currentYear = new Date().getFullYear();
        if (years.has(currentYear)) {
            yearSelect.value = currentYear; // Set the current year as the selected option
        }

    } catch (error) {
        console.error("Error fetching charge data:", error);
    }
}

// Fetch data based on the selected year and update the Doughnut chart (real-time)
function fetchChartData() {
    const selectedYear = document.getElementById('year').value;
    if (!selectedYear) return; // If no year is selected, return

    // Prepare Firestore query for the selected year
    const startDate = new Date(`${selectedYear}-01-01`); // Start of the year
    const endDate = new Date(`${selectedYear}-12-31`); // End of the year

    const chargesRef = collection(db, "CHARGE");
    const q = query(
        chargesRef,
        where("payDate", ">=", startDate),
        where("payDate", "<=", endDate),
        where("payStatus", "==", "COMPLETED") // Only include documents where payStatus is 'COMPLETED'
    );

    // Real-time listener for changes
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let inHouseTotal = 0;
        let outSourceTotal = 0;

        // Process the retrieved documents
        querySnapshot.forEach(doc => {
            const chargeData = doc.data();
            inHouseTotal += chargeData.inTotal || 0; // Add in-house total
            outSourceTotal += chargeData.outTotal || 0; // Add outsource total
        });

        // Update the Doughnut chart
        updateDoughnutChart(inHouseTotal, outSourceTotal);
    }, (error) => {
        console.error("Error fetching real-time data:", error);
    });

    // Optionally return unsubscribe function to clean up the listener later if needed
    // return unsubscribe;
}



function updateDoughnutChart(inHouseTotal, outSourceTotal) {
    const ctx2 = document.getElementById("sampleChart").getContext("2d");

    // If chart already exists, destroy it before creating a new one
    if (window.chartInstance1) {
        window.chartInstance1.destroy();
    }

    // Custom plugin to add text in the center of the doughnut
    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart) {
            const { width } = chart;
            const { height } = chart;
            const ctx = chart.ctx;

            ctx.save();

            // Determine which label and percentage to display
            const total = inHouseTotal + outSourceTotal;
            const inHousePercentage = Math.round((inHouseTotal / total) * 100);
            const outSourcePercentage = Math.round((outSourceTotal / total) * 100);

            const displayPercentage = inHouseTotal >= outSourceTotal ? inHousePercentage : outSourcePercentage;
            const displayLabel = inHouseTotal >= outSourceTotal ? "In-House Sales" : "Outsource Sales";

            // Set font and text properties for percentage
            ctx.font = `600 24px Poppins`;
            ctx.fillStyle = '#9d9d9d';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw percentage text at the top of the center
            ctx.fillText(`${displayPercentage}%`, width / 2, height / 2 - 50);

            // Set font and text properties for label
            ctx.font = `600 12px Poppins`;
            ctx.fillText(displayLabel, width / 2, height / 2 - 20);

            ctx.restore();
        }
    };
    // Create the Doughnut chart
    window.chartInstance1 = new Chart(ctx2, {
        type: "doughnut",
        data: {
            labels: ['In-House Sales', 'Outsource Sales'],
            datasets: [{
                data: [inHouseTotal, outSourceTotal],
                backgroundColor: ['#034bb1', 'orange'],
                hoverOffset: 1
            }]
        },
        options: {
            responsive: true,
            cutout: '80%', // Adjust this value to make the doughnut thinner (default is '50%')
            plugins: {
                legend: {
                    position: 'bottom', // Place legend at the bottom
                    labels: {
                        usePointStyle: true, // Use circular legend markers
                        font: {
                            size: 14,       // Font size for legend items
                            weight: 500,  // Font weight for legend items (e.g., 'normal', 'bold', '600', etc.)
                            color: '#9d9d9d',
                        },
                        padding: 20, // Add some padding between legend items
                    },
                    maxHeight: 200, // Limit the height of the legend (if needed)
                    align: 'start', // Align the legend items to the start (left-align grid)
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            let total = tooltipItem.raw;
                            let percentage = Math.round((total / (inHouseTotal + outSourceTotal)) * 100);
                            return `${tooltipItem.label}: ${total} (${percentage}%)`;
                        }
                    },
                    // Font settings for tooltips
                    bodyFont: {
                        family: 'Poppins', // Optional: specify font family for tooltip text
                        size: 14,         // Optional: specify font size
                    }
                }
            }
        },
        plugins: [centerTextPlugin] // Include the custom plugin
    });
}


async function populateAll(){
    await filterDate();
    active();
    await populateYearOptions();
    await fetchChartData();
    await listenToCharges("monthly");
}

export{populateYearOptions,filterDate, populateAll, fetchChartData};