const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Webhook = require('../models/Webhook');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/webhooks
// @desc    Get all webhooks
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const webhooks = await Webhook.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: webhooks.length,
            data: webhooks,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/webhooks
// @desc    Create new webhook
// @access  Private (Admin only)
router.post(
    '/',
    protect,
    authorize('admin'),
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('url').isURL().withMessage('Please provide a valid URL'),
        body('event').notEmpty().withMessage('Event is required'),
    ],
    async (req, res, next) => {
        try {
            const webhook = await Webhook.create(req.body);

            res.status(201).json({
                success: true,
                data: webhook,
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/webhooks/:id
// @desc    Update webhook
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const webhook = await Webhook.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!webhook) {
            return res.status(404).json({
                success: false,
                message: 'Webhook not found',
            });
        }

        res.status(200).json({
            success: true,
            data: webhook,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/webhooks/:id
// @desc    Delete webhook
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const webhook = await Webhook.findByIdAndDelete(req.params.id);

        if (!webhook) {
            return res.status(404).json({
                success: false,
                message: 'Webhook not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Webhook deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;