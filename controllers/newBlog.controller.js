const { NewBlog } = require("../models/newBlog.model");

// Create a new blog
const createNewBlog = async (req, res) => {
    try {
        const { id, img, imgBackground, title, description, tags, content, imgNote, standOut } = req.body;

        // Check if all required fields are present
        if (!title || !imgBackground || !id) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const newBlog = new NewBlog({
            id,
            img,
            imgBackground,
            title,
            description,
            imgNote,
            tags,
            content,
            standOut
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

// Get the first 4 recent blogs
const get4RecentBlogs = async (req, res) => {
    try {
        const recentBlogs = await NewBlog.find()
            .sort({ createdAt: -1 })
            .limit(4);

        res.status(200).json(recentBlogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get the blogs by tag
const getBlogsByTag = async (req, res) => {
    try {
        const { tag } = req.params; // Extract the tag from the route parameters

        if (!tag) {
            return res.status(400).json({ message: "Tag is required" });
        }

        // Fetch blogs that match the given tag, sort by createdAt
        const recentBlogsByTag = await NewBlog.find({ tags: { $in: [tag] } })
            .sort({ createdAt: -1 })

        res.status(200).json(recentBlogsByTag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.id;

        const blog = await NewBlog.findOneAndDelete({ id: blogId });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createNewBlog,
    getAllBlogs,
    getBlogById,
    get4RecentBlogs,
    getBlogsByTag,
    deleteBlog,
};
