const express = require('express');
const router = express.Router();
const Blog = require("../models/blog");
const Author = require("../models/author");
const asyncHandler = require("express-async-handler");

router.post('/editorData', asyncHandler( async function(req, res, next){
    if(req.body.body){
        const author = new Author({
            last_name: "D",
            first_name: "K",
            blogs: []
        });

        const blog = new Blog({
            date_created: new Date(),
            author: author,
            tags: [],
            content: req.body.body
        });
        author.blogs.push(blog);
        await author.save();
        await blog.save();
        res.send("ok");
    } 
  }));

  module.exports = router;