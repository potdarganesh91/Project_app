const mongoose = require('mongoose');

const Counter = require('./counters');

const userInfoSchema = new mongoose.Schema({
  id_user_details: { type: Number, unique: true },
  user_id: { type: Number, default: '' },
  first_name: { type: String, maxlength: 100, default: '' },
  middle_name: { type: String, maxlength: 100, default: '' },
  last_name: { type: String, maxlength: 100, default: '' },
  birth_date: { type: String, maxlength: 250, default: '' },
  department: { type: String, maxlength: 50, default: '' },
  position: { type: String, maxlength: 50, default: '' },
  qualification: { type: String, maxlength: 250, default: '' },
  joining_date: { type: String, maxlength: 250, default: '' },
  relieve_date: { type: Date, default: '' },
  address: { type: String, maxlength: 250, default: '' },
  // additional fields based on your needs
});

userInfoSchema.pre('save', async function (next) {
  const doc = this;
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'id_user_details' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    doc.id_user_details = counter.seq;
    next();
  } catch (error) {
    return next(error);
  }
});

userInfoSchema.set('collection', 'user_info');

const UserInfo = mongoose.model('UserInfo', userInfoSchema);


module.exports = UserInfo;
