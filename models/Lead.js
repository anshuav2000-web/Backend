const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    company: {
        type: String,
    },
    source: {
        type: String,
        enum: ['website', 'referral', 'social media', 'email', 'phone', 'other'],
        default: 'other',
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
        default: 'new',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    notes: {
        type: String,
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

module.exports = mongoose.model('Lead', LeadSchema);