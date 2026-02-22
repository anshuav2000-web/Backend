const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth');

// @route   GET /api/contacts
// @desc    Get all contacts
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }

        const contacts = await Contact.find(query)
            .populate('leadId', 'name company')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Contact.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: contacts,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/contacts/:id
// @desc    Get single contact
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id)
            .populate('leadId', 'name company');

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found',
            });
        }

        res.status(200).json({
            success: true,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/contacts
// @desc    Create new contact
// @access  Private
router.post(
    '/',
    protect,
    [
        body('firstName').notEmpty().withMessage('First name is required'),
    ],
    async (req, res, next) => {
        try {
            const contact = await Contact.create(req.body);

            res.status(201).json({
                success: true,
                data: contact,
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/contacts/:id
// @desc    Update contact
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found',
            });
        }

        res.status(200).json({
            success: true,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;