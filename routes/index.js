const router = require('express').Router();

const Article = require('../models/Article');

router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({});
    console.log({ articles });
    res.render('home', {
      title: 'Home',
      description: 'Lorem Ipsum',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
