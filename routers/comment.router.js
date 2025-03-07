const express = require("express");
const commentRouter = express.Router();

const {
    getCommentsByBlogId,
    addComment,
    deleteComment,
    updateComment,
} = require("../controllers/comment.controller");

commentRouter.get("/blog/:blogId", getCommentsByBlogId);
commentRouter.post("/blog/:blogId", addComment);
commentRouter.delete("/:commentId", deleteComment);
commentRouter.put("/:commentId", updateComment);

module.exports = {
    commentRouter,
};