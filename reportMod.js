
import {app,db, collection, query, where, getDocs, onSnapshot } from "./firebase-config.js";

function renderChart(data, chartTitle) {
  const labels = Object.keys(data);
  const totals = Object.values(data);

  const ctx = document.getElementById("salesChart").getContext("2d");

  if (window.chartInstance) {
    window.chartInstance.destroy(); // Destroy the previous chart instance
  }

  window.chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Sales",
          data: totals,
          backgroundColor: "rgba(181,235,247, 0.6)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              size: 16, // Adjust the font size of the legend
              family: "'Poppins', sans-serif", // Change font family for the legend
              weight: '600', // Make legend text bold
            },
          },
        },
        title: {
          display: true,
          text: chartTitle, // Title text
          font: {
            size: 15, // Font size of the title
            family: "'Poppins', sans-serif", // Font family for the title
            weight: '600', // Font weight of the title
          },
          position: "left", // Position of the title (left)
          align: "center", // Align the title to the left
          padding: {
            bottom: 30, // Padding on the bottom
          },
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              size: 15, // Adjust the font size for the x-axis labels
              family: "'Poppins', sans-serif", // Change font family for x-axis
              weight: '500',
            },
          },
        },
        y: {
          ticks: {
            font: {
              size: 14, // Adjust the font size for the y-axis labels
              family: "'Poppins', sans-serif", // Change font family for y-axis
              weight: '500',
            },
          },
        },
      },
      animation: {
        duration: 1000, // Duration of the animation (in milliseconds)
        easing: 'easeInOutQuad', // Easing function for smooth animation
      },
    },
  });
}


async function listenToCharges(timeFrame) {
  const chargesRef = collection(db, "CHARGE");
  const q = query(chargesRef, where("payStatus", "==", "COMPLETED"));

  // Set up a new real-time listener
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const charges = snapshot.docs.map((doc) => doc.data());
    const groupedData = groupChargesByTimeFrame(charges, timeFrame);
    renderChart(groupedData.data, groupedData.title);
  });
}
export{renderChart, listenToCharges};