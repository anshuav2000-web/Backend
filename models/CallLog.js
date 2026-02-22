const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true,
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
    },
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    duration: {
        type: Number, // in seconds
    },
    outcome: {
        type: String,
        enum: ['answered', 'voicemail', 'no-answer', 'busy', 'failed'],
    },
    notes: {
        type: String,
    },
    followUpRequired: {
        type: Boolean,
        default: false,
    },
    followUpDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('CallLog', CallLogSchema);