const mongoose = require('mongoose');
const Counter = require('./counters');

const socialLoginSchema = new mongoose.Schema({
  user_id: { type: Number,  default: null },
  provider: { type: String, maxlength: 50, default: null },
  provider_id: { type: String, maxlength: 250, default: null },
  created_at: { type: Date, default: Date.now }
});

socialLoginSchema.pre('save', async function (next) {
  const doc = this;
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'social_login_id' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    doc.id = counter.seq;
    next();
  } catch (error) {
    return next(error);
  }
});

const SocialLogin = mongoose.model('social_logins', socialLoginSchema);

module.exports = SocialLogin;
