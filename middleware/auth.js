module.exports = {
  isGuest: (req, res, next) => {
    if (!req.session.isLogged) {
      return next();
    }
    res.redirect('/');
  },
  isAuth: (req, res, next) => {
    if (req.session.isLogged) {
      return next();
    }
    res.redirect('/');
  },
};
