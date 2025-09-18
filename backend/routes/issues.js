const express = require('express');
const { body, validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all issues with filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            urgency,
            department,
            assignedTo,
            submittedBy,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (urgency) filter.urgency = urgency;
        if (department) filter.department = department;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (submittedBy) filter.submittedBy = submittedBy;

        // Text search
        if (search) {
            filter.$text = { $search: search };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const issues = await Issue.find(filter)
            .populate('submittedBy', 'name email')
            .populate('assignedTo', 'name email department')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Issue.countDocuments(filter);

        res.json({
            success: true,
            data: {
                issues,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching issues'
        });
    }
});

// Get issue by ID
router.get('/:id', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('submittedBy', 'name email phone')
            .populate('assignedTo', 'name email department phone')
            .populate('comments.user', 'name email')
            .populate('statusHistory.changedBy', 'name email');

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        // Increment view count
        issue.views += 1;
        await issue.save();

        res.json({
            success: true,
            data: issue
        });
    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching issue'
        });
    }
});

// Create new issue
router.post('/', [
    auth,
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('urgency').isIn(['low', 'medium', 'high']).withMessage('Invalid urgency level'),
    body('coordinates.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('coordinates.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            title,
            description,
            location,
            coordinates,
            urgency,
            department,
            tags
        } = req.body;

        const issue = new Issue({
            title,
            description,
            location,
            coordinates,
            urgency,
            department: department || 'General Services',
            submittedBy: req.user.id,
            tags: tags || []
        });

        await issue.save();

        // Populate the created issue
        await issue.populate('submittedBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Issue created successfully',
            data: issue
        });
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating issue'
        });
    }
});

// Update issue status
router.patch('/:id/status', [
    auth,
    body('status').isIn(['pending', 'in-review', 'in-progress', 'resolved', 'rejected']).withMessage('Invalid status'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { status, notes } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        // Check permissions
        if (req.user.role === 'user' && issue.submittedBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this issue'
            });
        }

        await issue.updateStatus(status, req.user.id, notes);

        res.json({
            success: true,
            message: 'Issue status updated successfully',
            data: issue
        });
    } catch (error) {
        console.error('Error updating issue status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating issue status'
        });
    }
});

// Assign issue to officer
router.patch('/:id/assign', [
    auth,
    body('assignedTo').isMongoId().withMessage('Invalid officer ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can assign issues'
            });
        }

        const { assignedTo } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        // Verify officer exists
        const officer = await User.findById(assignedTo);
        if (!officer || officer.role !== 'officer') {
            return res.status(400).json({
                success: false,
                message: 'Invalid officer'
            });
        }

        issue.assignedTo = assignedTo;
        await issue.updateStatus('in-review', req.user.id, `Assigned to ${officer.name}`);

        res.json({
            success: true,
            message: 'Issue assigned successfully',
            data: issue
        });
    } catch (error) {
        console.error('Error assigning issue:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning issue'
        });
    }
});

// Add comment to issue
router.post('/:id/comments', [
    auth,
    body('comment').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { comment } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        await issue.addComment(req.user.id, comment);

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: issue
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment'
        });
    }
});

// Get issue statistics
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const stats = await Issue.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                    inReview: { $sum: { $cond: [{ $eq: ['$status', 'in-review'] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
                    high: { $sum: { $cond: [{ $eq: ['$urgency', 'high'] }, 1, 0] } },
                    medium: { $sum: { $cond: [{ $eq: ['$urgency', 'medium'] }, 1, 0] } },
                    low: { $sum: { $cond: [{ $eq: ['$urgency', 'low'] }, 1, 0] } }
                }
            }
        ]);

        res.json({
            success: true,
            data: stats[0] || {
                total: 0,
                pending: 0,
                inReview: 0,
                inProgress: 0,
                resolved: 0,
                high: 0,
                medium: 0,
                low: 0
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

module.exports = router;
