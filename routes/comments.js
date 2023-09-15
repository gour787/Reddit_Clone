const express = require('express');
const router = express.Router({ mergeParams: true });

const Post = require('../models/post');
const Comment = require('../models/comment');

const { commentSchema } = require('../schema.js');
const { isLoggedIn, validateComment, isCommentAuthor } = require('../middleware');


const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');





router.post('/', isLoggedIn, validateComment, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash('success', 'Created new comment!');
    res.redirect(`/posts/${post._id}`);
}))

router.delete('/:commentId', isLoggedIn, isCommentAuthor, catchAsync(async (req, res) => {
    const { id, commentId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', 'Successfully deleted comment')
    res.redirect(`/posts/${id}`);
}))

module.exports = router;