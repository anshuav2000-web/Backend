const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    value: {
        type: Number,
        required: true,
    },
    stage: {
        type: String,
        enum: ['prospect', 'proposal', 'negotiation', 'commitment', 'won', 'lost'],
        default: 'prospect',
    },
    probability: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true,
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    closeDate: {
        type: Date,
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

module.exports = mongoose.model('Deal', DealSchema);