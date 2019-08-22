const socket = io();

// elements

const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
  // New message element
  const newMessage = messages.lastElementChild

  //Height of the new message
  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin

  //Visible height
  const visibleHeight = messages.offsetHeight

  // Height of messages container
  const containerHeight = messages.scrollHeight

  //How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight
  }
}

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A')
  });
  messages.insertAdjacentHTML('beforeend', html)
  autoScroll();
})

socket.on('locationMessage', (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format('h:mm A')
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoScroll();
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  messageFormButton.setAttribute('disabled', 'disabled')

  const messageToSend = event.target.elements.message.value
  socket.emit('sendMessage', messageToSend, (err) => {
    messageFormButton.removeAttribute('disabled')
    messageFormInput.value = ''
    messageFormInput.focus();

    if (err) {
      return console.log(err)
    }

    console.log('The message was delivered!')
  })
})

socket.on('roomData', ({ room, users }) => {
  console.log(room)
  console.log(users)
})

sendLocationButton.addEventListener('click', () => {
  sendLocationButton.setAttribute('disabled', 'disabled')

  if (!navigator.geolocation) {
    return alert('Geolocation is not suppported by your browser')
  }

  navigator.geolocation.getCurrentPosition(({ coords }) => {

    socket.emit('sendLocation', {
      latitude: coords.latitude,
      longitude: coords.longitude
    }
      , () => {
        sendLocationButton.removeAttribute('disabled')
        console.log('Location shared!')
      })
  })
})

socket.emit('join', { username, room }, (err) => {
  if (err) {
    alert(err)
    location.href = '/'
  }
})