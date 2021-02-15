const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const helmet = require('helmet');
const compression = require('compression');
const csrf = require('csurf');
const flash = require('connect-flash');
const morgan = require('morgan');
const chalk = require('chalk');
const dotenv = require('dotenv');

const blogRoutes = require('./routes');
const authRoutes = require('./routes/auth');
const { feather } = require('./helpers/hbs');

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    isDevelopment ? mongoose.set('debug', true) : null;

    const app = express();
    const csrfProtection = csrf();
    const store = new MongoDBStore({
      uri: process.env.MONGO_URI,
      collection: 'sessions',
    });

    app.use(express.urlencoded({ extended: false }));
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store,
      })
    );

    app.use(csrfProtection);
    app.use(flash());
    app.use(helmet());
    app.use(compression());
    isDevelopment ? app.use(morgan('dev')) : null;

    app.engine('.hbs', exphbs({ extname: '.hbs', helpers: { feather } }));
    app.set('view engine', '.hbs');

    app.use(express.static(path.join(__dirname, 'public')));
    app.use(
      express.static(path.join(__dirname, 'node_modules', 'feather-icons'))
    );

    app.use((req, res, next) => {
      res.locals.isLogged = req.session.isLogged;
      res.locals.csrfToken = req.csrfToken();
      res.locals.errorMessage = req.flash('error');
      res.locals.successMessage = req.flash('success');
      next();
    });

    app.use(blogRoutes);
    app.use(authRoutes);

    /* Not found error */
    app.use((req, res, next) => {
      const error = new Error('Page not found.');
      res.status(404).render('error/404', {
        title: 'Page not found',
        error: isDevelopment ? error.stack : '',
      });
    });

    /* Global error handler */
    app.use((error, req, res, next) => {
      res.status(error.status).render('error/500', {
        title: error.message,
        message: isDevelopment ? error.message : 'Ops...Something went wrong.',
        error: isDevelopment ? error.stack : 'We are working on it!',
      });
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(
        chalk.cyan.bold(
          `Server started in ${process.env.NODE_ENV} mode on port ${PORT}`
        )
      );
    });
  } catch (error) {
    console.log(chalk.red(error));
    process.exit(1);
  }
})();
