import fs from 'fs';
import JSONStream from 'JSONStream';
import deepDiff from 'deep-diff';
import moment from 'moment';

const now = moment().format('YYYYMMDDHHmm');
const logFilePath = `./differences${now}.log`; // Path to the log file

// Function to process and compare JSON files
function compareJSONFiles(file1Path, file2Path) {
  const file1Stream = fs.createReadStream(file1Path).pipe(JSONStream.parse('*'));
  const file2Stream = fs.createReadStream(file2Path).pipe(JSONStream.parse('*'));

  let file1Data = [];
  let file2Data = [];

  // Collect data from file1
  file1Stream.on('data', (data) => {
    file1Data.push(data);
  });

  file1Stream.on('end', () => {
    console.log('File1 data collection complete.');
  });

  file1Stream.on('error', (err) => {
    console.error('Error reading file1:', err.message);
  });

  // Collect data from file2
  file2Stream.on('data', (data) => {
    file2Data.push(data);
  });

  file2Stream.on('end', () => {
    console.log('File2 data collection complete.');
    compareData(file1Data, file2Data);
  });

  file2Stream.on('error', (err) => {
    console.error('Error reading file2:', err.message);
  });
}

// Function to compare two arrays of JSON data and log differences
function compareData(data1, data2) {
  const length = Math.min(data1.length, data2.length);
  let logEntries = '';

  for (let i = 0; i < length; i++) {
    const diff = deepDiff(data1[i], data2[i]);

    if (diff) {
      logEntries += `Difference found in row ${i + 1}:\n`;
      logEntries += `Row ${i + 1} from File1:\n${JSON.stringify(data1[i], null, 2)}\n`;
      logEntries += `Row ${i + 1} from File2:\n${JSON.stringify(data2[i], null, 2)}\n`;
      logEntries += `Differences:\n${JSON.stringify(diff, null, 2)}\n`;
      logEntries += '---\n';
    }
  }

  if (logEntries) {
    // Write the latest differences to the log file
    fs.writeFile(logFilePath, logEntries, (err) => {
      if (err) {
        console.error('Error writing to log file:', err.message);
      } else {
        console.log('Log file updated with latest differences.');
      }
    });
  } else {
    console.log('No differences found. (thanks god)');
  }
}

// Compare two JSON files
compareJSONFiles('./file1.json', './file2.json');
