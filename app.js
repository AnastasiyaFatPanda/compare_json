import fs from 'fs';
import JSONStream from 'JSONStream';
import deepDiff from 'deep-diff';
import moment from 'moment';

const now = moment().format('YYYYMMDDHHmm');
const logFilePath = `./differences${now}.log`; // Path to the log file

// Function to process and compare JSON files
async function compareJSONFiles(file1Path, file2Path) {
  try {
    // Read and collect data from both files
    const [file1Data, file2Data] = await Promise.all([readJSONFile(file1Path), readJSONFile(file2Path)]);

    // Compare collected data
    compareData(file1Data, file2Data);
  } catch (error) {
    console.error('Error during file comparison:', error.message);
  }
}

// Function to read a JSON file and return its data as an array
function readJSONFile(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    const stream = fs.createReadStream(filePath).pipe(JSONStream.parse('*'));

    stream.on('data', (chunk) => {
      data.push(chunk);
    });

    stream.on('end', () => {
      console.log(`The file was read ${filePath}`);
      resolve(data);
    });

    stream.on('error', (err) => {
      console.log(`Error during reading ${filePath}: \n ${err}`);
      reject(err);
    });
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
