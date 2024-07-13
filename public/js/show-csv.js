document.addEventListener("DOMContentLoaded", function () {
  fetch("/get-final-csv")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.querySelector("#dataTable tbody");
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
});
