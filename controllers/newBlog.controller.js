const { NewBlog } = require("../models/newBlog.model");

const convertHtmlToText = (html) => {
    if (typeof html !== "string") return ""; // Đảm bảo html luôn là string
    return html.replace(/<[^>]+>/g, '').trim();
};

const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
};

// Create a new blog
const createNewBlog = async (req, res) => {
    try {
        const { id, img, imgBackground, title, description, tags, content, imgNote, standOut, heading2, heading3, color } = req.body;

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
            heading2,
            heading3,
            color,
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

        // Đảm bảo content là một string
        const formattedBlog = {
            ...blog.toObject(),
            content: Array.isArray(blog.content) ? blog.content.join("") : String(blog.content),
        };

        res.status(200).json(formattedBlog);
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


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
const updateBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const updatedData = req.body; // This will contain the updated fields

        // Find the blog by ID and update it with the new data
        const blog = await NewBlog.findOneAndUpdate(
            { id: blogId },
            updatedData,
            { new: true } // Option to return the updated document
        );

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.status(200).json({ message: 'Blog updated successfully', blog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const searchBlogsByTitle = async (req, res) => {
    try {
        const { title } = req.query;

        if (!title) {
            return res.status(400).json({ message: 'Title query parameter is required.' });
        }

        const blogs = await NewBlog.find(
            { title: { $regex: title, $options: 'i' } },
            { title: 1, tags: 1, imgBackground: 1, updatedAt: 1, content: 1, id: 1 }
        );

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ message: 'No blogs found with the given title.' });
        }

        const processedBlogs = blogs.map((blog) => {
            // console.log(blog.content);
            const plainTextContent = convertHtmlToText(blog.content ?? ""); // Đảm bảo không lỗi
            const truncatedContent = truncateText(plainTextContent, 300);

            return {
                id: blog.id,
                title: blog.title,
                tags: blog.tags,
                imgBackground: blog.imgBackground,
                updatedAt: blog.updatedAt,
                content: truncatedContent,
            };
        });

        res.status(200).json(processedBlogs);
    } catch (error) {
        console.error("Error searching blogs:", error);
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
    updateBlog,
    searchBlogsByTitle
};

// Ideas create apis for newBlog

/**
 * 1. Search blog by title (done)
 * 2. Search blog by tags
 * 3. Search blog by pagination
 * 4. Search blog by time
 * 5. Search blog by standout
 * 6. Get count blogs
 * 7. Get blog by many tags
 * 
 */