const router = require('express').Router();

const Article = require('../models/Article');

router.get('/', async (req, res, next) => {
  try {
    const articles = await Article.find({}).populate('author').lean();
    res.render('home', {
      title: 'Home',
      description: 'Lorem Ipsum',
      articles: articles,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
