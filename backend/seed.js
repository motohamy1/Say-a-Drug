// backend/seed.js
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Drug = require('./src/models/Drugs'); // Correct path to your model

const seedDatabase = async () => {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 2. Clear existing drugs to avoid duplicates
    await Drug.deleteMany({});
    console.log('Cleared existing drugs.');

    // 3. Read the JSON file
    const jsonPath = path.join(__dirname, 'egyptian_drugs.json'); // Assumes the file is in the 'backend' folder
    const drugsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Found ${drugsData.length} drugs in the JSON file.`);

    // 4. Filter out invalid entries (empty Drugname, etc.)
    const validDrugs = drugsData.filter(drug => 
      drug.Drugname && 
      drug.Drugname.trim() !== '' && 
      drug.Price !== undefined &&
      drug.Form && 
      drug.Category && 
      drug.Company
    );
    
    console.log(`Filtered to ${validDrugs.length} valid drugs (removed ${drugsData.length - validDrugs.length} invalid entries).`);

    // 5. Insert the valid data
    await Drug.insertMany(validDrugs);
    console.log('✅ Successfully seeded the database!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // 6. Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seedDatabase();