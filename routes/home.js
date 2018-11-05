const express = require('express');

const post = require('../models/post');

const router = express.Router();

const middleware = require('../middleware');

const { isLoggedIn, checkUserpost } = middleware; // destructuring assignment

// show all categories
router.get('/', (req, res) => {
  // Get all categories from DB
  post.find({}, (err, allposts) => {
    if (err) {
      req.flash('error', err.message);
    } else {
      res.render('index/categories', { posts: allposts, page: 'categories' });
    }
  });
});

// show all posts inside specific category
router.get('/posts', (req, res) => {
// Get all posts from DB
  post.find({}, (err, allposts) => {
    if (err) {
      req.flash('error', err.message);
    } else {
      res.render('posts/post_all', { posts: allposts, page: 'posts' });
    }
  });
});
// CREATE - add new post to DB
router.post('/posts', isLoggedIn, (req, res) => {
// get data from form and add to posts array
  const work = req.body.work;
  const desc = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username,
  };
  const createdAt = Date.now;
  const newpost = {
    work: work,
    description: desc,
    author: author,
    createdAt: createdAt,
  };
    // Create a new post and save to DB
  post.create(newpost, (err) => {
    if (err) {
      req.flash('error', err.message);
    } else {
      req.flash('success', 'Successfully added a new post!');
      // redirect back to posts page
      res.redirect('/posts');
    }
  });
});

// NEW - show form to create new post
router.get('/posts/new', isLoggedIn, (req, res) => {
  res.render('posts/post_new');
});

// SHOW - shows more info about one post
router.get('/posts/:id', (req, res) => {
// find the post with provided ID
  post.findById(req.params.id).exec((err, foundpost) => {
    if (err || !foundpost) {
      req.flash('error', 'Sorry, that post does not exist!');
      return res.redirect('/posts');
    }
    // render show template with that post
    res.render('posts/post', { post: foundpost });
  });
});

// EDIT - shows edit form for a post
router.get('/posts/:id/edit', isLoggedIn, checkUserpost, (req, res) => {
  post.findById(req.params.id, (err, foundpost) => {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/posts');
    } else {
    // render edit template with that post
      res.render('posts/post_edit', { post: foundpost });
    }
  });
});

// PUT - updates post in the database
router.put('/posts/:id', isLoggedIn, checkUserpost, (req, res) => {
  post.findByIdAndUpdate(req.params.id, req.body.post, (err) => {
    if (err) {
      req.flash('error', 'Error editing post!');
      res.redirect('/posts');
    } else {
      req.flash('success', 'Successfully edited post!');
      res.redirect(`/posts/${post._id}`);
    }
  });
});

// DELETE - deletes post from database - don't forget to add "are you sure" on frontend

router.delete('/posts/:id', isLoggedIn, checkUserpost, (req, res) => {
  post.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/posts');
    } else {
      req.flash('success', 'Successfully deleted post!');
      res.redirect('/posts');
    }
  });
});

module.exports = router;
