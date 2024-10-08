const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const RequestBlog = require("../models/requestBlog");
const { body, validationResult } = require("express-validator");
const Author = require("../models/author");
const User = require('../models/user');
const blog = require("../models/blog");
const { model } = require("mongoose");

exports.getMyBlogPosts = asyncHandler(async (req, res, next)=>{
    const user = await User.findById(req.params.userId).populate({path: 'authorDetails',populate:{path:'blogs',model:'Blog'}}).exec();
    const blogs = user.authorDetails.blogs;
    if(!blogs){
        res.send({blogs: []})
    } else {
        res.send({blogs: blogs});
    }

});

exports.getBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findOne({_id:req.params.blogId}).populate("author").exec();
    res.send({post: blog});
});

exports.getAllRequests = asyncHandler(async (req, res, next)=>{
    const requests = await RequestBlog.find().exec();
    res.send({requests: requests});
});

exports.getRequest = asyncHandler(async (req, res, next) => {
    const request = await RequestBlog.findById(req.params.reqId).exec();
    res.send({request: request});
});

exports.updateBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findOne({_id:req.params.blogId}).exec();

    if (blog === null) {
        // No results.
        const err = new Error("Blog not found");
        err.status = 404;
        return next(err);
    }

    const newBlog = new Blog({
        _id: req.params.blogId,
        title: req.body.title,
        body: req.body.body,
        date_created: blog.date_created,
        author: blog.author,
        tags: blog.tags
    });
    
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.blogId, newBlog, {});
    res.send({id: updatedBlog._id});
});

exports.createNewEmptyBlog = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId).populate({path:'authorDetails'}).exec();
    let author = {};
    if(user.isEditor){
       author = await Author.findById(user.authorDetails._id.toString()).exec();
    } else {
        res.status(400).send({message: "User is not an Author"});
    }
    const blog = new Blog({
        date_created: new Date(),
        title: "",
        body: "",
        tags: ["#science"],
        author: author
    });
    await author.blogs.push(blog);
    await author.save(); 
    const newBlog = await blog.save();
    res.send({id: newBlog._id});
})