const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
            ];
        }

        const payments = await Payment.find(query)
            .populate('invoiceId', 'invoiceNumber leadId')
            .populate('invoiceId.leadId', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ paymentDate: -1 });

        const count = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: payments,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/payments
// @desc    Create new payment
// @access  Private
router.post(
    '/',
    protect,
    [
        body('invoiceId').notEmpty().withMessage('Invoice ID is required'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('paymentMethod').notEmpty().withMessage('Payment method is required'),
        body('paymentDate').notEmpty().withMessage('Payment date is required'),
    ],
    async (req, res, next) => {
        try {
            const payment = await Payment.create(req.body);

            const populatedPayment = await Payment.findById(payment._id)
                .populate('invoiceId', 'invoiceNumber leadId')
                .populate('invoiceId.leadId', 'name email');

            res.status(201).json({
                success: true,
                data: populatedPayment,
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   DELETE /api/payments/:id
// @desc    Delete payment
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;