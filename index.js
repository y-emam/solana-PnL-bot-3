const axios = require("axios");
const fs = require("fs");
const {output} = require("./log");
const {readCSVFile} = require("./csv_loader");
const {getPrice, readPricesFromCSV, writePricesToCSV} = require("./prices");
const {get} = require("http");

require("dotenv").config();

let ROI = '';
let ROIP
function formatNumber(number) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}
const parseTransaction = (tx) => {
    const description = tx.description;
    const right = description.split("swapped ")[1];
    let tokens = right.split(" ");
    let filtered = [];
    tokens.forEach((token) => {
        if (token.length > 0) filtered.push(token);
    });
    return filtered;
};
const groupTransactions = (transaction_ledger, wallet) => {
    let groupedTransactions = {};
    let totalTokens = 0;
    let positiveProfitCount = 0;
    let totalInvested = 0;
    let totalReturn = 0;

    transaction_ledger.forEach((tx) => {
        const {token_name, sp, sol_balance, usd_balance, token_balance} = tx;

        // Exclude USDC transactions
        if (token_name.toUpperCase() === "USDC") {
            return;
        }

        const type = sp === "Buy" ? "Buy" : "Sell";

        if (!groupedTransactions[token_name]) {
            groupedTransactions[token_name] = {
                Buy: {total_sol_balance: 0, total_usd_balance: 0, total_token_balance: 0},
                Sell: {total_sol_balance: 0, total_usd_balance: 0, total_token_balance: 0}
            };
        }

        groupedTransactions[token_name][type].total_sol_balance += sol_balance;
        groupedTransactions[token_name][type].total_usd_balance += usd_balance; // Include USD balance
        groupedTransactions[token_name][type].total_token_balance += token_balance;
    });

    const csvRows = [
        ["Token Name", "Type", "Total SOL Balance", "Total USD Investment", "Total Token Balance", "Profit (SOL)", "Profit (USD), ROI"]
    ];

    Object.keys(groupedTransactions).forEach(token_name => {
        const buyData = groupedTransactions[token_name]["Buy"];
        const sellData = groupedTransactions[token_name]["Sell"];

        // Ensure there are no negative or incorrect values
        buyData.total_sol_balance = Math.max(buyData.total_sol_balance, 0);
        sellData.total_sol_balance = Math.max(sellData.total_sol_balance, 0);
        buyData.total_usd_balance = Math.max(buyData.total_usd_balance, 0);
        sellData.total_usd_balance = Math.max(sellData.total_usd_balance, 0);

        // Skip tokens with no buy transactions
        if (buyData.total_sol_balance === 0 && buyData.total_usd_balance === 0 && buyData.total_token_balance === 0) {
            return;
        }

        totalTokens++;
        totalInvested += buyData.total_usd_balance;

        const profitSol = sellData.total_sol_balance - buyData.total_sol_balance;
        const profitUsd = sellData.total_usd_balance - buyData.total_usd_balance;

        if ((profitUsd / buyData.total_usd_balance) * 100 >= process.env.ROI) {
            positiveProfitCount++;
        }

        totalReturn += profitUsd;

        csvRows.push([
            token_name,
            "Buy",
            buyData.total_sol_balance.toFixed(8),
            buyData.total_usd_balance.toFixed(8), // Include USD balance
            buyData.total_token_balance.toFixed(8),
            "",
            "",
            ""
        ]);

        csvRows.push([
            token_name,
            "Sell",
            sellData.total_sol_balance.toFixed(8),
            sellData.total_usd_balance.toFixed(8), // Include USD balance
            sellData.total_token_balance.toFixed(8),
            "",
            "",
            ""
        ]);

        csvRows.push([
            token_name,
            "Profit",
            profitSol.toFixed(8),
            profitUsd.toFixed(8),
            "",
            profitSol.toFixed(8),
            profitUsd.toFixed(8),
            ((profitUsd / buyData.total_usd_balance) * 100).toFixed(2)  + " %"
        ]);
    });

    const winRate = totalTokens > 0 ? (positiveProfitCount / totalTokens) * 100 : 0;

    // Add win rate, total invested, and total return rows at the end
    csvRows.push([
        "Win Rate",
        "",
        "",
        "",
        "",
        "",
        "" + positiveProfitCount + " / " + totalTokens,
        `${winRate.toFixed(2)}%`
    ]);

    csvRows.push([
        "Total Invested",
        "",
        "",
        "",
        "",
        "",
        "",
        `${totalInvested.toFixed(2)} USD`
    ]);

    csvRows.push([
        "Total Return",
        "",
        "",
        "",
        "",
        "",
        "",
        `${totalReturn.toFixed(2)} USD`
    ]);
    ROI = parseFloat((Number(totalReturn) / Number(totalInvested)).toFixed(2))  + "x";
    ROIP = parseFloat((Number(totalReturn) / Number(totalInvested)).toFixed(2)) * 100 + " %";
    if (totalReturn > 0 && winRate > process.env.WINRATE && totalTokens > process.env.TOTALTOKEN) {
        updateFinalCSV(wallet, positiveProfitCount + " / " + totalTokens + " = " + winRate.toFixed(2), `${totalInvested.toFixed(2)} USD`, `${totalReturn.toFixed(2)} USD`);
    }
    // updateFinalCSV(wallet, positiveProfitCount + " / " + totalTokens + " = " + winRate, `${totalInvested.toFixed(2)} USD`, `${totalReturn.toFixed(2)} USD`);
    fs.writeFileSync("grouped_transactions.csv", csvRows.map(row => row.join(",")).join("\n"));
};
// const groupTransactions = (transaction_ledger) => {
//   let groupedTransactions = {};
//
//   transaction_ledger.forEach((tx) => {
//     const { token_name, sp, sol_balance, token_balance } = tx;
//     const type = sp === "Buy" ? "Buy" : "Sell";
//
//     if (!groupedTransactions[token_name]) {
//       groupedTransactions[token_name] = {
//         Buy: { total_sol_balance: 0, total_token_balance: 0 },
//         Sell: { total_sol_balance: 0, total_token_balance: 0 }
//       };
//     }
//
//     groupedTransactions[token_name][type].total_sol_balance += sol_balance;
//     groupedTransactions[token_name][type].total_token_balance += token_balance;
//   });
//
//   const csvRows = [
//     ["Token Name", "Buy or Sell", "Total SOL Balance", "Total Token Balance"]
//   ];
//
//   Object.keys(groupedTransactions).forEach(token_name => {
//     ["Buy", "Sell"].forEach(type => {
//       const data = groupedTransactions[token_name][type];
//       csvRows.push([
//         token_name,
//         type,
//         data.total_sol_balance,
//         data.total_token_balance
//       ]);
//     });
//   });
//
//   fs.writeFileSync("grouped_transactions.csv", csvRows.map(row => row.join(",")).join("\n"));
// };
const dotenv = require('dotenv');
const reloadEnv = () => {
    dotenv.config({path: '.env'});
};
const getTransactions = async (wallet, time_limit) => {
    let base_url = `https://api.helius.xyz/v0/addresses/${wallet}/transactions?api-key=${process.env.HELIUS_KEY}`;
    let url = base_url;
    let lastSignature = null;

    let ledger = {};
    let transaction_ledger = [];

    let total_count = 0;
    const limit = 30;
    let min_timestamp = 9999999999;
    let max_timestamp = -1;
    let is_finished = false;
    const fetchAndParseTransactions = async () => {
        // Create the CSV file and add headers
        const csvHeaders = [
            "Token Name",
            "Buy or Sell",
            "Timestamp",
            "SOL Balance",
            "Token Balance",
            "Description",
            "Signature",
            "USD Balance"  // Added USD Balance column
        ];
        fs.writeFileSync("transactions.csv", csvHeaders.join(",") + "\n");

        while (true) {
            if (is_finished == true) return;

            if (lastSignature) {
                url = base_url + `&before=${lastSignature}`;
            }
            const response = await fetch(url);
            const transactions = await response.json();

            if (transactions && transactions.length > 0) {
                for (var i = 0; i < transactions.length; i++) {
                    if (
                        transactions[i].type != "SWAP" &&
                        transactions[i].type != "INIT_SWAP"
                    )
                        continue;

                    if (
                        transactions[i].timestamp < time_limit &&
                        process.env.OPTION.toLowerCase() != "max"
                    ) {
                        is_finished = true;
                        continue;
                    }
                    if (transactions[i].description.length == 0)
                        continue;
                    const tokens = parseTransaction(transactions[i]);

                    if (tokens[1] != "SOL" && tokens[4] != "SOL")
                        continue;
                    if (tokens[1] == "SOL" && tokens[4] == "SOL")
                        continue;

                    let is_buy = false;
                    if (tokens[1] == "SOL") is_buy = false;
                    else is_buy = true;

                    const amount =
                        is_buy === true ? parseFloat(tokens[3]) : parseFloat(tokens[0]);
                    const token_amount =
                        is_buy === true ? parseFloat(tokens[0]) : parseFloat(tokens[3]);

                    let token_name = is_buy === true ? tokens[1] : tokens[4];
                    const sp = is_buy == true ? 1 : -1;
                    const timestamp = Math.round(transactions[i].timestamp / 60) * 60;

                    // Get the USD price of SOL at the timestamp
                    let usdPrice = getPrice(timestamp);
                    let usdBalance = amount * usdPrice;

                    if (ledger[token_name] === undefined || ledger[token_name] === null)
                        ledger[token_name] = [
                            {
                                timestamp,
                                token_amount,
                                amount,
                                usdBalance, // Include USD balance
                                sp,
                            },
                        ];
                    else
                        ledger[token_name].push({
                            timestamp,
                            token_amount,
                            amount,
                            usdBalance, // Include USD balance
                            sp,
                        });

                    const ts = transactions[i].timestamp * 1000; // converting seconds to milliseconds

                    transaction_ledger.push({
                        token_name,
                        sp: sp == 1 ? "Buy" : "Sell",
                        timestamp: new Date(ts).toUTCString().replace(",", " "),
                        sol_balance: amount,
                        usd_balance: usdBalance, // Include USD balance
                        token_balance: token_amount,
                        description: transactions[i].description,
                        signature: transactions[i].signature,
                    });

                    // Write each transaction to the CSV file
                    const csvRow = [
                        token_name,
                        sp == 1 ? "Buy" : "Sell",
                        new Date(ts).toUTCString().replace(",", " "),
                        amount,
                        token_amount,
                        transactions[i].description,
                        transactions[i].signature,
                        usdBalance  // Include USD balance
                    ];
                    fs.appendFileSync("transactions.csv", csvRow.join(",") + "\n");

                    total_count++;

                    if (min_timestamp > transactions[i].timestamp)
                        min_timestamp = transactions[i].timestamp;
                    if (max_timestamp < transactions[i].timestamp)
                        max_timestamp = transactions[i].timestamp;
                }
                lastSignature = transactions[transactions.length - 1].signature;
            } else {
                output("No more transactions available.");
                break;
            }
        }
    };
//   const fetchAndParseTransactions = async () => {
//     while (true) {
//       if (is_finished == true) return;
//
//       if (lastSignature) {
//         url = base_url + `&before=${lastSignature}`;
//       }
//       const response = await fetch(url);
//       const transactions = await response.json();
//
//       if (transactions && transactions.length > 0) {
//         for (var i = 0; i < transactions.length; i++) {
//           if (
//             transactions[i].type != "SWAP" &&
//             transactions[i].type != "INIT_SWAP"
//           )
//             continue;
//
//           if (
//             transactions[i].timestamp < time_limit &&
//             process.env.OPTION.toLowerCase() != "max"
//           ) {
//             is_finished = true;
//             continue;
//           }
//           if(transactions[i].description.length == 0)
//             continue;
//           const tokens = parseTransaction(transactions[i]);
//
//           if(tokens[1] != "SOL" && tokens[4] != "SOL")
//             continue;
//           if(tokens[1] == "SOL" && tokens[4] == "SOL")
//             continue;
//
//           let is_buy = false;
//           if (tokens[1] == "SOL") is_buy = false;
//           else is_buy = true;
//
//           const amount =
//             is_buy === true ? parseFloat(tokens[3]) : parseFloat(tokens[0]);
//           const token_amount =
//             is_buy === true ? parseFloat(tokens[0]) : parseFloat(tokens[3]);
//
//           let token_name = is_buy === true ? tokens[1] : tokens[4];
//           //token_name = token_name.toLowerCase();
//           output(
//             `[Description]  : ${transactions[i].description}
// [Signature]  : ${transactions[i].signature}
// [Amount] : ${amount}
// [Token Amount] : ${token_amount}
// [Buy Or Sell]  : ${is_buy == true ? "Buy" : "Sell"}
// [Token]        : ${token_name}\n`
//           );
//
//           const sp = is_buy == true ? 1 : -1;
//           const timestamp = Math.round(transactions[i].timestamp / 60) * 60;
//
//           if (ledger[token_name] === undefined || ledger[token_name] === null)
//             ledger[token_name] = [
//               {
//                 timestamp,
//                 token_amount,
//                 amount,
//                 sp,
//               },
//             ];
//           else
//             ledger[token_name].push({
//               timestamp,
//               token_amount,
//               amount,
//               sp,
//             });
//
//           const ts = transactions[i].timestamp * 1000; // converting seconds to milliseconds
//
//           transaction_ledger.push({
//             token_name,
//             sp: sp == 1 ? "Buy" : "Sell",
//             timestamp: new Date(ts).toUTCString().replace(",", " "),
//             sol_balance: amount,
//             token_balance: token_amount,
//             description: transactions[i].description,
//             signature: transactions[i].signature,
//           });
//
//           total_count++;
//
//           if (min_timestamp > transactions[i].timestamp)
//             min_timestamp = transactions[i].timestamp;
//           if (max_timestamp < transactions[i].timestamp)
//             max_timestamp = transactions[i].timestamp;
//         }
//         // output("Fetched transactions: ", transactions);
//         lastSignature = transactions[transactions.length - 1].signature;
//       } else {
//         output("No more transactions available.");
//         break;
//       }
//     }
//   };
    await fetchAndParseTransactions();
    return {
        transaction_ledger,
        ledger,
        total_count,
        min_timestamp,
        max_timestamp,
    };
};

