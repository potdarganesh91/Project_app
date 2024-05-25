// config/models/counters.js
const mongoose = require('mongoose');

let Counter;

try {
  // Try to get the existing model
  Counter = mongoose.model('counters');
} catch (error) {
  // If the model doesn't exist, create it
  const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 1 }
  });

  Counter = mongoose.model('counters', counterSchema);
}

module.exports = Counter;
