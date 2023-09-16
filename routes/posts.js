const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { postSchema } = require('../schema.js');

const ExpressError = require('../utils/ExpressError');
const Post = require('../models/post');
const { isLoggedIn, isAuthor, validatePost } = require('../middleware');
const { type } = require('os');



router.get('/', catchAsync(async (req, res) => {
    const posts = await Post.find({}).populate('author');
    res.render('posts/index', { posts })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('posts/new');
})


router.post('/', isLoggedIn, validatePost, catchAsync(async (req, res, next) => {
    const post = new Post(req.body.post);
    post.author = req.user._id;
    await post.save();
    req.flash('success', 'Successfully made a new post!');
    res.redirect(`/posts/${post._id}`)
}))

// Define a route to display popular posts

router.get('/popular', async (req, res) => {
    try {
      // Sort posts by upvote count in descending order and populate the 'author' field
      const posts = await Post.find().sort({ upvote: 'desc' }).populate('author');
      res.render('posts/popular', { posts }); // Replace 'popular' with the actual path to your popular.ejs file
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error'); // Handle errors gracefully
    }
  });
  

router.get('/:id', catchAsync(async (req, res,) => {
    const post = await Post.findById(req.params.id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!post) {
        req.flash('error', 'Cannot find that post!');
        return res.redirect('/posts');
    }
    res.render('posts/show', { post });
}));



router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id)
    if (!post) {
        req.flash('error', 'Cannot find that post!');
        return res.redirect('/posts');
    }
    res.render('posts/edit', { post });
}))

router.put('/:id', isLoggedIn, isAuthor, validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    req.flash('success', 'Successfully updated post!');
    return res.redirect(`/posts/${post._id}`)
}));

router.put('/:id/upvote', catchAsync(async (req, res) => {
    const { id } = req.params;
    const { upvote } = req.body;
  
    // Parse values as integers
    const parsedUpvote = parseInt(upvote) + 1;
  
    // Use findByIdAndUpdate to update the values in the database
    await Post.findByIdAndUpdate(id, { upvote: parsedUpvote });
  
    // Check if the URL does not contain '/popular'
    if (!req.originalUrl.includes('/popular')) {
      return res.redirect('/posts');
    } else {
      return res.redirect('/posts/popular');
    }
  }));
  
  router.put('/:id/downvote', catchAsync(async (req, res) => {
    const { id } = req.params;
    const { downvote } = req.body;
  
    // Parse values as integers
    const parsedDownvote = parseInt(downvote) + 1;
  
    // Use findByIdAndUpdate to update the values in the database
    await Post.findByIdAndUpdate(id, { downvote: parsedDownvote });
  
    // Check if the URL does not contain '/popular'
    if (!req.originalUrl.includes('/popular')) {
      return res.redirect('/posts');
    } else {
      return res.redirect('/posts/popular');
    }
  }));
  



router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted post')
    res.redirect('/posts');
}));



  

  
  

  


module.exports = router;