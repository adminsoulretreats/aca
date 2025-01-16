const express = require("express");
const newBlogRouter = express.Router();
const newBlogController = require('../controllers/newBlog.controller');

// Route to create a blog
newBlogRouter.post('/create', newBlogController.createNewBlog);

// Route to get all blogs
newBlogRouter.get('/', newBlogController.getAllBlogs);

// Route to get 4 recent blogs
newBlogRouter.get('/get-recent-4-blogs', newBlogController.get4RecentBlogs);

// Route to get a specific blog by id
newBlogRouter.get('/get-blog/:id', newBlogController.getBlogById);

// Route to get blogs by tag
newBlogRouter.get('/get-blog/tags/:tag', newBlogController.getBlogsByTag);

// Route to delete a blog
newBlogRouter.delete('/delete/:id', newBlogController.deleteBlog);

module.exports = {
    newBlogRouter,
};
