/**
 * User Model (Mongoose)
 * ----------------------
 * Defines the User schema for MongoDB. Handles password hashing
 * automatically via pre-save middleware. Supports role-based access
 * with "user" and "admin" roles.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
    {
        /** User's display name */
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        /** User's email (unique identifier for login) */
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        /** Hashed password (never stored in plain text) */
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false, // Exclude password from queries by default
        },
        /** User role for access control */
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt
    }
);

/**
 * Pre-save hook: hash the password before storing it.
 * Only runs when the password field has been modified.
 */
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(12); // 12 rounds for strong hashing
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance method: compare a candidate password with the stored hash.
 * @param {string} candidatePassword - The plaintext password to check
 * @returns {Promise<boolean>} True if passwords match
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Prevent model recompilation in development (Next.js hot-reload)
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
