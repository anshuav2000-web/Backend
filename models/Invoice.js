const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
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
    amount: {
        type: Number,
        required: true,
    },
    tax: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
        default: 'draft',
    },
    dueDate: {
        type: Date,
        required: true,
    },
    paidDate: {
        type: Date,
    },
    notes: {
        type: String,
    },
    items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);