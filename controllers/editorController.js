const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const RequestBlog = require("../models/requestBlog");
const { body, validationResult } = require("express-validator");
const Author = require("../models/author");

exports.getMyBlogPosts = asyncHandler(async (req, res, next)=>{
    const blogs = await Author.findById("66eb9eb9d449d580d5cd0e74").populate("blogs").exec();
    if(!blogs){
        res.send({blogs: []})
    } else {
        res.send({blogs: blogs.blogs});
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
     const author = new Author({
        last_name: "D",
        first_name: "K",
        blogs: []
    });

    const blog = new Blog({
        date_created: new Date(),
        title: "",
        body: "",
        tags: ["#science"],
        author: author
    });
    author.blogs.push(blog);
    await author.save(); 
    const newBlog = await blog.save();
    res.send({id: newBlog._id});
})