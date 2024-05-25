const mongoose = require('mongoose');
const Counter = require('./counters');

const userSchema = new mongoose.Schema({
    user_id: { type: Number, unique: true },
    user_code: { type: String, default: '' },
    username: { type: String, maxlength: 250, default: '' },
    email: { type: String, maxlength: 250, default: '' },
    phone: { type: String, maxlength: 11, default: '' },
    password: { type: String, maxlength: 1000, default: '' },
    country_code: { type: String, maxlength: 10, default: '' },
    confirmation_key: { type: String, maxlength: 250, default: '' },
    confirmed: { type: String, enum: ['Y', 'N'], default: 'N' },
    phone_verify: { type: String, enum: ['Y', 'N'], default: 'N' },
    email_verify: { type: String, enum: ['Y', 'N'], default: 'N' },
    reset_key: { type: String, maxlength: 250, default: '' },
    reset_confirmed: { type: String, enum: ['Y', 'N'], default: 'N' },
    otp_confirmation_key: { type: String, maxlength: 250, default: '' },
    reset_timestamp: { type: Date, default: Date.now },
    user_role: { type: Number, default: 1 },
    last_login: { type: Date, default: Date.now },
    banned: { type: String, enum: ['Y', 'N'], default: 'N' },
    register_date: { type: Date, default: '' },
    membership_code: { type: String, maxlength: 250, default: '' },
    status: { type: String, maxlength: 250, default: '' },
  // other fields
});


userSchema.pre('save', async function (next) {
    const doc = this;
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'user_id' },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
  
      doc.user_id = counter.seq;
      next();
    } catch (error) {
      return next(error);
    }
  });
  
  const User = mongoose.models.users || mongoose.model('users', userSchema);
  
  module.exports = User;
