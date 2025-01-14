const { Schema, model } = require("mongoose");

const contentSchema = new Schema({
    type: {
        type: String,
        enum: ['heading', 'text', 'image', 'imgNote'],
        required: true
    },
    content: {
        type: String,
        required: true
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
    tags: [{
        type: String,
        enum: ['Chuỗi Khóa Học The Origins', 'Câu Chuyện Học Viên ', 'Bài Học Từ Mr Vas', 'Sự Kiện Nổi Bật'],
        required: true
    }],
    content: [contentSchema]
}, {
    timestamps: true
});

const NewBlog = model('NewBlog', NewBlogSchema);

module.exports = {
    NewBlog,
    NewBlogSchema,
};
