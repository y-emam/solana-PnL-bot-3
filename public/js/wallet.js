document
  .getElementById("dataForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    // diable the button
    const button = document.getElementsByTagName("button")[0];
    button.disabled = true;

    // get the data from the form
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

        // enable the button
        const button = document.getElementsByTagName("button")[0];
        button.disabled = false;
      })
      .catch((error) => {
        console.error("Download failed:", error);

        // enable the button
        const button = document.getElementsByTagName("button")[0];
        button.disabled = false;
      });
  });
