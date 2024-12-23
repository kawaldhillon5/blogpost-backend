const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const RequestBlog = require("../models/blogRequest");
const { body, validationResult } = require("express-validator");

exports.getAllBlogPosts = [
    asyncHandler(async (req, res, next) => {
        const posts = await Blog.find({isPublished: true}).populate("author").exec();
        res.send({posts: posts});
    }),
]

exports.getBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findOne({_id:req.params.blogId}).populate("author").exec();
    res.send({post: blog});
});

exports.getAllRequests = asyncHandler(async (req, res, next)=>{
    const requests = await RequestBlog.find().populate("user").exec();
    res.send({requests: requests});
});

exports.getRequest = asyncHandler(async (req, res, next) => {
    const request = await RequestBlog.findById(req.params.reqId).exec();
    res.send({request: request});
});

exports.postRequest = asyncHandler(async (req, res, next) => {
    const request = new RequestBlog({
        date_created: new Date(),
        title: req.body.title,
        desc: req.body.desc,
        votes: 1,
        user: req.user._id
    });
    await request.save();
    res.send(request);
});
