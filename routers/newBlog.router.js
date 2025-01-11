const express = require("express");
const newBlogRouter = express.Router();
const newBlogController = require('../controllers/newBlog.controller');

// Route to create a blog
newBlogRouter.post('/create', newBlogController.createNewBlog);

// Route to get all blogs
newBlogRouter.get('/', newBlogController.getAllBlogs);

// Route to get a specific blog by id
newBlogRouter.get('/:id', newBlogController.getBlogById);

module.exports = {
    newBlogRouter,
};
