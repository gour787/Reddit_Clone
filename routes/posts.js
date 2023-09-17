const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { postSchema } = require('../schema.js');

const ExpressError = require('../utils/ExpressError');
const Post = require('../models/post');
const { isLoggedIn, isAuthor, validatePost } = require('../middleware');
const { type } = require('os');



router.get('/', catchAsync(async (req, res) => {
    if (!req.user) {
        // Set a flash message with a warning type
        req.flash('warning', 'You are not logged in. Please log in or create an account to participate.');
    }
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


router.get('/popular', async (req, res) => {

    if (!req.user) {
        // Set a flash message with a warning type
        req.flash('warning', 'You are not logged in. Please log in or create an account to participate.');
    }
    try {
      
      const posts = await Post.find().sort({ upvote: 'desc' }).populate('author');
      res.render('posts/popular', { posts }); 
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error'); 
    }
  });

  router.get('/random', catchAsync(async (req, res) => {
    try {
      // Get the total number of posts
      const count = await Post.countDocuments();
  
      // Generate a random number within the range of available posts
      const randomIndex = Math.floor(Math.random() * count);
  
      // Find a post by skipping to the random index and populate it with comments and authors
      const randomPost = await Post.findOne().skip(randomIndex)
        .populate({
          path: 'comments',
          populate: {
            path: 'author'
          }
        })
        .populate('author');
  
      if (!randomPost) {
        return res.status(404).send('No posts found.');
      }
  
      // Render the random post page with the fetched post
      res.render('posts/show', { post: randomPost });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  }));
  

  router.get('/search', async (req, res) => {
    try {
      const { community } = req.query;
      let posts;
  
      // Check if a community name was provided in the query
      if (community) {
        posts = await Post.find({ community }).populate('author');
      } else {
        // If no community name provided, retrieve all posts
        posts = await Post.find().populate('author');
      }
  
      // Render the posts page with the filtered or all posts
      res.render('posts/results', { posts }); // Remove the leading slash before "posts/results"
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
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

router.put('/:id/upvote', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { upvote } = req.body;
    const isPopular = req.query.popular === 'true'; // Check for the 'popular' query parameter
  
    // Parse values as integers
    const parsedUpvote = parseInt(upvote) + 1;
  
    // Use findByIdAndUpdate to update the values in the database
    await Post.findByIdAndUpdate(id, { upvote: parsedUpvote });
  
    // Check if the URL does not contain '/popular'
    if (isPopular) {
        res.redirect('/posts/popular');
      } else {
        res.redirect('/posts');
      }
  }));

  
  
  
router.put('/:id/downvote', isLoggedIn, catchAsync(async (req, res) => {
  const { id } = req.params;
  const { downvote } = req.body;
  const isPopular = req.query.popular === 'true'; // Check for the 'popular' query parameter

  // Parse values as integers
  const parsedDownvote = parseInt(downvote) + 1;

  // Use findByIdAndUpdate to update the values in the database
  await Post.findByIdAndUpdate(id, { downvote: parsedDownvote });

  // Check if it's coming from the '/popular' page
  if (isPopular) {
    res.redirect('/posts/popular');
  } else {
    res.redirect('/posts');
  }
}));

  
  
  



router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted post')
    res.redirect('/posts');
}));



  

  
  

  


module.exports = router;