const form = document.getElementById("csvUploadForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // diable the button
  const button = document.getElementsByTagName("button")[0];
  button.disabled = true;

  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("minWinRate", document.getElementById("min-win-rate").value);
  formData.append("minProjects", document.getElementById("min-projects").value);
  formData.append("roi", document.getElementById("roi").value);
  formData.append("heliusApi", document.getElementById("helius-api").value);
  formData.append("file", file);

  fetch("/win-rate", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      // enable the button
      const button = document.getElementsByTagName("button")[0];
      button.disabled = false;
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("status").innerText = "Error uploading file.";
      // enable the button
      const button = document.getElementsByTagName("button")[0];
      button.disabled = false;
    });
});
