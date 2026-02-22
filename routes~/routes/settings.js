const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get all settings
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const settings = await Setting.find();

        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });

        res.status(200).json({
            success: true,
            data: settingsObj,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/settings/:key
// @desc    Get setting by key
// @access  Private
router.get('/:key', protect, async (req, res, next) => {
    try {
        const setting = await Setting.findOne({ key: req.params.key });

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found',
            });
        }

        res.status(200).json({
            success: true,
            data: setting.value,
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/settings/:key
// @desc    Update or create setting
// @access  Private (Admin only)
router.put('/:key', protect, authorize('admin'), async (req, res, next) => {
    try {
        const setting = await Setting.findOneAndUpdate(
            { key: req.params.key },
            {
                value: req.body.value,
                description: req.body.description,
                updatedBy: req.user._id,
                updatedAt: Date.now(),
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: setting,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;