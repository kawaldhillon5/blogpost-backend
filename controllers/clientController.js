const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const RequestBlog = require("../models/blogRequest");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

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

exports.getIsVoted = asyncHandler(async (req,res, next) =>{
    try{
        const votedBlog = await User.findOne({_id: req.user._id, votedBlogs: {$in: [req.params.blogId]}}).exec();
        if(votedBlog){
            return res.status(200).end();
        } else {
            return res.status(404).end();
        }
    } catch(err){
        console.log(err);
        next(err);
    }
    return;
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
    try{
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
    }catch(error){
        console.log(error);
        next(error);
    }
    return;
});

exports.getComments = asyncHandler(async(req, res, next)=>{
    let comments = [];
    try{
        const blog = await Blog.findById(req.params.blogId,"comments").exec();
        if(!blog){
            return res.status(404).send("blog not found");
        }
        if(blog.comments.length){
            comments = (await blog.populate({path:'comments', populate:{path:"madeBy", select: "userName"}})).comments;
        }
        return res.status(200).send(comments);
    } catch(err){
        console.log(err);
        next(err)
    }
    return;
});

exports.postComment = asyncHandler(async(req, res, next)=>{
    try{
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
    }catch(err){
        console.log(err)
        next(err);
    }
    return;
});