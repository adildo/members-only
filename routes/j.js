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
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('sign-up', {title: 'Sign-up', errors: errors.errors})
        return 
      }
      try {
        // Check if username already exists
        const existingUser = await User.find({ 'username': req.body.username});
        if (existingUser.length > 0) {
          console.log(existingUser)
          res.render('sign-up', {
            title: 'Sign-up',
            error: ` Username: - ${req.body.username} - already exists in the system. Please choose another username`
          })
          return
        }
  
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Create a new user
        const user = new User({
          username: req.body.username.toLowerCase(),
          password: hashedPassword
        });
        // Save the user
        await user.save();
        // Redirect to homepage
        res.redirect("/")
      } catch (err) {
        return next(err);
      }
    }
  )