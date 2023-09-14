const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: String,
    author: String,
    image: String,
    community: String,
    text: String,
    upvote: Number,
    downvote: Number,
    // author: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

module.exports = mongoose.model('Post', PostSchema);