function calcPNL(txs) {
    let has_both = 0;

    let sum = 0;
    for (let i = txs.length - 1; i >= 0; i--) {
        const record = txs[i];
        if (record.sp == 1)
            has_both++;
        if (record.sp == -1)
            has_both++;

        let price = getPrice(record.timestamp);
        if (record.sp == 1) {
            sum += price * record.amount;

            let bought_token_amount = record.token_amount;
            while (bought_token_amount > 0) {
                let flag = 0;
                for (let j = txs.length - 1; j >= 0; j--) {
                    const record1 = txs[j];
                    if (record1.sp == -1 && record1.token_amount > 0) {
                        flag = 1;
                        let price1 = getPrice(record1.timestamp);

                        const per_token_price =
                            (1.0 * price1 * record1.amount) / record1.token_amount;
                        if (record1.token_amount > bought_token_amount) {
                            sum -= per_token_price * bought_token_amount;
                            txs[j].token_amount -= bought_token_amount;
                            bought_token_amount = 0;
                        } else {
                            sum -= per_token_price * record1.token_amount;
                            bought_token_amount -= txs[j].token_amount;
                            txs[j].token_amount = 0;
                        }
                    }
                }
                if (flag == 0) break;
            }
        }
    }

    if (sum == 0) {
        for (let i = 0; i < txs.length; i++) {
            const record = txs[i];
            let price = getPrice(record.timestamp);

            if (record.sp == -1 && record.token_amount > 0) {
                const per_token_price =
                    (1.0 * price * record.amount) / record.token_amount;
                sum -= record.token_amount * per_token_price;
            }
        }
    }

    return {
        token_sum: sum,
        has_both: has_both == 2
    };
}

