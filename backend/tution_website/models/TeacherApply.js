const mongoose = require('mongoose');

const teacherApplySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cv: {
        type: String,  // Will store Cloudinary URL
        required: true
    },
    certificates: [{
        type: String  // Will store Cloudinary URLs
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    subjects: {
        type: [{
            type: String,
            enum: {
                values: ['mathematics', 'science', 'english', 'physics', 'chemistry', 'computer'],
                message: '{VALUE} is not a valid subject'
            }
        }],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'At least one subject must be selected'
        }
    },
    fees: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d+(\-\d+|\+)?$/.test(v);
            },
            message: props => `${props.value} is not a valid fee range!`
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('TeacherApply', teacherApplySchema);