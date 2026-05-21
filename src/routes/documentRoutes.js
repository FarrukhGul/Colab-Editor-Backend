import express from 'express'
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

const documentRouter = express.Router()

// Document routes

// get all documents
documentRouter.get('/', getAllDocuments)
// create a new document
documentRouter.post('/', createNewDocument)
// get a document by id
documentRouter.get('/:id', getDocumentById)
// update a document by id
documentRouter.put('/:id', updateDocument)
// delete a document by id
documentRouter.delete('/:id', deleteDocument)



// Collaborator routes

// get collaborators of a document
documentRouter.get('/:id/collaborators', getCollaborators)
// add a collaborator to a document
documentRouter.post('/:id/collaborators', addCollaborator)
// remove a collaborator from a document
documentRouter.delete('/:id/collaborators/:userId', removeCollaborator)



// Version routes

// get versions of a document
documentRouter.get('/:id/versions', getVersions)
// restore a document to a specific version
documentRouter.post('/:id/versions/restore', restoreVersion)

export default documentRouter