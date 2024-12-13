function active() {
  const navItems = document.querySelectorAll(".nav-items");

  navItems.forEach((item) => {
    item.addEventListener("click", async (event) => {
      event.preventDefault();

      // Remove 'active' class from all nav items
      navItems.forEach((nav) => nav.classList.remove("active"));

      // Add 'active' class to the clicked nav item
      item.classList.add("active");

      const timeFrame = item.id; // "weekly", "monthly", or "yearly"
      listenToCharges(timeFrame); // Fetch and display charges
    });
  });
}

function groupChargesByTimeFrame(charges, timeFrame) {
  const data = {};
  let title = "Sales Data";

  // Get the current date
  const now = new Date();

  // For Day: Calculate the start and end of the current week (Monday to Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday (if today is Sunday, subtract 6)
  startOfWeek.setHours(0, 0, 0, 0); // Set to midnight to avoid partial days

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999); // Set to the end of the day

  // For Weekly: Calculate the start of the current month (First day of this month)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // 1st day of the current month

  charges.forEach((charge) => {
    const timestamp = charge.payDate.toDate(); // Assuming `payDate` is a Firestore timestamp
    let key;

    if (timeFrame === "day") {
      // Include only charges within this week (Monday to Sunday)
      if (timestamp >= startOfWeek && timestamp <= endOfWeek) {
        key = timestamp.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Monday", "Tuesday"
        title = "Daily Sales Data (RM)";
      } else {
        return; // Skip charges outside this week
      }
    } 
    else if (timeFrame === "weekly") {
      // Ensure the charge is in the current month
      if (timestamp.getMonth() !== now.getMonth()) {
        return; // Skip charges outside the current month
      }

      // Calculate the week number in the current month
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of this month
      const daysFromStartOfMonth = Math.floor((timestamp - firstDayOfMonth) / (1000 * 3600 * 24)); // Days passed since 1st of the month
      const weekNumber = Math.floor(daysFromStartOfMonth / 7) + 1; // Calculate the week number (Week 1, Week 2, ...)

      key = `Week ${weekNumber}`; // e.g., "Week 1", "Week 2"
      title = "Weekly Sales Data (RM)";
    } 
    else if (timeFrame === "monthly") {
      key = timestamp.toLocaleDateString("en-US", { month: "short" }); // e.g., "Jan", "Feb"
      title = "Monthly Sales Data (RM)";
    } 
    else if (timeFrame === "yearly") {
      key = timestamp.toLocaleDateString("en-US", { year: "numeric" }); // e.g., "2024"
      title = "Yearly Sales Data (RM)";
    }

    // Sum the total sales for each group
    data[key] = (data[key] || 0) + charge.Total;
  });

  // Sorting logic for each timeframe
  if (timeFrame === "weekly") {
    const sortedData = {};
    const weekKeys = Object.keys(data).sort((a, b) => {
      const weekA = parseInt(a.split(" ")[1]); // "Week 1", "Week 2"
      const weekB = parseInt(b.split(" ")[1]);
      return weekA - weekB; // Sort by week number
    });

    // Rebuild the data object with sorted keys
    weekKeys.forEach((week) => {
      sortedData[week] = data[week];
    });

    return { data: sortedData, title };
  }

  if (timeFrame === "monthly") {
    const sortedData = {};
    const monthKeys = Object.keys(data).sort((a, b) => {
      const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      return months[a] - months[b]; // Sort by month order
    });

    // Rebuild the data object with sorted keys
    monthKeys.forEach((month) => {
      sortedData[month] = data[month];
    });

    return { data: sortedData, title };
  }

  if (timeFrame === "yearly") {
    const sortedData = {};
    const yearKeys = Object.keys(data).sort((a, b) => {
      return parseInt(a) - parseInt(b); // Sort by year
    });

    // Rebuild the data object with sorted keys
    yearKeys.forEach((year) => {
      sortedData[year] = data[year];
    });

    return { data: sortedData, title };
  }

  if (timeFrame === "day") {
    const sortedData = {};
    const dayKeys = Object.keys(data).sort((a, b) => {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b); // Sort days of the week (Monday to Sunday)
    });

    // Rebuild the data object with sorted keys
    dayKeys.forEach((day) => {
      sortedData[day] = data[day];
    });

    return { data: sortedData, title };
  }

  return { data, title };
}


