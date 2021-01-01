const users = []

addUser = ({id, username, room})=>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if (!username || !room){
        return {
            error: 'Username and Room are required.'
        }
    }
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if (existingUser){
        return {
            error: 'User already present in this room.'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {user}
}

removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if (index !== -1){
        return users.splice(index, 1)[0]
    }
}

getUser = (id)=>{
    return users.filter( user => user.id === id)[0]
    
}

getUsersInRoom = (room)=>{
    console.log(users)
    return users.filter(user=>{
        return user.room === room
    })
}


module.exports = {addUser, removeUser, getUser, getUsersInRoom}