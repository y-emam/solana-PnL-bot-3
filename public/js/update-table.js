const updateTable = async () => {
  try {
    const response = await fetch("/get-final-csv");
    const data = await response.json();

    console.log("Updating Win rate table");

    const tableBody = document.querySelector("#dataTable tbody");

    // check if there is any new rows by comparring number of rows
    if (tableBody.rows.length === data.length) {
      return;
    } else if (Object.keys(data).length <= 0) {
      tableBody.innerHTML = "";
      return;
    } else {
      tableBody.innerHTML = "";
    }
    data.forEach((row) => {
      const tr = document.createElement("tr");
      const tdAddress = document.createElement("td");
      tdAddress.textContent = row.Address;
      const tdWinRate = document.createElement("td");
      tdWinRate.textContent = row.WinRate;
      tr.appendChild(tdAddress);
      tr.appendChild(tdWinRate);
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  async function startUpdatingTable() {
    await updateTable(); // Wait for the initial update
    scheduleNextUpdate(); // Schedule the next update
  }

  function scheduleNextUpdate() {
    setTimeout(async () => {
      await updateTable();
      scheduleNextUpdate(); // Schedule the next update after the current one finishes
    }, 6000); // 6000ms = 6 seconds
  }

  startUpdatingTable(); // Start the update cycle
});
