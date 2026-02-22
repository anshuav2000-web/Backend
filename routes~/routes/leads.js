const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

// @route   GET /api/leads
// @desc    Get all leads
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, source, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (source) query.source = source;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }

        const leads = await Lead.find(query)
            .populate('assignedTo', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Lead.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: leads,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('assignedTo', 'name email');

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
            });
        }

        res.status(200).json({
            success: true,
            data: lead,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/leads
// @desc    Create new lead
// @access  Private
router.post(
    '/',
    protect,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please include a valid email'),
    ],
    async (req, res, next) => {
        try {
            const lead = await Lead.create({
                ...req.body,
                assignedTo: req.user._id,
            });

            res.status(201).json({
                success: true,
                data: lead,
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/leads/:id
// @desc    Update lead
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
            });
        }

        res.status(200).json({
            success: true,
            data: lead,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/leads/:id
// @desc    Delete lead
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lead deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/leads/stats/summary
// @desc    Get lead statistics
// @access  Private
router.get('/stats/summary', protect, async (req, res, next) => {
    try {
        const totalLeads = await Lead.countDocuments();
        const newLeads = await Lead.countDocuments({
            status: 'new',
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        });

        const statusCounts = await Lead.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalLeads,
                newLeads,
                statusCounts,
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;