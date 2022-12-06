const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const passport = require("passport");
const Post = require('../models/post');

/* GET home page. */
router.get('/', 
  function (req, res, next) {
  Post.find().sort([['created', -1]]).populate('createdBy').exec((err, allPosts) => {
    if (err) {
      next(err)
    }
    res.render('index', { title: 'Messages', posts: allPosts,  user: res.locals.currentUser });
  })

});
router.post('/', 
  (req, res, next) => {
      const delPost = req.body.delPost
      console.log(delPost)
      Post.findByIdAndDelete(delPost).exec((err, deletedPost)=> {
        Post.find().sort([['created', -1]]).populate('createdBy').exec((error, allPosts) => {
          if (error) {
            next(error)
          }
        if (err) {
          res.render('index', { title: 'Messages', posts: allPosts, error: "cannot delete Post", user: res.locals.currentUser });
          return 
        }
        res.render('index', { title: 'Messages', posts: allPosts,  user: res.locals.currentUser });  
    })})
  }
)
router.get('/sign-up', function(req, res, next) {
  res.render('sign-up', {title: 'sign up'})
});
router.post(
  '/sign-up', 
  body('username', 'Username is required').trim().isLength({min:1}).escape(), 
  body('password', 'Password is required').trim().isLength({min:1}).escape(),
  body('confPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('sign-up', {title: 'Sign-up', errors: errors.errors})
      return 
    }
    User.find({ 'username': req.body.username}).exec(function(err, existingUser){
      if (err) {
        return next(err)
      }
      if (existingUser.length > 0) {
        console.log(existingUser)
        res.render('sign-up', {
          title: 'Sign-up',
          error: ` Username: - ${req.body.username} - already exists in the system. Please choose another username`
        })
        return
      }
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {
          return next(err)
        }
        const user = new User({
          username: req.body.username.toLowerCase(),
          password: hashedPassword
        }).save(err=> {
          if (err) {
            return next(err);
          }
          res.redirect("/")
        })
      })  
    })
  }
)

router.get('/sign-in', function(req, res, next) {
  res.render('sign-in', {title: 'Sign-in'})
})
router.post(
  "/sign-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/sign-in",
    // failureFlash: true
  })
);

router.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get('/join-club', function(req, res, next) {
  res.render('join-club', {title: 'Join the Club', user: res.locals.currentUser})
})

router.post('/join-club', 
  body('passcode').custom((value, { req }) => {
    if (value !== '666') {
      throw new Error('Incorrect Passcode');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('join-club', {title: 'Sign-up', errors: errors.errors, user: res.locals.currentUser})
      return 
    }
    User.findOneAndUpdate(
      { username: res.locals.currentUser.username },
      { member: true },
      ).exec((err,user)=> {
        if (err) {
          return next(err)
        }
        console.log(user)
        res.redirect("/")
      }
      
    )
  }
)

router.get('/become-admin', function(req, res, next) {
  res.render('become-admin', {title: 'Become an admin', user: res.locals.currentUser})
})

router.post('/become-admin', 
  body('passcode').custom((value, { req }) => {
    if (value !== '555') {
      throw new Error('Incorrect Passcode');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('become-admin', {title: 'Become an admin', errors: errors.errors, user: res.locals.currentUser})
      return 
    }
    User.findOneAndUpdate(
      { username: res.locals.currentUser.username },
      { admin: true },
      ).exec((err,user)=> {
        if (err) {
          return next(err)
        }
        console.log(user)
        res.redirect("/")
      }
      
    )
  }
)


router.get('/new-msg', (req, res) => {
  res.render('new-msg', {title: 'Create new messages', user: res.locals.currentUser})
})

router.post('/new-msg', 
  body('title', 'Title is required').trim().isLength({min:1}).escape(),
  body('message', 'Minimum of 10 Character needs to be reached').trim().isLength({min:10}).escape(),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('new-msg', {title: 'Create new messages', user: res.locals.currentUser, errors: errors.errors})
        return
      }
      const msg = new Post({
        title: req.body.title,
        created: new Date(),
        text: req.body.message,
        createdBy: res.locals.currentUser
      }).save( err => {
        if (err) {
          return next(err);
        }
        res.redirect("/")
      })
    }
)

module.exports = router;
