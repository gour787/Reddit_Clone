require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const PORT = 3000;

const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const dbURL = process.env.DB_URL;
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET_KEY;

const store = new MongoDBStore({
    uri: dbURL, 
    collection: 'sessions', 
    expires: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  const sessionConfig = {
    name: 'session',
    secret: secret, // Your secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: store, // Use the MongoDB store
  };
app.use(session(sessionConfig))
app.use(flash());




app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/', userRoutes)
app.use('/posts', postRoutes)
app.use('/posts/:id/comments', commentRoutes)



app.get('/home', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    res.status(statusCode).render('error', { countdown: 4 });
});


const start = async() => {
    try{
        await mongoose.connect(dbURL);
        app.listen(PORT, () => {
            console.log(`Serving on port ${PORT}`)
            
        })
    } catch(err ) {
        console.log(err.message)

    }


}
start();
