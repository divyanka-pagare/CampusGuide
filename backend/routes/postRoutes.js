const express = require('express');
const router = express.Router();
const {
  createPost, getPosts, getPost, updatePost,
  deletePost, likePost, dislikePost, getMyPosts
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getPosts);
router.get('/my-posts', protect, getMyPosts);
router.get('/:id', optionalAuth, getPost);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/dislike', protect, dislikePost);

module.exports = router;
