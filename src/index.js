const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const path = require('path')
const { createSocket } = require('dgram')
const Filter  = require('bad-words')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const {generateMessage} = require('../src/utils/messages')
const port = process.env.PORT || 3000
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))
let count = 0;

io.on('connection', (socket)=>{
    console.log('New Connection.')

    socket.on('join', ({username, room}, callback)=>{
        const {error, user} = addUser({id:socket.id, username:username, room:room})
        if (error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('welcome-message', generateMessage("Admin", `WELCOME ${user.username.toUpperCase()}!`))
        socket.emit('message', generateMessage("Admin", `Welcome ${user.username}!`))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`))
        console.log(user.room + ":::=>" + getUsersInRoom(user.room))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('message', (message, callback)=>{
        const user = getUser(socket.id);
        console.log("User "+JSON.stringify(user))
        console.log('Message received at server ' + message)
        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback('Message not delivered. Profanity not allowed.')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('delivered.')
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if (user){
            io.to(user.room).emit('message',generateMessage("Admin",`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })        
    
        }
    })

    socket.on('sendLocation', (location, callback)=>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://maps.google.com?q=${location.latitude},${location.longitude}`))
        callback('Location shared')
    })
    
})



server.listen(port, ()=>{
    console.log('App listening on port ' + port)    
})