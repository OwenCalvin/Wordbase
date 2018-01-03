// Depencies
const express = require('express')
const bodyParser = require('body-parser')
const mongo = require('mongoose')
const cors = require('cors')
const emailValidator = require('email-validator')
const bcrypt = require('bcrypt')

// Config
const app = express()
const schema = mongo.Schema
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
mongo.connect('mongodb://localhost:27017/Wordbase', { useMongoClient: true })
mongo.Promise = global.Promise

// MongoDB models
const wordSchema = mongo.model('words', new schema({
    title: String,
    color: String,
    fav: Boolean,
    _userId: schema.Types.ObjectId,
    datas: [
        {
            _dataId: schema.Types.ObjectId,
            name: String,
            value: String
        }
    ]
}))

const userSchema = mongo.model('users', new schema({
    username: String,
    email: String,
    password: String
})) 

app.get('/', (req, res) => {
    res.send('Hello World')
})

// Functions
app.post('/insert', (req, res) => {
    let title = req.body.title
    if(title.length > 0) {
        let datas = req.body.datas
        datas = datas.filter(obj => obj.name.length > 0 || obj.value.lenghth > 0)
        wordSchema.insertMany([new wordSchema({
            title: title,
            color: req.body.color,
            fav: false,
            _userId: req.body._userId,
            datas: datas   
        })], () => {
            res.send('OK')
        })
    }
})

app.post('/delete', (req, res) => {
    wordSchema.remove({_id: req.body._id}, () => {
        res.send('OK')
    })
})

app.get('/get', (req, res) => {
    wordSchema.find({_userId: mongo.Types.ObjectId(req.query._id)}, (err, words) => {
        res.send(words)
    })
})

app.post('/fav', (req, res) => {
    fav = req.body
    wordSchema.findByIdAndUpdate(
        fav._id, 
        {$set: {fav: !fav.fav}},
        {new: true}, 
        (err, word) => {
            res.send(word)
        }
    )
})

app.post('/login', (req, res) => {
    userSchema.findOne({
        $or: [
            {email: caseInsensitive(req.body.log)}, 
            {username: caseInsensitive(req.body.log)}
        ]
    }, (err, user) => {
        if(user) {
            bcrypt.compare(req.body.password, user.password, (err, match) => {
                if(match) {
                    messageCode(res, null, null, 'success', user)
                } else {
                    messageCode(res, 'password', 'invalid')
                }
            })
        } else {
            messageCode(res, 'user', 'inexistent')
        }
    })
})

app.post('/spliceData', (req, res) => {
    id = req.body.id
    splice = req.body.splice
    wordSchema.findByIdAndUpdate(
        id, 
        {$pull: {datas: {_id: splice}}},
        {new: true},
        (err, word) => {
            res.send(word)
        }
    )
})

app.post('/addData', (req, res) => {
    id = req.body.id
    data = req.body.data
    wordSchema.findByIdAndUpdate(
        id,
        {$push: {datas: data}},
        {new: true},
        (err, word) => {
            res.send(word)
        }
    )
})

app.post('/edit', (req, res) => {
    id = req.body.id
    update = req.body.update
    wordSchema.findByIdAndUpdate(
        id, 
        {$set: update},
        {new: true}, 
        (err, word) => {
            res.send(word)
        }
    )
})

app.post('/register', (req, res) => {
    let username = req.body.username
    let email = req.body.email
    let password = req.body.password
    let confirm = req.body.confirm

    userSchema.find({
        $or: [
            {username: req.body.username},
            {email: req.body.email}
        ]
    }, (err, exist) => {
        if(exist.length <= 0) {
            if(username.length >= 4) {
                if(emailValidator.validate(email)) {
                    if(password.length >= 4) {
                        if(password == confirm) {
                            bcrypt.hash(password, 10, (err, hash) => {
                                userSchema.insertMany([new userSchema({
                                    username: req.body.username,
                                    email: req.body.email,
                                    password: hash
                                })])
                                messageCode(res, null, null, 'success')
                            })
                        } else {
                            messageCode(res, 'password', 'different')
                        }
                    } else {
                        messageCode(res, 'password', 'short')
                    }
                } else {
                    messageCode(res, 'email', 'invalid')
                }
            } else {
                messageCode(res, 'username', 'short')
            }
        } else {
            messageCode(res, 'user', 'exist')
        }
    })
})

function caseInsensitive(str) {
    return new RegExp(['^', str, '$'].join(''), 'i')
}

function messageCode(res, what = null, why = null, code = 'error', data = null) {
    res.send({
        code: code,
        what: what,
        why: why,
        data: data
    })
}

// Port to listen to
app.listen(4000)
 