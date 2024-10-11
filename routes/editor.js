const express = require('express');
const router = express.Router();
const editorController = require("../controllers/editorController");

router.get('/myBlogPosts/:userId', editorController.getMyBlogPosts );
router.get('/newBlog/:userId', editorController.createNewEmptyBlog);
router.get('/blog/:blogId', editorController.getBlog);
router.get('/editorReqs', editorController.getEditorReqs);

router.post('/editorReqChoice/:id',editorController.postEditorReqChoice);
router.post('/updateBlog/:blogId', editorController.updateBlog)

  module.exports = router;