const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const RequestBlog = require("../models/blogRequest");
const { body, validationResult, buildCheckFunction } = require("express-validator");
const Author = require("../models/author");
const User = require('../models/user');
const { model } = require("mongoose");
const EditorRequest = require("../models/editorRequest");
const Log = require("../models/log");
const PublishBlogRequest = require("../models/publishBlogRequest");
const notification = require("../models/notification");

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
    if(req.params.blogId === '0'){
        if(req.params.mode === 'finish'){
            const updates = {...req.body,isPublished: false, publishReqStatus:1}
            const newBlog = await createNewBlog(req, updates);
            const publishReq = new PublishBlogRequest({
                blog: newBlog._id,
                user: req.user._id,
                title: newBlog.title
            });
            const noti = new notification({
                text: `Your Request to Publish blog '${newBlog.title}' has been submitied`,
                dateCreated: new Date(),  
            });
            await noti.save();
            await User.findByIdAndUpdate(req.user._id,{$push:{"notifications": noti}});
            await publishReq.save();
            if(newBlog){
                res.status(200).send({id: newBlog._id});
            } else {
                res.status(200).send("Could Not Create Blog");
            }
        } else {
            const updates = {...req.body,isPublished: false, publishReqStatus:0}
            const newBlog = await createNewBlog(req, updates);
            if(newBlog){
                res.status(200).send({id: newBlog._id});
            } else {
                res.status(200).send("Could Not Create Blog");
            }
        }
    } else {
        await PublishBlogRequest.findOneAndDelete({blog: req.params.blogId}).exec();
        if(req.params.mode === 'finish'){
            const updates = {...req.body,isPublished: false, publishReqStatus:1}
            const updatedBlog = await updateBlog(req.params.blogId, updates, req);
            const publishReq = new PublishBlogRequest({
                blog: updatedBlog._id,
                user: req.user._id,
                title: updatedBlog.title
            });
            const noti = new notification({
                text: `Your Request to Publish blog '${updatedBlog.title}' has been submitied`,
                dateCreated: new Date(),  
            });
            await noti.save();
            await User.findByIdAndUpdate(req.user._id,{$push:{"notifications": noti}});
            await publishReq.save();
            if(updatedBlog){
                res.status(200).send({id: updatedBlog._id});
            } else {
                res.status(200).send("Could Not Update Blog");
            }
        } else {
            const updates = {...req.body,isPublished: false, publishReqStatus:0}
            const updatedBlog = await updateBlog(req.params.blogId, updates, req);
            if(updatedBlog){
                res.status(200).send({id: updatedBlog._id});
            } else {
                res.status(200).send("Could Not Update Blog");
            }
        }    
    }
});

async function updateBlog(blogId, body, req) {
    const user = req.user;
    if(!user.isEditor){
        const err = new Error("User is Not an Editor");
        err.status = 404;
        return next(err);
    }

    const blog = await Blog.findOne({_id:blogId}).exec();

    if (blog === null) {
        const err = new Error("Blog not found");
        err.status = 401;
        return next(err);
    }

    const newBlog = new Blog({
        _id: blogId,
        title: body.title,
        body: body.body,
        date_created: blog.date_created,
        author: blog.author,
        tags: body.tags,
        isPublished: body.isPublished,
        publishReqStatus: body.publishReqStatus,
    });
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, newBlog);
    return updatedBlog ? updatedBlog : false;
}

async function createNewBlog (req, body) {
    const user = req.user;
    
    if(!user.isEditor){
        const err = new Error("User is Not an Editor");
        err.status = 401;
        return next(err);
    }
    const author = await Author.findById(user.authorDetails._id.toString()).exec();
    const blog = new Blog({
        date_created: new Date(),
        title: body.title,
        body: body.body,
        tags: body.tags,
        author: author,
        isPublished: false,
        publishReqStatus: body.publishReqStatus,
        votes: 0,
        comments: [],
    });
    author.blogs.push(blog);
    await author.save(); 
    const newBlog = await blog.save();
    return newBlog ? newBlog : false;
};

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
        await postNewNoti(request.user._id, "Your Request to become an blogger has been accepted");
        await User.updateOne({_id: request.user.toString()}, {isEditor: true});
    }
    await log.save();
    await postNewNoti(request.user, `Your Request to become an blogger has been ${req.body.data.choice ? "accepted": "rejected"}`);
    await EditorRequest.deleteOne({_id: req.params.id});
    res.status(200).send("ok");
});

async function postNewNoti(userId, text){
    const newNoti = new notification({
        text: text,
        dateCreated: new Date(),
    });
    await newNoti.save();
    await User.findByIdAndUpdate(userId,{$push:{"notifications": newNoti}});
}

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
        await Blog.updateOne({_id: request.blog.toString()},{isPublished: true, publishReqStatus:2});
    }else {
        await Blog.updateOne({_id: request.blog.toString()},{publishReqStatus:3});
    }
    await log.save();
    await postNewNoti(request.user._id.toString(), `Your Request to Publish blog '${request.title}' has been ${req.body.data.choice ? "accepted": "rejected"}`);
    await PublishBlogRequest.deleteOne({_id: req.params.reqId});
    res.status(200).send("ok");
});



exports.postDeleteBlogReq = asyncHandler(async (req, res, next)=>{
    try {
        await PublishBlogRequest.deleteOne({blog: req.params.blogId}).exec();
        await Author.findByIdAndUpdate({_id: req.user.authorDetails.toString()},{$pull:{"blogs": req.params.blogId}});
        const resp = await Blog.deleteOne({_id: req.params.blogId}).exec();
        if (resp.deletedCount == 1){
            return res.status(200).end("Blog Deleted");
        } else {
            return res.status(404).end("Could Not Delete Blog");
        }
    } catch(err){
        console.log(err);
        return res.status(500).end("Internal Server Error");
    }
});
