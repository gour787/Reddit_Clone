const express = require('express');
const path = require('path');
const app = express();
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
const Post = require('./models/post');


app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsMate)
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));



mongoose.connect('mongodb://127.0.0.1:27017/reddit-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false

});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});




app.get('/', (req, res) => {
    res.send('home')
});


app.get('/posts', async (req, res) => {
    const posts = await Post.find({});
    res.render('posts/index', { posts });
});

app.get('/posts/new', (req, res) => {
    res.render('posts/new');
})

app.post('/posts', async (req, res) => {
    const post = new Post(req.body.post);
    await post.save();
    res.redirect(`/posts/${post._id}`);
});


app.get('/posts/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render('posts/show', { post });
});

app.get('/posts/:id/edit', async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render('posts/edit', { post });
});

app.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    res.redirect(`/posts/${post._id}`);
});

app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id); 
    res.redirect('/posts');
});

app.listen(3000, () => {
    console.log("APP listening on port 3000")
})