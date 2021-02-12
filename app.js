const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    mongoose.set('debug', true);

    const app = express();

    app.engine('.hbs', exphbs({ extname: '.hbs' }));
    app.set('view engine', '.hbs');

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
      res.render('home', { title: 'Blog | Home', description: 'Lorem Ipsum' });
    });

    app.use(authRoutes);

    app.use((req, res) => {
      res.status(404).render('errors/404', { title: 'Page not found' });
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
})();
