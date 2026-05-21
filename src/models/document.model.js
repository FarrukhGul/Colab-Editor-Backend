import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content : {
        type: String,
        default: ''
    },  
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        user : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        role: {
            type: String,
            enum: ['editor', 'viewer'],
            default: 'viewer'
        }
    }]

}, { timestamps: true });


const documentModel = mongoose.model('Document', documentSchema);

export default documentModel;