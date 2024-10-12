const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const RequestBlog = require("../models/blogRequest");
const { body, validationResult } = require("express-validator");
const Author = require("../models/author");
const User = require('../models/user');
const blog = require("../models/blog");
const { model } = require("mongoose");
const EditorRequest = require("../models/editorRequest");
const Log = require("../models/log");
const cookieSession = require("cookie-session");
const publishBlogRequest = require("../models/publishBlogRequest");

exports.getMyBlogPosts = asyncHandler(async (req, res, next)=>{
    if(req.user) {
        const authorDetails = await Author.findById({_id: req.user.authorDetails.toString()},"blogs").populate("blogs").exec();
        
        if(!authorDetails.blogs){
         res.send({blogs: []})
        } else {
            res.send({blogs: authorDetails.blogs});
        }
    } else {
        res.send({blogs: []});
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

exports.saveBlog = asyncHandler(async (req, res, next) => {
    const updatedBlog = await updateBlog(req.params.blogId, req.body);
    res.send({id: updatedBlog._id});
});

exports.finishEditingBlog = asyncHandler(async (req, res, next) => {
    const updatedBlog = await updateBlog(req.params.blogId, req.body);
    const request = await publishBlogRequest.find({user: req.user._id.toString()}).exec();
    if(!request.length){
        const publishReq = new publishBlogRequest({
            blog: updatedBlog._id,
            user: req.user._id,
            title: updatedBlog.title
        });
        await publishReq.save();
    }
    res.send({id: updatedBlog._id});
});


exports.createNewEmptyBlog = asyncHandler(async (req, res, next) => {
    const user = req.user;
    
    if(!user.isEditor){
        res.status(400).send({message: "User is not an Author"});
    }
    const author = await Author.findById(user.authorDetails._id.toString()).exec();
    const blog = new Blog({
        date_created: new Date(),
        title: "",
        body: "",
        tags: ["#science"],
        author: author,
        isPublished: false,
    });
    author.blogs.push(blog);
    await author.save(); 
    const newBlog = await blog.save();
    res.send({id: newBlog._id});
});

exports.getEditorReqs = asyncHandler(async (req, res, next) => {
    const reqs = await EditorRequest.find().exec();
    if(reqs.length === 0 || reqs === undefined) {
        res.status(200).send({reqs: []});
    } else {
        res.status(200).send({reqs: reqs});
    }
});

exports.postEditorReqChoice = asyncHandler(async (req, res, next) => {
    const request = await EditorRequest.findById(req.params.id).exec();

    const log = new Log({
        category: "editor-Req",
        entry: `${req.user._id.toString()} ${req.body.data.choice ? "accepted": "rejected"} ${req.params.id}'s request to become editor`,
        dateCreated: new Date(),
    });
    if(req.body.data.choice){
        await User.updateOne({_id: request.user.toString()}, {isEditor: true});
    }
    await log.save();
    await EditorRequest.deleteOne({_id: req.params.id});
    res.status(200).send("ok");
});

exports.getPublishBlogRequests = asyncHandler(async (req, res, next)=>{
    const reqs = await publishBlogRequest.find().exec();
    res.send({data: reqs });
});

async function updateBlog(blogId, body) {

    const blog = await Blog.findOne({_id:blogId}).exec();
    if (blog === null) {
        // No results.
        const err = new Error("Blog not found");
        err.status = 404;
        return next(err);
    }

    const newBlog = new Blog({
        _id: blogId,
        title: body.title,
        body: body.body,
        date_created: blog.date_created,
        author: blog.author,
        tags: blog.tags
    });
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, newBlog, {});
    return updatedBlog;
}