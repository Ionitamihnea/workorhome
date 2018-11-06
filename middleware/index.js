const post = require('../models/post');

module.exports = {
  isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'You must be signed in to do that!');
    res.redirect('/login');
  },
  checkUserpost(req, res, next) {
    post.findById(req.params.id, (err, foundpost) => {
      if (err || !foundpost) {
        req.flash('error', 'Sorry, that post does not exist!');
        res.redirect('/posts');
      } else if (foundpost.author.id.equals(req.user._id)) {
        req.post = foundpost;
        next();
      } else {
        req.flash('error', 'You don\'t have permission to do that!');
        res.redirect(`/posts/${req.params.id}`);
      }
    });
  },
};
