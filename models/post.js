const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: String,
    text: String,
    upvote: Number,
    downvote: Number
    // author: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    // },
    // reviews: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Review'
    //     }
    // ]
});

module.exports = mongoose.model('Post', PostSchema);