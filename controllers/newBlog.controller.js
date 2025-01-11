const { NewBlog } = require("../models/newBlog.model");

// Create a new blog
const createNewBlog = async (req, res) => {
    try {
        const { id, img, title, description, tags, content } = req.body;

        // Check if all required fields are present
        if (!id || !img || !title || !description || !content) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const newBlog = new NewBlog({
            id,
            img,
            title,
            description,
            tags,
            content
        });

        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get All Blogs
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await NewBlog.find();
        res.status(200).json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Blog by Id
const getBlogById = async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await NewBlog.findOne({ id: blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.status(200).json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {
    createNewBlog,
    getAllBlogs,
    getBlogById,
};
