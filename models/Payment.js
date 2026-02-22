const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank-transfer', 'credit-card', 'paypal', 'stripe', 'other'],
        required: true,
    },
    transactionId: {
        type: String,
    },
    paymentDate: {
        type: Date,
        required: true,
    },
    notes: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Payment', PaymentSchema);