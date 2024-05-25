const mongoose = require('mongoose');
const Counter = require('./counters');

const fileArchiveSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  tablename: { type: String, maxlength: 250, required: true },
  filetype: { type: String, maxlength: 250, required: true },
  min_file_size: { type: String, maxlength: 250, required: true },
  max_file_size: { type: String, maxlength: 222, required: true }
});

fileArchiveSchema.pre('save', async function (next) {
  const doc = this;
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'file_archive_id' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    doc.id = counter.seq;
    next();
  } catch (error) {
    return next(error);
  }
});

const FileArchive = mongoose.model('file_archives', fileArchiveSchema);

module.exports = FileArchive;
