const asyncHandler = require("express-async-handler");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const RequestBlog = require("../models/blogRequest");
const User = require("../models/user");
const Author = require("../models/author");
const BlogRequest = require("../models/blogRequest");
const News = require("../models/news");
const EditorRequest = require("../models/editorRequest");
const notification = require("../models/notification");
const author = require("../models/author");

exports.getAllBlogPosts = [
    asyncHandler(async (req, res, next) => {
        const posts = await Blog.find({isPublished: true}).populate("author", "first_name last_name").limit(5).exec();
        res.send({posts: posts});
    }),
]

exports.getAuthorDetails = asyncHandler(async(req, res, next)=>{
    const authorDetails = await Author.findById(req.params.authorId).exec();
    if(authorDetails){
        res.status(200).send(authorDetails);
    } else {
        res.status(404).send("Author Not Found");
    }
});

exports.getBlogsByAuthor = asyncHandler(async(req, res, next)=>{
    const resp = await Author.findOne({_id:req.params.authorId}, {blogs:{$slice:[Number(req.query.skip),Number(req.query.limit)]}}).populate({path:'blogs',select:'title votes date_created'}).exec();
    if(resp){
        res.status(200).send(resp);
    } else {
        res.status(404).send("No Blogs Found");
    }
});

exports.getAuthors = asyncHandler(async(req, res, next)=>{
    
    
    try {
        const topAuthors = await Blog.aggregate([
        {
        $match:
            {
            isPublished: true,
            },
        },
        {
        $group:
            {
            _id: "$author",
            totalVotes: {
                $sum: "$votes",
            },
            },
        },
        {
        $sort:
            
            {
            totalVotes: -1,
            },
        },
        {
            $skip: Number(req.query.skip),
        },
        {
        $limit:
            5,
        },
        {
        $lookup:
            {
            from: "authors",
            localField: "_id",
            foreignField: "_id",
            as: "author_details",
            },
          },
        ]).exec();
        if(topAuthors){
            res.json(topAuthors);
        } else {
            res.status(404).send("Could not load Bloggers");
        }
      } catch (error) {
        console.error('Error fetching Bloggers:', error);
        throw error;
      }
});

exports.getNewBlogs = asyncHandler(async(req,res,next)=>{
    
    const newBlogs = await Blog.find({isPublished:true},"title author votes").populate("author", "first_name last_name").sort({"_id": -1}).skip(Number(req.query.skip)).limit(5).exec();
    if(newBlogs){
        res.json(newBlogs);
    } else {
        res.status(404).send("Could not load Blogs");
    }

});

exports.getPopularBlogs = asyncHandler(async(req,res,next)=>{
    
    const popularBlogs = await Blog.find({isPublished:true},"title author votes").populate("author", "first_name last_name").sort({"votes": -1}).skip(Number(req.query.skip)).limit(5).exec();
    if(popularBlogs){
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
        votes: 0,
        user: req.user._id
    });
    await request.save();
    res.send(request);
});

exports.getIsVoted = asyncHandler(async (req,res, next) =>{
    
    if(req.user){
        let resp = {}
        if(req.params.type == 'blog') {
            resp = await User.findOne({_id: req.user._id, votedBlogs: {$in: [req.params.Id]}}).exec();
        } else {
            resp = await User.findOne({_id: req.user._id, votedReqs: {$in: [req.params.Id]}}).exec();
        }
        if(resp){
            return res.status(200).send(true);
        } else {
            return res.status(200).send(false);
        }
    } else {
        return res.status(404).end();
    }

});

exports.getVotes = asyncHandler(async(req, res, next)=>{
    let votes = 0;
    if(req.params.type === 'blog'){
        votes = await Blog.findById(req.params.Id,'votes').exec();
    } else {
        votes = await RequestBlog.findById(req.params.Id,'votes').exec();
    }
    if(votes){
        res.status(200).send(votes);
    } else {
    res.status(404);
    }
});

