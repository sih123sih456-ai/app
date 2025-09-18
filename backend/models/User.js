const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'officer'],
        default: 'user'
    },
    department: {
        type: String,
        trim: true,
        default: 'General Services'
    },
    location: {
        type: String,
        trim: true
    },
    experience: {
        type: String,
        trim: true
    },
    profileImage: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    lastLogin: {
        type: Date,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.emailVerificationToken;
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    return user;
};

module.exports = mongoose.model('User', userSchema);
