const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Use the correct path for the CSV file
const filePath = path.join(__dirname, 'backend', 'data', 'medicines_data_updated.csv');

console.log('CSV file path:', filePath);
console.log('File exists:', fs.existsSync(filePath));

if (!fs.existsSync(filePath)) {
  console.log('CSV file not found!');
  process.exit(1);
}

const results = [];
let rowCount = 0;

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (data) => {
    if (rowCount < 3) {  // Only take first 3 rows
      results.push(data);
    }
    rowCount++;
  })
  .on('end', () => {
    console.log(`Total rows: ${rowCount}`);
    
    if (results.length > 0) {
      console.log('\nHeaders:', Object.keys(results[0]));
      
      console.log('\nSample rows:');
      results.forEach((row, index) => {
        console.log(`\nRow ${index + 1}:`);
        Object.keys(row).forEach(key => {
          console.log(`  ${key}: ${row[key]}`);
        });
      });
    }
    
    console.log('\nDone!');
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
  });
