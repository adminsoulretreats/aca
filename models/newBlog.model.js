const { Schema, model } = require("mongoose");

const contentSchema = new Schema({
    type: {
        type: String,
        enum: ['heading', 'text', 'image', 'imgNote', 'heading2', 'heading3'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    color: {
        type: String,
    }
}, { _id: false });

const NewBlogSchema = new Schema({
    id: { type: Number, unique: true, required: true },
    imgBackground: { type: String, required: true },
    standOut: { type: Boolean, default: false, required: true },
    title: { type: String, required: true },
    tags: { type: [Number], enum: [0, 1, 2, 3], default: [], required: true },

    // Nội dung của bài viết sẽ được lưu dưới dạng HTML từ Quill.js
    content: { type: String, required: true },

    // Các trường không bắt buộc
    img: String,
    imgNote: String,
    description: String,
}, { timestamps: true });

const NewBlog = model('NewBlog', NewBlogSchema);

module.exports = {
    NewBlog,
    NewBlogSchema
};
