const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    parentName: {
        type: String,
        required: [true, 'Parent name is required']
    },
    relationship: {
        type: String,
        required: [true, 'Relationship is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    studentName: {
        type: String,
        required: [true, 'Student name is required']
    },
    grade: {
        type: String,
        required: [true, 'Grade is required']
    },
    submissionDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Parent', parentSchema);