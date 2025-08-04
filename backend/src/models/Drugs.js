// backend/src/models/Drug.js
const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
  Drugname: {
    type: String,
    required: true,
    unique: true
  },
  Price: {
    type: Number, // Use Number for the price
    required: true,
  },
  Form: {
    type: String,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  Company: {
    type: String,
    required: true,
  }
});

// This helps find the drug name even if it's not a perfect match
drugSchema.index({ Drugname: 'text' });

module.exports = mongoose.model('Drug', drugSchema);