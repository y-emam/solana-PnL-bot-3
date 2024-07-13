document
  .getElementById("dataForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const inputField = document.getElementById("inputField");
    const wallet = inputField.value;

    await fetch("/wallet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "grouped_transactions.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Download failed:", error));

    // const response = await fetch("/wallet", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ wallet }),
    // });

    // const data = await response.json();
    // displayResults(data);
    // downloadCSV(data);
  });

function displayResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

function downloadCSV(data) {
  const header =
    Object.keys(data)
      .filter((key) => key !== "final_ledger")
      .join(",") +
    "," +
    Object.keys(data.final_ledger).join(",");
  const row =
    Object.values(data)
      .filter((value) => typeof value !== "object")
      .join(",") +
    "," +
    Object.values(data.final_ledger).join(",");
  const csvData = `${header}\n${row}`;

  const blob = new Blob([csvData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", "data.csv");
  a.click();
}
