const updateTable = () => {
  fetch("/get-final-csv")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.querySelector("#dataTable tbody");
      // check if there is any new rows by comparring number of rows
      if (tableBody.rows.length === data.length) {
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
    })
    .catch((error) => console.error("Error fetching data:", error));
};
updateTable();

setInterval(updateTable, 6000);
