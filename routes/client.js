const express = require('express');
const router = express.Router();
const client_controller = require("../controllers/clientController");

router.get('/allBlogPosts', client_controller.getAllBlogPosts);
router.get('/blog/:blogId', client_controller.getBlog);
module.exports = router;
