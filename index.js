// Depencies
let express = require('express')
let bodyParser = require('body-parser')
let mongo = require('mongoose')
let cors = require('cors')

// Config
let app = express()
let schema = mongo.Schema
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
mongo.connect('mongodb://localhost:27017/Wordbase', { useMongoClient: true })
mongo.Promise = global.Promise

// MongoDB models
let wordSchema = mongo.model('words', new schema({
    title: String,
    color: String,
    _userId: schema.Types.ObjectId,
    datas: []
}))

let userSchema = mongo.model('users', new schema({
    username: String,
    email: String,
    password: String
})) 

// Functions

// "/" ROUT IS ONLY FOR TESTS
app.get('/', (req, res) => {
    let user = User(req)
    res.send(
        `<h1>${user ? user.username : ''}</h1>
        <form action="/insert" method="post">
            <input type"text" name="title" placeholder="Title"/>
            <input type"text" name="color" placeholder="Color"/>
            <input type"text" name="value" placeholder="value"/>
            <button type="submit">Submit</button>
        </form>
        <form action="log" method="post">
            <input type"text" name="username" placeholder="Username"/>
            <input type"password" name="password" placeholder="Password"/>
            <button type="submit">Connect</button>
        </form>
        <form action="/register" method="post">
            <input type"text" name="username" placeholder="Username"/>
            <input type"email" name="email" placeholder="Email"/>
            <input type"password" name="password" placeholder="Password"/>
            <input type"password" name="confirm" placeholder="Confirm"/>
            <button type="submit">Register</button>
        </form>
        <form action="/disconnect" method="post">
            <button type="submit">Disconnect</button>
        </form>`)
})

app.post('/insert', (req, res) => {
    //let userid = User(req)._id
    wordSchema.insertMany([new wordSchema({
        title: req.body.title,
        color: req.body.color,
        _userId: req.body._userId,
        datas: req.body.datas   
    })])
    res.send('OK')
})

app.post('/delete', (req, res) => {
    wordSchema.remove({_id: req.body._id}, () => {})
    res.send('OK')
})

app.get('/get', (req, res) => {
    wordSchema.find({}, (err, words) => {
        res.send(words)
    })
    /*wordSchema.find({user_id: User(req)._id}, (err, words) => {
        res.send(words)
    })*/
})

app.post('/log', (req, res) => {
    userSchema.findOne({
        username: req.body.username,
        password: req.body.password
    }, (err, user) => {
        if(user) {
            User(req, user)
        } else {
            res.send('You are not connected')
        }
        res.redirect('/')
    })
})

app.post('/register', (req, res) => {
    userSchema.insertMany([new userSchema({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })])
    res.send(req.body)
})

app.post('/disconnect', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

function User(req, set = false) {
    if(set) {
        req.session.user = set
    }
    return req.session.user
}

// Port to listen to
app.listen(80)
