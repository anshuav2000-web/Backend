const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, priority, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email')
            .populate('leadId', 'name')
            .populate('contactId', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ dueDate: 1, createdAt: -1 });

        const count = await Task.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: tasks,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('leadId', 'name')
            .populate('contactId', 'firstName lastName');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.status(200).json({
            success: true,
            data: task,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post(
    '/',
    protect,
    [
        body('title').notEmpty().withMessage('Title is required'),
    ],
    async (req, res, next) => {
        try {
            const task = await Task.create({
                ...req.body,
                assignedTo: req.body.assignedTo || req.user._id,
            });

            const populatedTask = await Task.findById(task._id)
                .populate('assignedTo', 'name email')
                .populate('leadId', 'name')
                .populate('contactId', 'firstName lastName');

            res.status(201).json({
                success: true,
                data: populatedTask,
            });
        } catch (error) {
            next(error);
        }
    }
);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('leadId', 'name')
            .populate('contactId', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: populatedTask,
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;