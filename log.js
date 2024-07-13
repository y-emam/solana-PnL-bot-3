const fs = require('fs');

function output(str) {
  // Log the string to the console
  console.log(str);

  // let logData;
  // if (typeof str === 'string') {
  //   logData = str;
  // } else if (typeof str === 'object') {
  //   logData = JSON.stringify(str, null, 2);
  // } else {
  //   console.error('Invalid input type. Only strings and objects are supported.');
  //   return;
  // }

  // //Append the string to the log file
  // fs.appendFile("transaction.log", logData + '\n', (err) => {
  // });
}

module.exports = {
    output
}