const express = require('express');
const router = express.Router();
const client_controller = require("../controllers/clientController");

router.get('/allBlogPosts', client_controller.getAllBlogPosts);
router.get('/blog/:blogId', client_controller.getBlog);

router.get('/allBlogRequests', client_controller.getAllRequests);
router.get('/requestBlog/:reqId', client_controller.getRequest);
router.post('/newBlogRequest', client_controller.postRequest);
module.exports = router;
