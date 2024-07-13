const { exec } = require('child_process');
exec('node base_process_addresses.js 13', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing base_process_addresses.js: ${error}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
});
