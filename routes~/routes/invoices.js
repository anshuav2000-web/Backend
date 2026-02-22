const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Invoice = require('../models/Invoice');
const { protect } = require('../middleware/auth');

// @route   GET /api/invoices
// @desc    Get all invoices
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
            ];
        }

        const invoices = await Invoice.find(query)
            .populate('leadId', 'name email company')
            .populate('contactId', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Invoice.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: invoices,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/invoices/:id
// @desc    Get single invoice
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('leadId', 'name email company')
            .populate('contactId', 'firstName lastName');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        res.status(200).json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/invoices
// @desc    Create new invoice
// @access  Private
router.post(
    '/',
    protect,
    [
        body('invoiceNumber').notEmpty().withMessage('Invoice number is required'),
        body('leadId').notEmpty().withMessage('Lead ID is required'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
        body('dueDate').notEmpty().withMessage('Due date is required'),
    ],
    async (req, res, next) => {
        try {
            const invoice = await Invoice.create(req.body);

            const populatedInvoice = await Invoice.findById(invoice._id)
                .populate('leadId', 'name email company')
                .populate('contactId', 'firstName lastName');

            res.status(201).json({
                success: true,
                data: populatedInvoice,
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/invoices/:id
// @desc    Update invoice
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        const populatedInvoice = await Invoice.findById(invoice._id)
            .populate('leadId', 'name email company')
            .populate('contactId', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: populatedInvoice,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/invoices/:id
// @desc    Delete invoice
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Invoice deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;