const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const CallLog = require('../models/CallLog');
const { protect } = require('../middleware/auth');

// @route   GET /api/call-logs
// @desc    Get all call logs
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { phoneNumber: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } },
            ];
        }

        const callLogs = await CallLog.find(query)
            .populate('leadId', 'name email')
            .populate('contactId', 'firstName lastName')
            .populate('caller', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await CallLog.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: callLogs,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/call-logs
// @desc    Create new call log
// @access  Private
router.post(
    '/',
    protect,
    [
        body('leadId').notEmpty().withMessage('Lead ID is required'),
        body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    ],
    async (req, res, next) => {
        try {
            const callLog = await CallLog.create({
                ...req.body,
                caller: req.user._id,
            });

            const populatedCallLog = await CallLog.findById(callLog._id)
                .populate('leadId', 'name email')
                .populate('contactId', 'firstName lastName')
                .populate('caller', 'name email');

            res.status(201).json({
                success: true,
                data: populatedCallLog,
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   DELETE /api/call-logs/:id
// @desc    Delete call log
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const callLog = await CallLog.findByIdAndDelete(req.params.id);

        if (!callLog) {
            return res.status(404).json({
                success: false,
                message: 'Call log not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Call log deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;