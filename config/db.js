const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // @ts-ignore
        await mongoose.connect('mongodb://localhost:27017/project_dev', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();
module.exports = connectDB;
