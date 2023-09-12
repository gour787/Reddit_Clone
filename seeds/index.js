const mongoose = require('mongoose');
const Post = require('../models/post');

mongoose.connect('mongodb://127.0.0.1:27017/reddit-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



const seedDB = async () => {
    // Remove any existing entries in the "posts" collection
    await Post.deleteMany({});
    
    for (let i = 0; i < 5; i++) {
        const post = new Post({
            title: `Title ${i + 1}`,
            author: `author ${i + 1}`,
            image: 'https://source.unsplash.com/collection/483251',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            community: 'r/funny',
            upvote: Math.floor(Math.random() * 100), // random number
            downvote: Math.floor(Math.random() * 100) // random number
        });

        await post.save();
    }
}


seedDB().then(() => {
    mongoose.connection.close();
});