const mongoose = require('mongoose');

const Counter = require('./counters');

const userRoleSchema = new mongoose.Schema({
  role_id: { type: Number, unique: true, required: true },
  role: { type: String, maxlength: 50, required: true },
  Date: { type: Date, default: Date.now, required: true }
});

userRoleSchema.pre('save', async function (next) {
    const doc = this;
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'role_id' },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
  
      doc.role_id = counter.seq;
      next();
    } catch (error) {
      return next(error);
    }
  });
  
  const UserRoles = mongoose.models.user_roles || mongoose.model('user_roles', userRoleSchema);
  
  module.exports = UserRoles;
