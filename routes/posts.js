const express = require('express');

const router = express.Router();

const moment = require('moment');

const post = require('../models/post');

const middleware = require('../middleware');

const { isLoggedIn, checkUserpost } = middleware; // destructuring assignment

const start = moment().startOf('day'); // set to 12:00 am today

const end = moment().endOf('day'); // set to 23:59 pm today

// show all posts inside specific category
router.get('/', isLoggedIn, (req, res) => {
// Get all posts from DB
  post.find({ createdAt: { $gte: start, $lt: end } }, (err, allposts) => {
    if (err) {
      req.flash('error', err.message);
    } else {
      res.render('posts/post_all', { posts: allposts });
    }
  });
});
// CREATE - add new post to DB
router.post('/', isLoggedIn, (req, res) => {
// get data from form and add to posts array
  const work = req.body.work;
  const description = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username,
  };
  const createdAt = req.body.date;
  const newpost = {
    work: work,
    description: description,
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
router.get('/new', isLoggedIn, (req, res) => {
  res.render('posts/post_new');
});

// SHOW - shows more info about one post
router.get('/:id', (req, res) => {
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
router.get('/:id/edit', isLoggedIn, checkUserpost, (req, res) => {
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
router.put('/:id', isLoggedIn, checkUserpost, (req, res) => {
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

router.delete('/:id', isLoggedIn, checkUserpost, (req, res) => {
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
