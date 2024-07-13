document
  .getElementById("dataForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const inputField = document.getElementById("inputField");
    const wallet = inputField.value;

    const response = await fetch("/wallet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wallet }),
    });

    const data = await response.json();
    displayResults(data);
  });

function displayResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}
