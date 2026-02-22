const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// @route   GET /api/expenses
// @desc    Get all expenses
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        const query = {};

        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const expenses = await Expense.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ expenseDate: -1 });

        const count = await Expense.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: expenses,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/expenses/stats
// @desc    Get expense statistics
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
    try {
        const totalExpenses = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const categoryStats = await Expense.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalExpenses: totalExpenses[0]?.total || 0,
                categoryStats,
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post(
    '/',
    protect,
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('category').notEmpty().withMessage('Category is required'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('expenseDate').notEmpty().withMessage('Expense date is required'),
    ],
    async (req, res, next) => {
        try {
            const expense = await Expense.create(req.body);

            res.status(201).json({
                success: true,
                data: expense,
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found',
            });
        }

        res.status(200).json({
            success: true,
            data: expense,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;