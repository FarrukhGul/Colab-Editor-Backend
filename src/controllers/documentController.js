import documentModel from '../models/document.model.js'
import versionModel from '../models/version.model.js'
import userModel from '../models/user.model.js'

export const createNewDocument = async (req, res) => {
    const {title} = req.body;
    const owner = req.user.id

    try{
        const newDocument = await documentModel.create({title, owner});
        res.status(201).json({
            success: true,
            message: 'Document created successfully',
            document: newDocument
        });   
    }

    catch(error){
        console.error('Error creating document:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const getAllDocuments = async (req, res) => {
    const owner = req.user.id;

    try{
        const allDocuments = await documentModel.find({
            $or: [
                { owner },
                { 'collaborators.user': owner }
            ]
        }).populate('owner', 'name email').populate('collaborators.user', 'name email');

        res.status(200).json({
            success: true,
            documents: allDocuments
        });
    }

    catch(error){
        console.error('Error fetching documents:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


export const getDocumentById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const document = await documentModel.findById(id)
            .populate('owner', 'name email')
            .populate('collaborators.user', 'name email')

        // Check if document exists
        if(!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            })
        }

        // Check if user has access
        const isOwner = document.owner._id.toString() === userId
        const isCollaborator = document.collaborators.some(
            c => c.user._id.toString() === userId
        )

        if(!isOwner && !isCollaborator) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            })
        }

        return res.status(200).json({
            success: true,
            document
        })

    } catch(error) {
        console.error('Error fetching document:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const updateDocument = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    try {
        const document = await documentModel.findById(id)

        // Check if document exists
        if(!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            })
        }

        // Check if user has edit access
        const isOwner = document.owner.toString() === userId
        const isEditor = document.collaborators.some(
            c => c.user.toString() === userId && c.role === 'editor'
        )

        if(!isOwner && !isEditor) {
            return res.status(403).json({
                success: false,
                message: 'Access denied — edit permission required'
            })
        }

        // Update document
        if(title) document.title = title
        if(content) document.content = content

        await document.save()

        return res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            document
        })

    } catch(error) {
        console.error('Error updating document:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


export const deleteDocument = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const document = await documentModel.findById(id)

        // Check if document exists
        if(!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            })
        }

        // Only owner can delete
        const isOwner = document.owner.toString() === userId
        if(!isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied — only owner can delete'
            })
        }

        // Delete document
        await documentModel.findByIdAndDelete(id)

        return res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        })

    } catch(error) {
        console.error('Error deleting document:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


export const getCollaborators = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const document = await documentModel.findById(id)
            .populate('collaborators.user', 'name email')

        // Check if document exists
        if(!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            })
        }

        // Only owner can view collaborators
        const isOwner = document.owner.toString() === userId
        if(!isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied — only owner can view collaborators'
            })
        }

        return res.status(200).json({
            success: true,
            collaborators: document.collaborators
        })

    } catch(error) {
        console.error('Error fetching collaborators:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const addCollaborator = async (req, res) => {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user.id;

    try {
        const document = await documentModel.findById(id)

        // Check if document exists
        if(!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            })
        }

        // Only owner can add collaborators
        const isOwner = document.owner.toString() === userId
        if(!isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied — only owner can add collaborators'
            })
        }

        // Find user by email
        const collaboratorUser = await userModel.findOne({ email })
        if(!collaboratorUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Check if user is already a collaborator
        const alreadyCollaborator = document.collaborators.some(
            c => c.user.toString() === collaboratorUser._id.toString()
        )
        if(alreadyCollaborator) {
            return res.status(400).json({
                success: false,
                message: 'User is already a collaborator'
            })
        }

        // Check if user is the owner
        if(collaboratorUser._id.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: 'Owner cannot be added as collaborator'
            })
        }

        // Add collaborator
        document.collaborators.push({
            user: collaboratorUser._id,
            role
        })
        await document.save()

        return res.status(200).json({
            success: true,
            message: 'Collaborator added successfully'
        })

    } catch(error) {
        console.error('Error adding collaborator:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const removeCollaborator = async (req, res) => {
    const { id, userId: collaboratorId } = req.params;
    const userId = req.user.id;

    try {
        const document = await documentModel.findById(id)

        // Check if document exists
        if(!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            })
        }

        // Only owner can remove collaborators
        const isOwner = document.owner.toString() === userId
        if(!isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied — only owner can remove collaborators'
            })
        }

        // Check if collaborator exists
        const collaboratorExists = document.collaborators.some(
            c => c.user.toString() === collaboratorId
        )
        if(!collaboratorExists) {
            return res.status(404).json({
                success: false,
                message: 'Collaborator not found'
            })
        }

        // Remove collaborator
        document.collaborators = document.collaborators.filter(
            c => c.user.toString() !== collaboratorId
        )
        await document.save()

        return res.status(200).json({
            success: true,
            message: 'Collaborator removed successfully'
        })

    } catch(error) {
        console.error('Error removing collaborator:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const getVersions = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const document = await documentModel.findById(id)

        // Check if document exists
        if(!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            })
        }

        // Check if user has access
        const isOwner = document.owner.toString() === userId
        const isCollaborator = document.collaborators.some(
            c => c.user.toString() === userId
        )

        if(!isOwner && !isCollaborator) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            })
        }

        // Get all versions of document
        const versions = await versionModel.find({ documentId: id })
            .populate('savedBy', 'name email')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            versions
        })

    } catch(error) {
        console.error('Error fetching versions:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const restoreVersion = async (req, res) => {
    const { id } = req.params;
    const { versionId } = req.body;
    const userId = req.user.id;

    try {
        const document = await documentModel.findById(id)

        // Check if document exists
        if(!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            })
        }

        // Only owner can restore version
        const isOwner = document.owner.toString() === userId
        if(!isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied — only owner can restore versions'
            })
        }

        // Find version
        const version = await versionModel.findById(versionId)
        if(!version) {
            return res.status(404).json({
                success: false,
                message: 'Version not found'
            })
        }

        // Save current content as new version before restoring
        const latestVersion = await versionModel.findOne({ documentId: id })
            .sort({ versionNumber: -1 })

        await versionModel.create({
            documentId: id,
            content: document.content,
            savedBy: userId,
            versionNumber: (latestVersion?.versionNumber || 0) + 1
        })

        // Restore version
        document.content = version.content
        await document.save()

        return res.status(200).json({
            success: true,
            message: 'Version restored successfully',
            document
        })

    } catch(error) {
        console.error('Error restoring version:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
