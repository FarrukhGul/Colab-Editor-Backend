import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {
    getAllDocuments,
    createNewDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getCollaborators,
    addCollaborator,
    removeCollaborator,
    getVersions,
    restoreVersion
} from '../controllers/documentController.js'
import validate from '../middleware/validateMiddleware.js'
import { createDocumentValidator, updateDocumentValidator, addCollaboratorValidator } from '../validators/documentValidator.js'

const documentRouter = express.Router()

// Document routes
documentRouter.get('/', authMiddleware, getAllDocuments)
documentRouter.post('/', authMiddleware, validate(createDocumentValidator), createNewDocument)
documentRouter.get('/:id', authMiddleware, getDocumentById)
documentRouter.put('/:id', authMiddleware, validate(updateDocumentValidator), updateDocument)
documentRouter.delete('/:id', authMiddleware, deleteDocument)

// Collaborator routes
documentRouter.get('/:id/collaborators', authMiddleware, getCollaborators)
documentRouter.post('/:id/collaborators', authMiddleware, validate(addCollaboratorValidator), addCollaborator)
documentRouter.delete('/:id/collaborators/:userId', authMiddleware, removeCollaborator)

// Version routes
documentRouter.get('/:id/versions', authMiddleware, getVersions)
documentRouter.post('/:id/versions/restore', authMiddleware, restoreVersion)

export default documentRouter