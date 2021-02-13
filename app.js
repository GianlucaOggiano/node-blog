const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const chalk = require('chalk');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const { feather } = require('./helpers/hbs');

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';
console.log('NODE_ENV', isDevelopment);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    isDevelopment ? mongoose.set('debug', true) : null;

    const app = express();

    app.use(helmet());
    app.use(compression());
    isDevelopment ? app.use(morgan('dev')) : null;

    app.engine('.hbs', exphbs({ extname: '.hbs', helpers: { feather } }));
    app.set('view engine', '.hbs');

    app.use(express.static(path.join(__dirname, 'public')));
    app.use(
      express.static(path.join(__dirname, 'node_modules', 'feather-icons'))
    );

    app.get('/', (req, res) => {
      res.render('home', { title: 'Blog | Home', description: 'Lorem Ipsum' });
    });

    app.use(authRoutes);

    /* Not found error */
    app.use((req, res, next) => {
      const error = new Error('Page not found.');
      error.status = 404;
      next(error);
    });

    /* Global error handler */
    app.use((error, req, res, next) => {
      const statusCode = error.status === 200 ? 500 : error.status;
      res.status(statusCode).render('error', {
        title: error.message,
        message: error.message,
        error: isDevelopment ? error.stack : '',
      });
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.clear();
      console.log(
        chalk.cyan.bold(
          `Server started in ${process.env.NODE_ENV} mode on port ${PORT}`
        )
      );
    });
  } catch (error) {
    console.log(chalk.red(error));
  }
})();
