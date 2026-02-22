const mongoose = require('mongoose');

const WebhookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    event: {
        type: String,
        required: true,
        enum: ['lead.created', 'lead.updated', 'lead.deleted', 'invoice.created', 'invoice.updated', 'invoice.paid', 'payment.created', 'task.created', 'task.updated', 'task.completed'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    headers: {
        type: Object,
        default: {},
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

module.exports = mongoose.model('Webhook', WebhookSchema);