exports.postVote = asyncHandler(async (req, res, next)=>{
    try {
        let didUserAlreadyVoted = false;
        if(req.params.type == 'blog'){    
            if(req.user.votedBlogs.length){
                req.user.votedBlogs.forEach(blog => {
                    if(blog._id.toString() === req.params.Id){
                        didUserAlreadyVoted = true;
                    }
                });
            }
        } else {
            if(req.user.votedReqs.length){
                req.user.votedReqs.forEach(request => {
                    if(request._id.toString() === req.params.Id){
                        didUserAlreadyVoted = true;
                    }
                });
            }
        }
        if(req.params.type == 'blog'){
            if(!didUserAlreadyVoted){
                await User.updateOne({_id: req.user._id},{$push :{votedBlogs: req.params.Id}}).exec();
                const updatedBlog = await Blog.updateOne({_id: req.params.Id},{$inc: {votes: 1}});
                if(updatedBlog){
                    return res.status(200).end();
                } return res.status(404).end(); 
            } else{
                await User.updateOne({_id: req.user._id},{$pull :{votedBlogs: req.params.Id}}).exec();
                const updatedBlog = await Blog.updateOne({_id: req.params.Id},{$inc: {votes: -1}});
                if(updatedBlog){
                    return res.status(200).end();
                } return res.status(404).end(); 
            } 
        } else {
            if(!didUserAlreadyVoted){
                await User.updateOne({_id: req.user._id},{$push :{votedReqs: req.params.Id}}).exec();
                const updatedReq = await BlogRequest.updateOne({_id: req.params.Id},{$inc: {votes: 1}});
                if(updatedReq){
                    return res.status(200).end();
                } return res.status(404).end(); 
            } else{
                await User.updateOne({_id: req.user._id},{$pull :{votedReqs: req.params.Id}}).exec();
                const updatedReq = await BlogRequest.updateOne({_id: req.params.Id},{$inc: {votes: -1}});
                if(updatedReq){
                    return res.status(200).end();
                } return res.status(404).end(); 
            } 
        }
    } catch(err) {
        console.log(err);
        next(err);
    }
    return ;
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
    
    const searchQuery = req.query.search || "";
    let query = {};
    const regex = new RegExp(searchQuery, 'i');
    if (searchQuery) {
        query = {isPublished: true};
        query.$text = { $search: searchQuery };
    }
    const [blogs, bloggers, reqs] = await Promise.all([
         Blog.find(query, ["author","title","votes"]).populate('author',"first_name last_name").limit(10).exec(),
         Author.find({
            $or: [
              { first_name: { $regex: regex } },
              { last_name: { $regex: regex } }
            ]
        }, 'first_name last_name').exec(),
         RequestBlog.find({title: { $regex: regex } },'title').exec()
    ]);
    res.json({blogs,bloggers,reqs});
});

exports.getFeaturedBlog = asyncHandler(async (req, res, next) => {
    try {
        const blog = await Blog.findOne({_id:'670ca10144ea73738208abb1'}).populate("author","first_name last_name").exec();
        if(blog) {
            return res.status(200).send({post: blog});
        } else {
            return res.status(404).send("Blog not found!");
        }
    } catch (err) {
        console.log(err);
        next(err)
    }
});

exports.getNews = asyncHandler(async (req, res, next) => {
    try {
        const news = await News.find().sort({"_id": -1}).exec();
        if(news) {
            return res.status(200).send(news);
        } else {
            return res.status(404).send('Error Loadidng News');
        }
    } catch (err) {
        console.log(err);
        next(err)
    }
});

exports.getNotifications = asyncHandler(async (req, res, next) => {
    try {
        const notis = await User.findById(req.user._id, 'notifications').populate('notifications','text').sort({"_id": -1}).exec();
        if(notis) {
            return res.status(200).send(notis);
        } else {
            return res.status(404).send('Error Loadidng Notifications');
        }
    } catch (err) {
        console.log(err);
        next(err)
    }
});

exports.dismissNoti = asyncHandler(async (req, res, next)=>{
    try{
        await User.findByIdAndUpdate(req.user._id,{$pull: {notifications: req.params.id}});
        await notification.deleteOne({_id: req.params.id});
        res.status(200).end();
    } catch(err){
        console.log(err);
        next(err);
    }
});

exports.postEditorReq = asyncHandler(async (req, res, next)=>{
    try{    
            const existingReq = await EditorRequest.findOne({user: req.user._id}).exec();
            if(existingReq){
                res.status(404).send('Request Already Submitted');
            }else {
                let first_name = ""; 
                let last_name = req.user.userName;
                const authorDetails = await author.findById(req.user.authorDetails.toString(),'first_name last_name').exec();
                console.log(authorDetails);
                if(authorDetails){
                    first_name = authorDetails.first_name;
                    last_name = authorDetails.last_name;
                }
                const newReq = new EditorRequest({
                requestStatus: 0,
                first_name: first_name,
                last_name: last_name,
                dateCreated: new Date(),
                user: req.user.id
            });
            const newNoti = new notification({
                text:"Your Request to Become an Editor has been Recieved",
                dateCreated: new Date(),
            });
            await newNoti.save();
            const savedReq =  await newReq.save();
            await User.findByIdAndUpdate(req.user._id,{$push:{"notifications": newNoti}});
            if(savedReq){
                res.status(200).send(savedReq.status);
            } else {
                res.status(404).send('Could not save Req');
            }
        }
    }catch(err){
        console.log(err);
        next(err);
    }
});

exports.getEditorReqStatus = asyncHandler(async(req, res, next)=>{
    try{
        const reqs = await EditorRequest.findOne({user:req.user._id},"requestStatus").exec();
        if(reqs){
            res.status(200).send(`${reqs.requestStatus}`);
        } else{
            res.status(200).send("4");
        }        
    }catch(err){
        console.log(err)
        next(err);
    }
});