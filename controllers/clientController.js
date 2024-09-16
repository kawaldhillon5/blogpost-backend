const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");

exports.getAllBlogPosts = asyncHandler(async (req, res, next) => {
    const posts = await Blog.find().populate("author").exec();
    res.send({posts: posts});
});

exports.getBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findOne({_id:req.params.blogId}).populate("author").exec();
    res.send({post: blog});
})
