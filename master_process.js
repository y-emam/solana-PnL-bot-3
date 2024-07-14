const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const totalGroups = 40;
let completedGroups = 0;

const checkCompletion = () => {
  if (completedGroups === totalGroups) {
    console.log("All processes completed. Closing terminal.");
    process.exit(0); // Close terminal when all processes are done
  }
};

const runGroupScript = async (i) => {
  const groupScript = `node process_group_${i}.js > process_group_${i}.log 2>&1`;

  try {
    const { stdout, stderr } = await execPromise(groupScript);
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
    // socket.emit("Finished a process");
  } catch (error) {
    console.error(`Error executing ${groupScript}: ${error}`);
  } finally {
    completedGroups++;
    checkCompletion();
  }
};

const master = () => {
  const promises = [];
  for (let i = 0; i < totalGroups; i++) {
    promises.push(runGroupScript(i));
  }
  return promises;
};

// const master = () => {
//   for (let i = 0; i < totalGroups; i++) {
//     const groupScript = `node process_group_${i}.js > process_group_${i}.log 2>&1`;
//     const process = exec(groupScript, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`Error executing ${groupScript}: ${error}`);
//         completedGroups++; // Increment even on error to avoid hanging
//         checkCompletion();
//         return;
//       }
//       if (stderr) {
//         console.error(`stderr: ${stderr}`);
//       }
//       console.log(`stdout: ${stdout}`);
//     });

//     process.on("exit", (code) => {
//       console.log(`Process for group ${i} exited with code ${code}`);
//       completedGroups++;
//       checkCompletion();
//     });
//   }
// };

module.exports = { master };
