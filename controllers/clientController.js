const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const RequestBlog = require("../models/blogRequest");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const Author = require("../models/author");

exports.getAllBlogPosts = [
    asyncHandler(async (req, res, next) => {
        const posts = await Blog.find({isPublished: true}).populate("author", "first_name last_name").limit(5).exec();
        res.send({posts: posts});
    }),
]
exports.getAuthors = asyncHandler(async(req, res, next)=>{
    
    const authors = await Author.find({},"first_name last_name").limit(5).exec();
    if(authors.length){
        res.json(authors);
    } else {
        res.status(404).send("Could not load Authors");
    }

});

exports.getNewBlogs = asyncHandler(async(req,res,next)=>{
    
    const newBlogs = await Blog.find({isPublished:true},"title author").populate("author", "first_name last_name").sort({"_id": -1}).limit(5).exec();
    if(newBlogs.length){
        res.json(newBlogs);
    } else {
        res.status(404).send("Could not load Blogs");
    }

});

exports.getPopularBlogs = asyncHandler(async(req,res,next)=>{
    
    const popularBlogs = await Blog.find({isPublished:true},"title author").populate("author", "first_name last_name").sort({"votes": -1}).limit(5).exec();
    if(popularBlogs.length){
        res.json(popularBlogs);
    } else {
        res.status(404).send("Could not load Blogs");
    }

});

exports.getBlog = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findOne({_id:req.params.blogId}).populate("author","first_name last_name").exec();
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

exports.getIsVoted = asyncHandler(async (req,res, next) =>{
    
    if(req.user){
        const votedBlog = await User.findOne({_id: req.user._id, votedBlogs: {$in: [req.params.blogId]}}).exec();
        if(votedBlog){
            return res.status(200).end();
        } else {
            return res.status(404).end();
        }
    } else {
        return res.status(404).end();
    }

});

exports.postVote = asyncHandler(async (req, res, next)=>{
    let didUserAlreadyVoted = false;
    if(req.user.votedBlogs.length){
        req.user.votedBlogs.forEach(blog => {
            if(blog._id.toString() === req.params.blogId){
                didUserAlreadyVoted = true;
            }
        });
    }
    
    if(!didUserAlreadyVoted){
        await User.updateOne({_id: req.user._id},{$push :{votedBlogs: req.params.blogId}}).exec();
        const updatedBlog = await Blog.updateOne({_id: req.params.blogId},{$inc: {votes: 1}});
        if(updatedBlog){
            return res.status(200).end();
        } return res.status(404).end(); 
    } else{
        await User.updateOne({_id: req.user._id},{$pull :{votedBlogs: req.params.blogId}}).exec();
        const updatedBlog = await Blog.updateOne({_id: req.params.blogId},{$inc: {votes: -1}});
        if(updatedBlog){
            return res.status(200).end();
        } return res.status(404).end(); 
    } 
   
});

exports.getComments = asyncHandler(async(req, res, next)=>{
    let comments = [];
    const blog = await Blog.findById(req.params.blogId,"comments").exec();
    if(!blog){
        return res.status(404).send("blog not found");
    }
    if(blog.comments.length){
        comments = (await blog.populate({path:'comments', populate:{path:"madeBy", select: "userName"}})).comments;
    }
    return res.status(200).send(comments);

});

exports.postComment = asyncHandler(async(req, res, next)=>{
  
    const newComment = new Comment({
        text: req.body.data,
        date_created: new Date(),
        madeBy: req.user._id,
        madeFor:req.params.blogId,
    });
    const savedComment = await newComment.save();
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.blogId,{$push:{comments: savedComment}}).exec();
    const updatedUser = await User.findByIdAndUpdate(req.user._id,{$push:{allComments: savedComment}}).exec();
    if(updatedBlog && updatedUser){
        res.status(200).end();
    } else {
        res.status(404).send("Could not Post Comment");
    }

});

exports.blogsSerach = asyncHandler(async (req, res, next)=>{
    
    const searchQuery = req.query.search || ""; // Get search query from request
    let query = {};

    if (searchQuery) {
        query = {isPublished: true};
        query.$text = { $search: searchQuery };
    }
    const blogs = await Blog.find(query, ["author","title","votes"]).populate('author',"first_name last_name").limit(10).exec();
    res.json(blogs);

});