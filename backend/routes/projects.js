const express = require('express');
const router = express.Router();
const { Project } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, APIError } = require('../middleware/errorHandler');

/**
 * @route   GET /api/projects
 * @desc    Get all projects for current user
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { status, limit = 50, skip = 0 } = req.query;

    const query = {
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id },
      ],
    };

    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .sort({ lastAccessedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('owner', 'username email profile')
      .populate('collaborators.user', 'username profile');

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: total > parseInt(skip) + parseInt(limit),
        },
      },
    });
  })
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username email profile')
      .populate('collaborators.user', 'username profile');

    if (!project) {
      throw new APIError('Project not found', 404);
    }

    // Check access
    if (!project.hasAccess(req.user._id)) {
      throw new APIError('Access denied', 403);
    }

    // Update last accessed
    project.lastAccessedAt = new Date();
    await project.save();

    res.json({
      success: true,
      data: { project },
    });
  })
);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      name,
      description,
      code,
      previewHTML,
      chatHistory,
      tags,
      isPublic,
    } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      code: code || {},
      previewHTML: previewHTML || '',
      chatHistory: chatHistory || [],
      tags: tags || [],
      isPublic: isPublic || false,
      status: 'draft',
    });

    // Create initial version
    project.createVersion('Initial version');
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  })
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      throw new APIError('Project not found', 404);
    }

    // Check edit permission
    if (!project.canEdit(req.user._id)) {
      throw new APIError('You do not have permission to edit this project', 403);
    }

    const {
      name,
      description,
      code,
      previewHTML,
      chatHistory,
      tags,
      isPublic,
      status,
      createNewVersion,
      versionComment,
    } = req.body;

    // Update fields
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (code !== undefined) project.code = { ...project.code, ...code };
    if (previewHTML !== undefined) project.previewHTML = previewHTML;
    if (chatHistory !== undefined) project.chatHistory = chatHistory;
    if (tags !== undefined) project.tags = tags;
    if (isPublic !== undefined) project.isPublic = isPublic;
    if (status !== undefined) project.status = status;

    // Create new version if requested
    if (createNewVersion) {
      project.createVersion(versionComment || '');
    }

    project.lastAccessedAt = new Date();
    await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  })
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      throw new APIError('Project not found', 404);
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      throw new APIError('Only the project owner can delete this project', 403);
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  })
);

/**
 * @route   POST /api/projects/:id/collaborators
 * @desc    Add collaborator to project
 * @access  Private
 */
router.post(
  '/:id/collaborators',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { userId, role = 'viewer' } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      throw new APIError('Project not found', 404);
    }

    // Only owner can add collaborators
    if (project.owner.toString() !== req.user._id.toString()) {
      throw new APIError('Only the project owner can add collaborators', 403);
    }

    // Check if already a collaborator
    const existingCollab = project.collaborators.find(
      (c) => c.user.toString() === userId
    );

    if (existingCollab) {
      throw new APIError('User is already a collaborator', 400);
    }

    // Add collaborator
    project.collaborators.push({
      user: userId,
      role,
    });

    await project.save();

    res.json({
      success: true,
      message: 'Collaborator added successfully',
      data: { project },
    });
  })
);

/**
 * @route   DELETE /api/projects/:id/collaborators/:userId
 * @desc    Remove collaborator from project
 * @access  Private
 */
router.delete(
  '/:id/collaborators/:userId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      throw new APIError('Project not found', 404);
    }

    // Only owner can remove collaborators
    if (project.owner.toString() !== req.user._id.toString()) {
      throw new APIError('Only the project owner can remove collaborators', 403);
    }

    // Remove collaborator
    project.collaborators = project.collaborators.filter(
      (c) => c.user.toString() !== req.params.userId
    );

    await project.save();

    res.json({
      success: true,
      message: 'Collaborator removed successfully',
      data: { project },
    });
  })
);

/**
 * @route   GET /api/projects/:id/versions
 * @desc    Get all versions of a project
 * @access  Private
 */
router.get(
  '/:id/versions',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      throw new APIError('Project not found', 404);
    }

    if (!project.hasAccess(req.user._id)) {
      throw new APIError('Access denied', 403);
    }

    res.json({
      success: true,
      data: {
        versions: project.versions,
        currentVersion: project.currentVersion,
      },
    });
  })
);

/**
 * @route   POST /api/projects/:id/versions/:versionNumber/restore
 * @desc    Restore a specific version
 * @access  Private
 */
router.post(
  '/:id/versions/:versionNumber/restore',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      throw new APIError('Project not found', 404);
    }

    if (!project.canEdit(req.user._id)) {
      throw new APIError('You do not have permission to edit this project', 403);
    }

    const version = project.versions.find(
      (v) => v.versionNumber === parseInt(req.params.versionNumber)
    );

    if (!version) {
      throw new APIError('Version not found', 404);
    }

    // Restore version
    project.code = version.code;
    project.previewHTML = version.previewHTML;
    project.currentVersion = version.versionNumber;

    await project.save();

    res.json({
      success: true,
      message: 'Version restored successfully',
      data: { project },
    });
  })
);

module.exports = router;
