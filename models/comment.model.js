const { Schema, model } = require("mongoose");

/**
 * Schema for Comments on Blog Posts
 * @typedef {Object} CommentSchema
 * @property {number} blogId - ID of the blog post this comment belongs to (references NewBlog model)
 * @property {string} userName - Name of the user who wrote the comment
 * @property {string} content - The actual comment text content
 * @property {Schema.Types.ObjectId} account - Reference to the user account
 * @property {Date} createdAt - Timestamp when comment was created (added by timestamps option)
 * @property {Date} updatedAt - Timestamp when comment was last updated (added by timestamps option)
 */
const CommentSchema = new Schema({
    blogId: {
        type: String,
        required: true,
        ref: 'NewBlog' // References the NewBlog model
    },
    userName: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

/**
 * Mongoose model for Comments
 * @type {import('mongoose').Model}
 */
const Comment = model('Comment', CommentSchema);

module.exports = {
    Comment,
    CommentSchema
}; 