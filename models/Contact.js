const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    company: {
        type: String,
    },
    position: {
        type: String,
    },
    address: {
        type: String,
    },
    notes: {
        type: String,
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Contact', ContactSchema);