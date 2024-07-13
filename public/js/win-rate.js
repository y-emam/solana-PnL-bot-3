const form = document.getElementById("csvUploadForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];

  const formData = new FormData();
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
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("status").innerText = "Error uploading file.";
    });
});

// setInterval(() => {
//   fetch("/get-win-rate")
//     .then((response) => response.json())
//     .then((data) => {
//       const tableBody = document.querySelector("#dataTable tbody");
//       tableBody.innerHTML = ""; // Clear any existing rows

//       data.forEach((row) => {
//         const tr = document.createElement("tr");

//         const addressTd = document.createElement("td");
//         addressTd.textContent = row.Address;
//         tr.appendChild(addressTd);

//         const winRateTd = document.createElement("td");
//         winRateTd.textContent = row.WinRate;
//         tr.appendChild(winRateTd);

//         tableBody.appendChild(tr);
//       });
//     })
//     .catch((error) => console.error("Error:", error));
// }, 6000);

// =======================================================================================

// const form = document.getElementById("csvUploadForm");
// const fileInput = document.getElementById("csvFile");
// const statusElement = document.getElementById("status");

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const file = fileInput.files[0];
//   if (!file) {
//     statusElement.innerText = "Please select a file.";
//     return;
//   }

//   // Connect to Socket.IO server
//   const socket = io();

//   // Emit 'win-rate' event to server
//   socket.emit("win-rate");

//   // Listen for server responses
//   socket.on("request-received", (data) => {
//     statusElement.innerText = data.message;
//   });

//   socket.on("win-rate-complete", () => {
//     statusElement.innerText = "Processing complete.";
//   });

//   socket.on("file-ready", (filePath) => {
//     // Download file using Blob and create a link to download
//     fetch(filePath)
//       .then((response) => response.blob())
//       .then((blob) => {
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.style.display = "none";
//         a.href = url;
//         a.download = "final.csv";
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//       })
//       .catch((error) => console.error("Download failed:", error));
//   });

//   socket.on("error", (error) => {
//     console.error("Socket error:", error);
//     statusElement.innerText = "Error occurred.";
//   });
// });
