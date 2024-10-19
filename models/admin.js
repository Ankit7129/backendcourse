const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false }, // To verify admin account
    role: { type: String, default: 'admin' }, // Could be extended for different roles
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
