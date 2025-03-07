const { Comment } = require('../models/comment.model');
const { NewBlog } = require('../models/newBlog.model');
/**
 * Comment Controller
 * Handles all comment-related operations for blog posts
 * @module controllers/comment
 */

/**
 * @typedef {import('../models/comment.model').Comment} Comment
 * @typedef {import('../models/newBlog.model').NewBlog} NewBlog
 */

/**
 * Controller functions for managing blog comments:
 * - Getting comments for a specific blog
 * - Adding new comments
 * - Deleting comments
 * 
 * Uses Comment and NewBlog models to interact with MongoDB
 * Provides error handling and appropriate HTTP responses
 */

// Get all comments for a specific blog
const getCommentsByBlogId = async (req, res) => {
    try {
        const { blogId } = req.params;
        const comments = await Comment.find({ blogId })
            .sort({ createdAt: -1 })
            .populate('account', 'name email'); // Populate account information
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new comment
const addComment = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { userName, content, accountId } = req.body;

        // Check if blog exists
        const blog = await NewBlog.findOne({ id: blogId });
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Create new comment
        const newComment = new Comment({
            blogId,
            userName,
            content,
            account: accountId // Add account reference
        });

        const savedComment = await newComment.save();
        // Populate account information before sending response
        const populatedComment = await Comment.findById(savedComment._id)
            .populate('account', 'name email');

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const deletedComment = await Comment.findByIdAndDelete(commentId);

        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a comment
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true }
        ).populate('account', 'name email');

        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCommentsByBlogId,
    addComment,
    deleteComment,
    updateComment
}; 