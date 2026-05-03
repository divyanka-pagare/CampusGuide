const Company = require('../models/Company');
const Post = require('../models/Post');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ isActive: true })
      .sort('-postCount')
      .lean();

    res.json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single company with posts
// @route   GET /api/companies/:slug
// @access  Public
const getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug, isActive: true });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stats for a company
// @route   GET /api/companies/:id/stats
// @access  Public
const getCompanyStats = async (req, res) => {
  try {
    const stats = await Post.aggregate([
      { $match: { company: require('mongoose').Types.ObjectId(req.params.id), isActive: true } },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          selectedCount: { $sum: { $cond: ['$isSelected', 1, 0] } },
          notSelectedCount: { $sum: { $cond: ['$isSelected', 0, 1] } },
          placementCount: { $sum: { $cond: [{ $eq: ['$driveType', 'placement'] }, 1, 0] } },
          internshipCount: { $sum: { $cond: [{ $eq: ['$driveType', 'internship'] }, 1, 0] } }
        }
      }
    ]);

    res.json({ success: true, stats: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCompanies, getCompany, getCompanyStats };
