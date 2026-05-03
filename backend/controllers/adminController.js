const Post = require('../models/Post');
const User = require('../models/User');
const Company = require('../models/Company');

// @desc    Approve a post (makes it public)
// @route   PATCH /api/admin/posts/:id/approve
// @access  Admin, TPO, Principal
const approvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.isVerified = true;
    post.status = 'approved';
    post.verifiedBy = req.user._id;
    post.verifiedAt = new Date();
    post.rejectionReason = '';

    await post.save();

    // Update company post count
    await Company.findByIdAndUpdate(post.company, { $inc: { postCount: 1 } });

    res.json({ success: true, message: 'Post approved and is now public!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a post
// @route   PATCH /api/admin/posts/:id/reject
// @access  Admin, TPO, Principal
const rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.isVerified = false;
    post.status = 'rejected';
    post.verifiedBy = req.user._id;
    post.verifiedAt = new Date();
    post.rejectionReason = reason || 'Does not meet guidelines';

    await post.save();

    res.json({ success: true, message: 'Post rejected.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all posts by status for admin
// @route   GET /api/admin/posts
// @access  Admin, TPO, Principal
const getAllPostsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name email branch graduationYear')
        .populate('verifiedBy', 'name role')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Post.countDocuments(filter)
    ]);

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin delete any post
// @route   DELETE /api/admin/posts/:id
// @access  Admin only
const adminDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.status === 'approved') {
      await Company.findByIdAndUpdate(post.company, { $inc: { postCount: -1 } });
    }

    post.isActive = false;
    await post.save();

    res.json({ success: true, message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin only
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt').lean();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user role
// @route   PATCH /api/admin/users/:id/role
// @access  Admin only
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['student', 'tpo', 'principal', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: `Role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dashboard stats
// @route   GET /api/admin/stats
// @access  Admin, TPO, Principal
const getDashboardStats = async (req, res) => {
  try {
    const [totalPosts, pendingPosts, approvedPosts, rejectedPosts, totalUsers, totalCompanies] = await Promise.all([
      Post.countDocuments({ isActive: true }),
      Post.countDocuments({ status: 'pending', isActive: true }),
      Post.countDocuments({ status: 'approved', isActive: true }),
      Post.countDocuments({ status: 'rejected', isActive: true }),
      User.countDocuments({ isActive: true }),
      Company.countDocuments({ isActive: true })
    ]);

    res.json({
      success: true,
      stats: { totalPosts, pendingPosts, approvedPosts, rejectedPosts, totalUsers, totalCompanies }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  approvePost, rejectPost, getAllPostsAdmin,
  adminDeletePost, getUsers, changeUserRole, getDashboardStats
};
