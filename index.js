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
    wordSchema.find({_userId: mongo.Types.ObjectId(req.query._id)}, (err, words) => {
        res.send(words)
    })
})

app.post('/login', (req, res) => {
    userSchema.findOne({
        $or: [{'email': caseInsensitive(req.body.log)}, {'username': caseInsensitive(req.body.log)}],
        password: req.body.password
    }, (err, user) => {
        console.log(user)
        if(user) {
            res.send(user)
        } else {
            res.send(null)
        }
    })
})

app.post('/register', (req, res) => {
    userSchema.insertMany([new userSchema({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })])
    res.send('OK')
})

app.post('/disconnect', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

function caseInsensitive(str) {
    return new RegExp(['^', str, '$'].join(''), 'i');   
}

// Port to listen to
app.listen(80)
