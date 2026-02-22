const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['office', 'marketing', 'travel', 'software', 'salary', 'other'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank-transfer', 'credit-card', 'other'],
    },
    expenseDate: {
        type: Date,
        required: true,
    },
    receipt: {
        type: String, // URL to receipt file
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Expense', ExpenseSchema);