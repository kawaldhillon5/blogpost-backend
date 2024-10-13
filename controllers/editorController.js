const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const RequestBlog = require("../models/blogRequest");
const { body, validationResult, buildCheckFunction } = require("express-validator");
const Author = require("../models/author");
const User = require('../models/user');
const blog = require("../models/blog");
const { model } = require("mongoose");
const EditorRequest = require("../models/editorRequest");
const Log = require("../models/log");
const PublishBlogRequest = require("../models/publishBlogRequest");
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
    const updates = {...req.body, isPublished: false}
    const updatedBlog = await updateBlog(req.params.blogId, updates);
    const request = await PublishBlogRequest.findOne({blog: req.params.blogId}).exec();
    if(!request){
        const publishReq = new PublishBlogRequest({
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
       return  res.status(404).end("User is not an Editor");
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
    return res.send({id: newBlog._id});
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
        entry: `${req.user._id.toString()} ${req.body.data.choice ? "accepted": "rejected"} ${request.user._id.toString()}'s request`,
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
    const reqs = await PublishBlogRequest.find().populate("user").exec();
    res.send({data: reqs });
});

exports.postPublishBlogReq = asyncHandler(async (req, res, next)=>{
    const request = await PublishBlogRequest.findById(req.params.reqId).populate("user").exec();
    const log = new Log({
        category:  "publish_req",
        entry: `${req.user._id.toString()} ${req.body.data.choice ? "accepted": "rejected"} ${request.user._id.toString()}'s request for publishing blog:${request.title}`,
        dateCreated: new Date()
    });
    if(req.body.data.choice) {
        await Blog.updateOne({_id: request.blog.toString()},{isPublished: true});
    }
    await log.save();
    console.log(await PublishBlogRequest.deleteOne({_id: req.params.reqId}));
    res.status(200).send("ok");
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
        tags: blog.tags,
        isPublished: body.isPublished,
    });
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, newBlog, {});
    return updatedBlog;
}

