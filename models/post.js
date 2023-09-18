const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./comment');

const PostSchema = new Schema({
    title: String,
    image: String,
    community: String,
    text: String,
    upvote: {
        type: Number,
        default: 0, // Set the default value to 0
    },
    downvote: {
        type: Number,
        default: 0, // Set the default value to 0
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

PostSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
});

module.exports = mongoose.model('Post', PostSchema);
