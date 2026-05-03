const Post = require('../models/Post');
const Company = require('../models/Company');

// @desc    Create a post (always starts as unverified/pending)
// @route   POST /api/posts
// @access  Private (students)
const createPost = async (req, res) => {
  try {
    const {
      companyName, driveYear, driveType, role, package: pkg,
      studentBranch, studentPassingYear, cgpa, isSelected,
      title, overview, rounds, preparationTips, resourcesUsed, otherInsights, tags
    } = req.body;

    // Find or create company
    let company = await Company.findOne({ name: { $regex: new RegExp(`^${companyName}$`, 'i') } });
    if (!company) {
      company = await Company.create({ name: companyName, createdBy: req.user._id });
    }

    const post = await Post.create({
      author: req.user._id,
      company: company._id,
      companyName: company.name,
      driveYear, driveType, role,
      package: pkg,
      studentBranch,
      studentPassingYear,
      cgpa, isSelected,
      title, overview,
      rounds: rounds || [],
      preparationTips,
      resourcesUsed: resourcesUsed || [],
      otherInsights,
      tags: tags || [],
      isVerified: false,      // always starts unverified
      status: 'pending'       // pending | approved | rejected
    });

    const populated = await Post.findById(post._id)
      .populate('author', 'name email branch graduationYear');

    res.status(201).json({
      success: true,
      message: 'Experience submitted! It will be visible publicly after admin verification.',
      post: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get public posts (only verified) OR all posts for admin
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const {
      company, isSelected, driveYear, passingYear, driveType,
      branch, sort = '-createdAt', page = 1, limit = 12
    } = req.query;

    const filter = { isActive: true };

    // Public users only see verified posts
    // Admins/TPO/Principal see all
    const isModerator = req.user && ['admin', 'tpo', 'principal'].includes(req.user.role);
    if (!isModerator) {
      filter.isVerified = true;
      filter.status = 'approved';
    }

    if (company) filter.company = company;
    if (isSelected !== undefined && isSelected !== '') filter.isSelected = isSelected === 'true';
    if (driveYear) filter.driveYear = Number(driveYear);
    if (passingYear) filter.studentPassingYear = Number(passingYear);
    if (driveType) filter.driveType = driveType;
    if (branch) filter.studentBranch = branch;

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name branch graduationYear')
        .sort(sort)
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
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public (verified only) | Author can see own | Admin sees all
const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isActive: true })
      .populate('author', 'name branch graduationYear email')
      .populate('verifiedBy', 'name role');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isModerator = req.user && ['admin', 'tpo', 'principal'].includes(req.user.role);
    const isAuthor = req.user && post.author._id.toString() === req.user._id.toString();

    // Non-verified posts only visible to author and moderators
    if (!post.isVerified && !isModerator && !isAuthor) {
      return res.status(403).json({ success: false, message: 'This post is pending verification' });
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update post (author only) - resets verification
// @route   PUT /api/posts/:id
// @access  Private (author only)
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // ONLY author can edit their own post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own posts' });
    }

    const allowedUpdates = [
      'title', 'overview', 'rounds', 'preparationTips',
      'resourcesUsed', 'otherInsights', 'tags', 'package', 'cgpa'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) post[field] = req.body[field];
    });

    // Reset verification — needs re-approval after edit
    post.isVerified = false;
    post.status = 'pending';
    post.verifiedBy = null;
    post.verifiedAt = null;

    await post.save();
    const updated = await Post.findById(post._id)
      .populate('author', 'name branch graduationYear');

    res.json({
      success: true,
      message: 'Post updated! It needs to be re-verified by admin before going public.',
      post: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete post (author only)
// @route   DELETE /api/posts/:id
// @access  Private (author only)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // ONLY author can delete their own post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts' });
    }

    post.isActive = false;
    await post.save();

    // Update company post count
    await Company.findByIdAndUpdate(post.company, { $inc: { postCount: -1 } });

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id;
    const alreadyLiked = post.likes.includes(userId);
    const alreadyDisliked = post.dislikes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
      if (alreadyDisliked) post.dislikes.pull(userId);
    }

    await post.save();

    res.json({
      success: true,
      liked: !alreadyLiked,
      likeCount: post.likes.length,
      dislikeCount: post.dislikes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dislike a post
// @route   POST /api/posts/:id/dislike
// @access  Private
const dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id;
    const alreadyDisliked = post.dislikes.includes(userId);
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyDisliked) {
      post.dislikes.pull(userId);
    } else {
      post.dislikes.push(userId);
      if (alreadyLiked) post.likes.pull(userId);
    }

    await post.save();

    res.json({
      success: true,
      disliked: !alreadyDisliked,
      likeCount: post.likes.length,
      dislikeCount: post.dislikes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get posts by logged-in user (all statuses)
// @route   GET /api/posts/my-posts
// @access  Private
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id, isActive: true })
      .populate('author', 'name branch graduationYear')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPost, getPosts, getPost, updatePost,
  deletePost, likePost, dislikePost, getMyPosts
};
