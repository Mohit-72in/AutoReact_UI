const mongoose = require('mongoose');

/**
 * Project Model
 * Stores AI-generated projects with versioning and collaboration support
 */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for faster queries
    },
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['viewer', 'editor', 'admin'],
          default: 'viewer',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    code: {
      html: { type: String, default: '' },
      css: { type: String, default: '' },
      js: { type: String, default: '' },
      jsx: { type: String, default: '' },
    },
    previewHTML: {
      type: String,
      default: '',
    },
    chatHistory: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    versions: [
      {
        versionNumber: { type: Number, required: true },
        code: {
          html: String,
          css: String,
          js: String,
          jsx: String,
        },
        previewHTML: String,
        createdAt: { type: Date, default: Date.now },
        comment: { type: String, maxlength: 200 },
      },
    ],
    currentVersion: {
      type: Number,
      default: 1,
    },
    githubRepo: {
      url: String,
      branch: String,
      exportedAt: Date,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ collaborators: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ isPublic: 1, status: 1 });

// Virtual for current code snapshot
projectSchema.virtual('currentCode').get(function () {
  if (this.versions.length > 0) {
    const currentVer = this.versions.find(
      (v) => v.versionNumber === this.currentVersion
    );
    return currentVer ? currentVer.code : this.code;
  }
  return this.code;
});

// Method to create a new version
projectSchema.methods.createVersion = function (comment = '') {
  const newVersion = {
    versionNumber: this.versions.length + 1,
    code: {
      html: this.code.html,
      css: this.code.css,
      js: this.code.js,
      jsx: this.code.jsx,
    },
    previewHTML: this.previewHTML,
    comment,
  };

  this.versions.push(newVersion);
  this.currentVersion = newVersion.versionNumber;
  return newVersion;
};

// Method to check if user has access
projectSchema.methods.hasAccess = function (userId) {
  // Owner always has access
  if (this.owner.toString() === userId.toString()) {
    return true;
  }

  // Check if user is a collaborator
  return this.collaborators.some(
    (collab) => collab.user.toString() === userId.toString()
  );
};

// Method to check if user can edit
projectSchema.methods.canEdit = function (userId) {
  // Owner can always edit
  if (this.owner.toString() === userId.toString()) {
    return true;
  }

  // Check if user is editor or admin
  const collaborator = this.collaborators.find(
    (collab) => collab.user.toString() === userId.toString()
  );

  return collaborator && ['editor', 'admin'].includes(collaborator.role);
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
