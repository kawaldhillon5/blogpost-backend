const express = require('express');
const router = express.Router();
const client_controller = require("../controllers/clientController");

router.get('/allBlogPosts', client_controller.getAllBlogPosts);
router.get('/blog/:blogId', client_controller.getBlog);

router.get('/allBlogRequests', client_controller.getAllRequests);
router.get('/requestBlog/:reqId', client_controller.getRequest);
router.get('/isVoted/:blogId',client_controller.getIsVoted);
router.get('/blog/comments/:blogId', client_controller.getComments);
router.get("/blogs", client_controller.blogsSerach);

router.get('/authors/popularAuthors', client_controller.getAuthors);
router.get('/blogs/newBlogs', client_controller.getNewBlogs);
router.get('/blogs/popularBlogs', client_controller.getPopularBlogs);

router.post('/newBlogRequest', client_controller.postRequest);
router.post('/vote/:blogId',client_controller.postVote);
router.post('/blog/postComment/:blogId', client_controller.postComment);
module.exports = router;
