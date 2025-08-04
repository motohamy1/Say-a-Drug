const { exec } = require('child_process');
const path = require('path');

// Install csv-parser if not already installed
console.log('Installing csv-parser...');

exec('npm install csv-parser', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error installing csv-parser: ${error}`);
    return;
  }
  
  console.log('csv-parser installed successfully!');
  
  // Run the inspection script
  console.log('Running CSV inspection...');
  
  exec('node inspect-csv.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running inspection: ${error}`);
      return;
    }
    
    console.log('CSV Inspection Output:');
    console.log(stdout);
    
    if (stderr) {
      console.error('Errors:', stderr);
    }
  });
});
