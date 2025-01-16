const express = require('express');
const router = express.Router();
const client_controller = require("../controllers/clientController");

router.get('/allBlogPosts', client_controller.getAllBlogPosts);
router.get('/blog/:blogId', client_controller.getBlog);

router.get('/allBlogRequests', client_controller.getAllRequests);
router.get('/requestBlog/:reqId', client_controller.getRequest);
router.get('/isVoted/:type/:Id',client_controller.getIsVoted);
router.get('/votes/:type/:Id', client_controller.getVotes);
router.get('/blog/comments/:blogId', client_controller.getComments);
router.get("/blogs", client_controller.blogsSerach);
router.get('/featuredBlog', client_controller.getFeaturedBlog);
router.get('/news', client_controller.getNews);
router.get('/notifications', client_controller.getNotifications);
router.get('/bloggers/:authorId', client_controller.getBlogsByAuthor);
router.get('/blogger/:authorId', client_controller.getAuthorDetails);
router.get('/authors/popularAuthors', client_controller.getAuthors);
router.get('/blogs/newBlogs', client_controller.getNewBlogs);
router.get('/blogs/popularBlogs', client_controller.getPopularBlogs);
router.get('/EditorReqStatus', client_controller.getEditorReqStatus);

router.post('/newBlogRequest', client_controller.postRequest);
router.post('/vote/:type/:Id',client_controller.postVote);
router.post('/blog/postComment/:blogId', client_controller.postComment);
router.post('/postEditorReq', client_controller.postEditorReq);

router.delete('/delete/notification/:id', client_controller.dismissNoti);

module.exports = router;
