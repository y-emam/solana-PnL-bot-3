const fs = require('fs');
const csvParser = require('csv-parser');
const { exec } = require('child_process');

// Function to read addresses from the CSV file
const readAddresses = () => {
    return new Promise((resolve, reject) => {
        const addresses = [];
        fs.createReadStream('Solana Wallet Addresses - Projects (1) 2024-07-07 22_51_10.csv')
            .pipe(csvParser())
            .on('data', (row) => {
                addresses.push(row.Address);
            })
            .on('end', () => {
                resolve(addresses);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

// Function to run index.js script with a wallet address
const runIndexScript = (wallet) => {
    return new Promise((resolve, reject) => {
        exec(`node index.js ${wallet}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing index.js: ${error}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
    });
};

const processAddresses = async () => {
    const addresses = await readAddresses();

    for (let i = 0; i < addresses.length; i++) {
        if (i % 2 !== 0) {  // Check for odd row number
            const wallet = addresses[i];
            console.log(`Processing wallet (odd): ${wallet}`);

            try {
                await runIndexScript(wallet);
            } catch (error) {
                console.error(`Error processing wallet ${wallet}: ${error}`);
            }
        }
    }

    console.log('Processing completed for odd addresses.');
};

processAddresses().catch((error) => {
    console.error(`Error: ${error}`);
});
