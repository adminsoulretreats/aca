const { Schema, model } = require("mongoose");

const contentSchema = new Schema({
    type: {
        type: String,
        enum: ['heading', 'text', 'image'],
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
        required: true,
        unique: true
    },
    img: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tags: [{
        type: String
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
