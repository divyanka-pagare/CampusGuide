const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundName: { type: String, required: true, trim: true },
  roundType: {
    type: String,
    enum: ['aptitude', 'coding', 'technical', 'hr', 'group_discussion', 'case_study', 'other'],
    required: true
  },
  description: { type: String, trim: true },
  duration: { type: String, trim: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tips: { type: String, trim: true },
  questionsAsked: [{ type: String, trim: true }]
}, { _id: false });

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  companyName: { type: String, required: true, trim: true },

  // Drive Info
  driveYear: { type: Number, required: true, min: 2018, max: 2035 },
  driveType: { type: String, enum: ['placement', 'internship'], required: true },
  role: { type: String, required: true, trim: true },
  package: { type: String, trim: true, default: '' },

  // Student Info
  studentBranch: {
    type: String,
    enum: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'OTHER'],
    required: true
  },
  studentPassingYear: { type: Number, required: true, min: 2020, max: 2035 },
  cgpa: { type: String, trim: true, default: '' },

  // Result
  isSelected: { type: Boolean, required: true },

  // Content
  title: { type: String, required: true, trim: true, maxlength: 150 },
  overview: { type: String, required: true, trim: true, maxlength: 2000 },
  rounds: [roundSchema],
  preparationTips: { type: String, trim: true, default: '' },
  resourcesUsed: [{ type: String, trim: true }],
  otherInsights: { type: String, trim: true, default: '' },

  // Engagement
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  dislikeCount: { type: Number, default: 0 },

  // Verification workflow
  isVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: { type: String, default: '' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedAt: { type: Date, default: null },

  isActive: { type: Boolean, default: true },
  tags: [{ type: String, trim: true }]

}, { timestamps: true });

// Indexes
postSchema.index({ company: 1, isActive: 1, isVerified: 1 });
postSchema.index({ status: 1 });
postSchema.index({ isSelected: 1 });
postSchema.index({ driveYear: 1 });
postSchema.index({ studentPassingYear: 1 });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });

postSchema.pre('save', function(next) {
  this.likeCount = this.likes.length;
  this.dislikeCount = this.dislikes.length;
  next();
});

module.exports = mongoose.model('Post', postSchema);
