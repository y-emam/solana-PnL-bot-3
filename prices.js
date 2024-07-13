const axios = require("axios");
const fs = require("fs");
const csv = require('csv-parser');
let prices = [];

let new_min_timestamp = 0;
let new_max_timestamp = 0;

const fetch_price = async (min_timestamp, max_timestamp) => {
  const options = {
    method: "GET",
    url: "https://public-api.birdeye.so/defi/history_price",
    params: {
      address: "So11111111111111111111111111111111111111112",
      address_type: "token",
      type: "1m",
      time_from: min_timestamp,
      time_to: max_timestamp,
    },
    headers: { "X-API-KEY": "eb09219a425a4cda8521496e980765c2" },
  };
  const response = await axios.request(options);
  const items = response.data.data.items;
  const list = {};
  items.forEach((item) => {
    list[item.unixTime.toString()] = item.value;
    prices[item.unixTime.toString()] = item.value;
  });
  return list;
};

function getPrice(timestamp) {
  const filtered_timestamp = Math.round(timestamp / 60) * 60;
  if (prices[filtered_timestamp] == undefined) {
    if(new_min_timestamp > filtered_timestamp - 60 || new_min_timestamp == 0)
      new_min_timestamp = filtered_timestamp - 60;
    if(new_max_timestamp < filtered_timestamp + 60 || new_max_timestamp == 0)
      new_max_timestamp = filtered_timestamp + 60;

    //return prices[filtered_timestamp];
    return defaultPrice();
  }
  return prices[filtered_timestamp];
}

function readPricesFromCSV() {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream("prices.csv")
      .pipe(csv())
      .on("data", (row) => {
        const { timestamp, value } = row;
        prices[timestamp] = value;
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

async function writePricesToCSV() {
  if(new_min_timestamp != 0 && new_max_timestamp != 0)
  {
    console.log("fetch_price");
    console.log(new_min_timestamp);
    console.log(new_max_timestamp);
    fetch_price(
      new_min_timestamp,
      new_max_timestamp,
    ).then(res => {
      let rows = [[
        "timestamp",
        "value",
      ]];
    
      Object.keys(prices).forEach((key) => {
        rows.push([key, prices[key]]);
      });
      fs.writeFileSync("prices.csv", rows.map((row) => row.join(",")).join("\n"));
    });
  }
  else {
    let rows = [[
      "timestamp",
      "value",
    ]];

    Object.keys(prices).forEach((key) => {
      rows.push([key, prices[key]]);
    });
    fs.writeFileSync("prices.csv", rows.map((row) => row.join(",")).join("\n"));
  }
}

function defaultPrice() {
  if (Object.keys(prices).length < 1) return 135.0;
  return prices[Object.keys(prices)[Object.keys(prices).length - 1]];
}

module.exports = {
  getPrice,
  readPricesFromCSV,
  writePricesToCSV,
};