function ledgerToCSV(ledger) {
    let rows = [];
    rows.push([
        "Pair Token",
        "Unit Purchased",
        "Price You Purchased",
        "1 SOL Price At Time Of Purchase",
        "Spent On Transaction"
    ]);
    Object.keys(ledger).forEach(key => {
        const records = ledger[key];
        records.forEach(record => {
            if (record.sp == -1) {
                const price = getPrice(record.timestamp);
                rows.push([
                    `SOL/${key}`,
                    record.amount,
                    record.token_amount,
                    price,
                    price * record.amount,
                ]);
            }
        });
        records.forEach(record => {
            if (record.sp == 1) {
                const price = getPrice(record.timestamp);
                rows.push([
                    `${key}/SOL`,
                    record.token_amount,
                    record.amount,
                    price,
                    price * record.amount,
                ]);
            }
        });
    });
    fs.writeFileSync("swaptoken.csv", rows.map((row) => row.join(",")).join("\n"));
}

const path = 'final.csv';
function formatCurrencyString(currencyString) {
    // Extract the numerical part and the currency part
    let [numberPart, currencyPart] = currencyString.split(' ');

    // Format the number part
    let formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(parseFloat(numberPart));

    // Replace commas with single quotes
    formattedNumber = formattedNumber.replace(/,/g, "'");

    return `${formattedNumber} ${currencyPart}`;
}


