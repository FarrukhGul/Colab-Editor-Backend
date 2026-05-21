import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    versionNumber: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    savedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

const versionModel = mongoose.model('Version', versionSchema)

export default versionModel