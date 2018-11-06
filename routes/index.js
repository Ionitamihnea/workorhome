const express = require('express');

const moment = require('moment');

const nodemailer = require('nodemailer');

const router = express.Router();

const passport = require('passport');

const User = require('../models/user');

// index route

router.get('/', (req, res) => {
  res.render('index', { currentUser: req.user, data: moment().format('MMMM Do YYYY, h:mm:ss a') });
});

// show register form
router.get('/register', (req, res) => {
  res.render('index/register', { errors: req.session.errors });
});

//  handle sign up logic
router.post('/register', (req, res) => {
  req.check('username', 'Username must contain between 3 and 20 letters and numbers.').isAlphanumeric().notEmpty().isLength({ min: 3, max: 20 });
  req.check('password', 'Password must be at least 6 characters long.').notEmpty().isLength({ min: 6 });
  const errors = req.validationErrors();
  if (errors) {
    res.render('index/register', {
      errors: errors,
    });
  } else {
    User.register(new User({ username: req.body.username }), req.body.password, (err) => {
      if (err) {
        req.flash('error', `${err.message}`);
        res.render('index/register', { errors: errors });
      }
      passport.authenticate('local')(req, res, () => {
        req.flash('success', `Successfully signed up! Nice to meet you ${req.body.username}`);
        res.redirect('/');
      });
    });
  }
});

//  show login form
router.get('/login', (req, res) => {
  res.render('index/login', { page: 'login' });
});

//  handling login logic
router.post('/login', passport.authenticate('local',
  {
    successRedirect: '/posts/new',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Welcome to Work or Home!',
  }), () => {
});

// logout route
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'See you later!');
  res.redirect('back');
});

// index route

router.get('/', (req, res) => {
  res.render('index', { currentUser: req.user });
});

// contact page

router.get('/contact', (req, res) => {
  res.render('index/contact');
});

router.post('/contact/send', (req, res) => {
  const output = `
  <h1>You have a new contact request</h1>
  <h3>Contact Details</h3>
  <ul>
    <li>Name: ${req.body.name}</li>
    <li>Email: ${req.body.email}</li>
  </ul>
  <h3>Message</h3>
  <p>${req.body.message}</p>
  `;
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  nodemailer.createTestAccount(() => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'k4nsyiavbcbmtcxx@ethereal.email',
        pass: 'Mx2qnJcNKM5mp4nrG3',
      },
    });

    // setup email data with unicode symbols
    const mailOptions = {
      from: "'Work or Home' <k4nsyiavbcbmtcxx@ethereal.email>", // sender address
      to: 'ionitamihnea97@gmail.com', // list of receivers
      subject: 'Work or Home - Contact Request', // Subject line
      html: output, // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        req.flash('error', `${error.message}`);
        res.render('back', { error: error.message });
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      req.flash('success', 'Successfully sent a mail! I will get back to you as soon as possible!');
      res.redirect('/contact');
    });
  });
});

module.exports = router;
