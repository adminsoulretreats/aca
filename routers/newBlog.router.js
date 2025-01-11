const express = require("express");
const newBlogRouter = express.Router();
const newBlogController = require('../controllers/newBlog.controller');

// Route to create a blog
router.post('/create', newBlogController.createNewBlog);

// Route to get all blogs
router.get('/', newBlogController.getAllBlogs);

// Route to get a specific blog by id
router.get('/:id', newBlogController.getBlogById);

module.exports = {
    newBlogRouter,
};