const updateFinalCSV = (address, winRate, totalInvestment, totalReturned) => {
    let format = formatCurrencyString(totalInvestment);
    let totalRoundFor = formatCurrencyString(totalReturned);
    // const headers = "Address,WinRate,TotalInvestment,TotalReturned,ROI,ROIPercentage\n";
    // const newRow = `${address},${winRate},${format},${totalRoundFor},${ROI},${ROIP}\n`;


    const headers = "Address,WinRate\n";
    const newRow = `${address},${winRate}\n`;

    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, headers + newRow, 'utf8');
        console.log('final.csv created and data added.');
    } else {
        fs.appendFileSync(path, newRow, 'utf8');
        console.log('Data appended to final.csv.');
    }
};

async function main(wallet) {
    console.log(`Processing wallet address: ${wallet}`);
    let duration = 0;

    if (process.env.OPTION.toLowerCase() == "30d") duration = 24 * 3600 * 30;
    else if (process.env.OPTION.toLowerCase() == "15d") duration = 24 * 3600 * 15;
    else if (process.env.OPTION.toLowerCase() == "14d") duration = 24 * 3600 * 14;
    else if (process.env.OPTION.toLowerCase() == "7d") duration = 24 * 3600 * 7;
    else if (process.env.OPTION.toLowerCase() == "24h") duration = 24 * 3600;
    let time_limit = parseInt(new Date().getTime() / 1000) - duration;
    const time1 = new Date(time_limit * 1000);
    time1.setHours(0);
    time1.setMinutes(0);
    time1.setSeconds(0);
    time_limit = time1.getTime() / 1000;

    const {
        ledger,
        transaction_ledger,
        total_count,
        min_timestamp,
        max_timestamp,
    } = await getTransactions(wallet, time_limit);
    groupTransactions(transaction_ledger, wallet);
    let sum = 0;
    let win_count = 0;
    let final_ledger = {};
    output(ledger);
    ledgerToCSV(ledger);
    Object.keys(ledger).forEach((key) => {

        const {token_sum, has_both} = calcPNL(ledger[key]);
        if (token_sum > 0 && has_both) {
            win_count++;
        }
        final_ledger[key] = token_sum;
        if (!isNaN(token_sum))
            sum += token_sum;
    });
    //const win_rate_percent = 100.0 * Object.keys(final_ledger).length / Object.keys(ledger).length;
    const win_rate_percent = (100.0 * win_count) / Object.keys(final_ledger).length;
    const winRate = `${
        isNaN(win_rate_percent) ? 0 : win_rate_percent.toFixed(1)
    }% (${win_count}/${Object.keys(final_ledger).length})`;

    const totalPnL = `${sum.toFixed(2)}$`;

    output(final_ledger);
    output(`Total Transaction: ${total_count}`);
    output(`Win Rate: ${winRate}`);
    output(`Total PnL: ${totalPnL}`);
    // output(`Min Timestamp: ${min_timestamp}`);
    // output(`Max Timestamp: ${max_timestamp}`);
    // const rows = [
    //   [
    //     "Status",
    //     "Token Name",
    //     "Sol balance change",
    //     "Token balance change",
    //     "DateTime",
    //     "Description",
    //     "URL",
    //   ],
    // ];
    // transaction_ledger.forEach((r) => {
    //   rows.push([
    //     r.sp,
    //     r.token_name,
    //     r.sol_balance.toFixed(3),
    //     r.token_balance.toFixed(3),
    //     r.timestamp,
    //     r.description,
    //     `https://solscan.io/tx/${r.signature}`
    //   ]);
    // });
    // rows.push([
    //   ["\n"],
    //   ["Symbol", "PnL"]
    // ]);
    // Object.keys(final_ledger).forEach(key => {
    //   rows.push([
    //     [' ', key, parseFloat(final_ledger[key]).toFixed(3)]
    //   ]);
    // });
    // rows.push([
    //   ["\n"],
    //   ["Wallet Address", wallet],
    //   ["\n"],
    //   ["Win Rate", winRate],
    //   ["\n"],
    //   ["PNL", totalPnL],
    //   ["\n"],
    //   ["Total Transaction", total_count],
    // ]);

    // Write the data to a CSV file
    //fs.writeFileSync("output.csv", rows.map((row) => row.join(",")).join("\n"));

    return {
        wallet,
        winRate,
        totalPnL,
        totalCount: total_count,
    };
}

