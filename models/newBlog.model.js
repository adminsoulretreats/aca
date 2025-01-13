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
