const express = require('express');
const router = express.Router();
const editorController = require("../controllers/editorController");

router.get('/myBlogPosts', editorController.getMyBlogPosts );
// router.get('/newBlog', editorController.createNewEmptyBlog);
router.get('/blog/:blogId', editorController.getBlog);
router.get('/editorReqs', editorController.getEditorReqs);
router.get('/publishBlogRequests', editorController.getPublishBlogRequests);

router.post('/editorReqChoice/:id',editorController.postEditorReqChoice);
router.post('/updateBlog/:blogId/:mode', editorController.saveBlog);
// router.post('/finishBlog/:blogId', editorController.finishEditingBlog);
router.post('/publishReqChoice/:reqId',editorController.postPublishBlogReq)
router.post('/deleteBlog/:blogId', editorController.postDeleteBlogReq);

module.exports = router;