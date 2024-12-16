import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'

const getUsername = async () => {
  const username = localStorage.getItem('username')
  if (username) {
    console.log(`User existed ${username}`)
    return username
  }

  const res = await fetch('https://random-data-api.com/api/users/random_user')
  const { username: randomUsername } = await res.json()

  localStorage.setItem('username', randomUsername)
  return randomUsername
}
const socket = io({
  auth: {
    username: await getUsername(),
    serverOffset: 0
  }
})

const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages')

//Color generator by hashing username
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
      const value = ((hash >> (i * 8)) & 0xFF) % 128 + 128;
      color += ('00' + value.toString(16)).slice(-2);
  }

  return color;
}

socket.on('chat message', (msg, username) =>{
  const item = `<li ${socket.auth.username == username?'class="own-message"':'class="recived-message"'}>
  <small style="color: ${stringToColor(username)};">${username}:</small>
  <p>${msg}</p> 
  </li>`
  messages.insertAdjacentHTML('beforeend', item)
  messages.scrollTop = messages.scrollHeight
})

form.addEventListener('submit', (e) =>{
    e.preventDefault()

    if(input.value){
        socket.emit('chat message', input.value)
        input.value = ''
    }
})