const express = require('express');
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/reddit-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.get('/', (req, res) => {
    res.send('home')
});

app.listen(3000, () => {
    console.log("APP listening on port 3000")
})