module.exports = {main};
if (require.main === module) {
    const wallet = process.argv[2]; // Get wallet address from command line argument
    main(wallet).catch(console.error);
}


fs.writeFile("transaction.log", "Buy and Sell\n", (err) => {
});

readPricesFromCSV().then(async () => {
    readCSVFile("list.csv").then(async (data) => {
        let seek_indicator = parseInt(process.env.STARTING_INDEX);
        let rows = [];
        rows.push([
            "Wallet Address",
            "Win Rate",
            "PNL",
            "Total Transactions"
        ]);

        function startScan(address) {
            const start_time = parseInt(new Date().getTime() / 1000);
            console.log(`========Scanning for ${address} is started.`);
            main(address).then((res) => {
                const end_time = parseInt(new Date().getTime() / 1000);
                console.log(
                    `========Scanning for ${address} is completed: ${
                        end_time - start_time
                    }s collapsed`
                );

                // Write to final csv
                rows.push([
                    res.wallet,
                    res.winRate,
                    res.totalPnL,
                    res.totalCount,
                ]);
                fs.writeFileSync("output.csv", rows.map((row) => row.join(",")).join("\n"));

                seek_indicator++;
                if (
                    seek_indicator < data.length &&
                    process.env.LOAD_FROM_CSV == "true"
                ) {
                    const address = data[seek_indicator].address;
                    startScan(address);
                } else {
                    writePricesToCSV();
                    console.log("All completed.");
                }
            });
        }

        if (process.env.LOAD_FROM_CSV == "true") {
            if (data.length > 0) startScan(data[seek_indicator].address);
        } else {
            // startScan(process.env.WALLET);
        }
    });
});
