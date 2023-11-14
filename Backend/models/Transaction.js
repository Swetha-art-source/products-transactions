// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Define your schema based on the data structure from the API
  // For example:
  id: { type: Number },
  title: { type: String },
  price: {type: Number},
  description: {type: String},
  category: {type: String},
  image: {type: String},
  sold: {type: Boolean},
  dateOfSale: {type: Date}

  // Add other fields as needed
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
