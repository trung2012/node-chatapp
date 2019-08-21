const generateMessage = (text) => {
  return {
    text,
    createdAt: new Date().getTime()
  }
}

const generateLocationMessage = (url) => {
  return {
    url: url ? url : 'Unknown',
    createdAt: new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
};