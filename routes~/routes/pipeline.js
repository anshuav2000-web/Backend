const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Deal = require('../models/Deal');
const { protect } = require('../middleware/auth');

// @route   GET /api/pipeline
// @desc    Get all deals
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { stage, search } = req.query;
        const query = {};

        if (stage) query.stage = stage;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const deals = await Deal.find(query)
            .populate('leadId', 'name email company')
            .populate('contactId', 'firstName lastName')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: deals,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/pipeline/stats
// @desc    Get pipeline statistics
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
    try {
        const totalValue = await Deal.aggregate([
            { $group: { _id: null, total: { $sum: '$value' } } },
        ]);

        const stageStats = await Deal.aggregate([
            {
                $group: {
                    _id: '$stage',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$value' },
                },
            },
        ]);

        const wonDeals = await Deal.countDocuments({ stage: 'won' });
        const lostDeals = await Deal.countDocuments({ stage: 'lost' });
        const conversionRate = wonDeals + lostDeals > 0
            ? ((wonDeals / (wonDeals + lostDeals)) * 100).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                totalValue: totalValue[0]?.total || 0,
                stageStats,
                conversionRate,
                wonDeals,
                lostDeals,
            },
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/pipeline
// @desc    Create new deal
// @access  Private
router.post(
    '/',
    protect,
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('value').isNumeric().withMessage('Value must be a number'),
        body('leadId').notEmpty().withMessage('Lead ID is required'),
    ],
    async (req, res, next) => {
        try {
            const deal = await Deal.create({
                ...req.body,
                assignedTo: req.user._id,
            });

            const populatedDeal = await Deal.findById(deal._id)
                .populate('leadId', 'name email company')
                .populate('contactId', 'firstName lastName')
                .populate('assignedTo', 'name email');

            res.status(201).json({
                success: true,
                data: populatedDeal,
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/pipeline/:id
// @desc    Update deal
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        const deal = await Deal.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found',
            });
        }

        const populatedDeal = await Deal.findById(deal._id)
            .populate('leadId', 'name email company')
            .populate('contactId', 'firstName lastName')
            .populate('assignedTo', 'name email');

        res.status(200).json({
            success: true,
            data: populatedDeal,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/pipeline/:id
// @desc    Delete deal
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const deal = await Deal.findByIdAndDelete(req.params.id);

        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Deal deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;