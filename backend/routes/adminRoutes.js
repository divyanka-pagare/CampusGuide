const express = require('express');
const router = express.Router();
const {
  approvePost, rejectPost, getAllPostsAdmin,
  adminDeletePost, getUsers, changeUserRole, getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// TPO + Principal + Admin
router.get('/stats', authorize('admin', 'tpo', 'principal'), getDashboardStats);
router.get('/posts', authorize('admin', 'tpo', 'principal'), getAllPostsAdmin);
router.patch('/posts/:id/approve', authorize('admin', 'tpo', 'principal'), approvePost);
router.patch('/posts/:id/reject', authorize('admin', 'tpo', 'principal'), rejectPost);

// Admin only
router.delete('/posts/:id', authorize('admin'), adminDeletePost);
router.get('/users', authorize('admin'), getUsers);
router.patch('/users/:id/role', authorize('admin'), changeUserRole);

module.exports = router;
