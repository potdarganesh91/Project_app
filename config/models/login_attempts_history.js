const mongoose = require('mongoose');
const Counter = require('./counters');

const loginAttemptsSchema = new mongoose.Schema({
  id_attempts: { type: Number, unique: true },
  user_ip_address: { type: String, maxlength: 50, default: null },
  no_of_attempt: { type: Number, default: 1 },
  date: { type: Date, default: null }
});

loginAttemptsSchema.pre('save', async function (next) {
  const doc = this;
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'id_attempts' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    doc.id_attempts = counter.seq;
    next();
  } catch (error) {
    return next(error);
  }
});
loginAttemptsSchema.set('collection', 'login_attempts_history');
const LoginAttempts = mongoose.model('login_attempts_history', loginAttemptsSchema);

module.exports = LoginAttempts;
