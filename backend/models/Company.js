const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  logo: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    trim: true,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  postCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Auto-generate slug from name
companySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
