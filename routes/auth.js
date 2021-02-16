const crypto = require('crypto');

const router = require('express').Router();

const User = require('../models/User');
const { isGuest } = require('../middleware/auth');
const throwError = require('../utils/throwError');
const { signupValidator, loginValidator } = require('../validators/auth');

router.get('/signup', isGuest, (req, res) => {
  console.log('FLASH', req.flash());
  res.render('auth/signup', {
    title: 'Signup',
    description: 'Lorem Ipsum',
  });
});

router.post('/signup', async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const { error } = signupValidator.validate(
      { email, password, username },
      { abortEarly: true, errors: { wrap: { label: '' } } }
    );

    if (error) {
      //TODO:find best solution
      req.flash('error', error.message);
      return res.status(422).render('auth/signup', {
        title: 'Signup',
        description: 'Lorem Ipsum',
        errorMessage: error.message,
      });
    }

    /* Check if email already exist */
    const exist = await User.findOne({ email });
    if (exist) {
      req.flash('error', 'Incorrect email or password.Please retry.');
      return res.redirect('/signup');
    }

    /* Create new user */
    const user = new User({
      username,
      email,
      password,
    });
    await user.save();
    res.redirect('/');
  } catch (error) {
    console.log(error);
    const err = throwError(error);
    return next(err);
  }
});

router.get('/login', isGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    description: 'Lorem Ipsum',
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { error } = loginValidator.validate(
      { email, password },
      { abortEarly: true, errors: { wrap: { label: '' } } }
    );

    if (error) {
      //TODO:find best solution
      req.flash('error', error.message);
      return res.status(422).render('auth/login', {
        title: 'Login',
        description: 'Lorem Ipsum',
        errorMessage: error.message,
      });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      req.flash('error', 'Invalid email or password.Please retry!');
      return res.redirect('/login');
    }

    req.session.isLogged = true;
    req.session.user = user;
    await req.session.save();
    req.flash('success', 'You are logged in.');
    res.redirect('/');
  } catch (error) {
    const err = throwError(error);
    return next(err);
  }
});

router.post('/logout', async (req, res) => {
  await req.session.destroy();
  res.redirect('/login');
});

router.get('/reset', isGuest, (req, res) => {
  res.render('auth/resetPassword', {
    title: 'Password Reset',
    description: 'Lorem Ipsum',
  });
});

router.post('/reset', isGuest, async (req, res) => {
  const { email } = req.body;

  try {
    const token = await crypto.randomBytes(32).toString('hex');
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'No account with that email found.');
      return res.redirect('/reset');
    }
    user.resetToken = token;
    user.tokenExpirationDate = Date.now() + 3600000;
    await user.save();
    // TODO:send email here with token in url
    req.flash(
      'success',
      `Check your email at ${user.email} for change password!`
    );
    res.redirect('/login');
  } catch (error) {
    const err = throwError(error);
    return next(err);
  }
});

router.get('/new-password', isGuest, async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpirationDate: { $gt: Date.now() },
    });
    if (!user) {
    }
    res.render('auth/changePassword', {
      title: 'New Password',
      description: 'Lorem Ipsum',
      userId: user.id,
      token,
    });
  } catch (error) {
    const err = throwError(error);
    return next(err);
  }
});

router.post('/new-password', isGuest, async (req, res) => {
  const { user_id, password, token } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpirationDate: { $gt: Date.now() },
      _id: user_id,
    });
    if (!user) {
      req.flash('error', 'No user found.');
      return res.redirect('/new-password');
    }
    user.password = password;
    user.resetToken = undefined;
    user.tokenExpirationDate = undefined;
    await user.save();

    req.flash(
      'success',
      `Password change with success.You can now login with your new password.`
    );
    res.redirect('/login');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
