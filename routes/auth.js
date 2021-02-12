const router = require('express').Router();

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Blog | Login',
    description: 'Lorem Ipsum',
  });
});

module.exports = router;
