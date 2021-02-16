const router = require('express').Router();

const { isAuth } = require('../middleware/auth');
const Article = require('../models/Article');

router.get('/create', isAuth, (req, res) => {
  res.render('articles/create', {
    title: 'Create an article',
    description: 'Lorem Ipsum',
  });
});

router.post('/save', isAuth, async (req, res) => {
  const { title, body } = req.body;
  try {
    const article = new Article({ title, body, author: req.session.user._id });
    await article.save();
    res.redirect('/');
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
