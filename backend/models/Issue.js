const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },
        accuracy: {
            type: String,
            enum: ['GPS', 'Browser GPS', 'Manual', 'Estimated'],
            default: 'Manual'
        }
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: [true, 'Urgency level is required'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-review', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true,
        default: 'General Services'
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Submitter is required']
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    photos: [{
        url: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        originalName: String,
        size: Number,
        mimeType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    escalationLevel: {
        type: String,
        enum: ['Block', 'District', 'State', 'Court'],
        default: 'Block'
    },
    priority: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    estimatedResolutionTime: {
        type: Date,
        default: null
    },
    actualResolutionTime: {
        type: Date,
        default: null
    },
    resolutionNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Resolution notes cannot exceed 1000 characters']
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    upvotes: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: [500, 'Comment cannot exceed 500 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            trim: true
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
issueSchema.index({ submittedBy: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ urgency: 1 });
issueSchema.index({ department: 1 });
issueSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ title: 'text', description: 'text', location: 'text' });

// Virtual for age of issue
issueSchema.virtual('ageInDays').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to add initial status to history
issueSchema.pre('save', function(next) {
    if (this.isNew) {
        this.statusHistory.push({
            status: this.status,
            changedBy: this.submittedBy,
            notes: 'Issue created'
        });
    }
    next();
});

// Method to update status with history
issueSchema.methods.updateStatus = function(newStatus, changedBy, notes = '') {
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        changedBy: changedBy,
        notes: notes
    });
    return this.save();
};

// Method to add comment
issueSchema.methods.addComment = function(userId, comment) {
    this.comments.push({
        user: userId,
        comment: comment
    });
    return this.save();
};

module.exports = mongoose.model('Issue', issueSchema);
