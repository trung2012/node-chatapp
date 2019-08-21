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

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A')
  });
  messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (location) => {
  const html = Mustache.render(locationTemplate, {
    url: location.url,
    createdAt: moment(location.createdAt).format('h:mm A')
  })
  messages.insertAdjacentHTML('beforeend', html)
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