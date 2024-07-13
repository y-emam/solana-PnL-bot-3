const express = require("express");
const path = require("path");
const app = express();
const csv = require("csv-parser");
const fs = require("fs");
const multer = require("multer");
const http = require("http");
const socketIo = require("socket.io");
const { main } = require("./index2");
const { master } = require("./master_process");

const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = socketIo(server);

app.get("/wallet", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "wallet.html"));
});

app.post("/wallet", async (req, res) => {
  const wallet = req.body.wallet;
  const data = await main(wallet);

  res.send(data);
});

app.get("/show-final-csv", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "show-csv.html"));
});

app.get("/get-final-csv", (req, res) => {
  const results = [];
  const filePath = path.join(__dirname, "final.csv");

  if (fs.existsSync(filePath)) {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        res.json(results);
      });
  }
});

app.get("/win-rate", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "win-rate.html"));
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname);
  },
  filename: function (req, file, cb) {
    cb(null, "Solana Wallet Addresses - Projects (1) 2024-07-07 22_51_10.csv"); // Save as file.txt
  },
});

// Create multer instance with specified storage options
const upload = multer({ storage: storage });

// io.on("connection", (socket) => {
//   console.log("A user connected");
//   // Optionally, you can handle disconnect event
//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

app.post("/win-rate", upload.single("file"), async (req, res) => {
  // get csv file from front
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const filePath = path.join(__dirname, "final.csv");

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // call master_process main
  console.log("Started the master process");
  await master(io);
  console.log("Finished the master process");

  res.download(filePath, "final.csv", (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error downloading file");
    } else {
      console.log("File downloaded successfully");
    }
  });
});

// io.on("connection", (socket) => {
//   socket.on("win-rate", async () => {
//     // Replace 'upload.single("file")' with your actual file handling logic if necessary

//     // Example: handling file upload
//     const filePath = path.join(__dirname, "final.csv");

//     // Simulate file upload completion
//     setTimeout(async () => {
//       // Remove existing file if any
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//       }

//       // Call master_process main
//       console.log("Started the master process");
//       await master(io); // Assuming 'master' function emits updates via Socket.IO

//       console.log("Finished the master process");

//       // Emit event to notify client that processing is complete
//       socket.emit("win-rate-complete");

//       // Download file to client
//       socket.emit("file-ready", filePath); // Send file path to client
//     }, 2000); // Simulated delay to mimic processing time

//     // Respond to the client that request has been received
//     socket.emit("request-received", { message: "File upload in progress..." });
//   });
// });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
