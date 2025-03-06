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
    id: {
        type: Number,
        unique: true
    },
    imgBackground: {
        type: String,
        require: true
    },
    standOut: {
        type: Boolean,
        default: false,
        require: true
    },
    img: {
        type: String,
    },
    imgNote: {
        type: String,
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    //'Chuỗi Khóa Học The Origins', 'Câu Chuyện Học Viên ', 'Bài Học Từ Mr Vas', 'Sự Kiện Nổi Bật'
    tags: [{
        type: Number,
        enum: [0, 1, 2, 3],
        required: true
    }],
    content: String,
}, {
    timestamps: true
});

const NewBlog = model('NewBlog', NewBlogSchema);

module.exports = {
    NewBlog,
    NewBlogSchema,
};
