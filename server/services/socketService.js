const redisClient = require('../modules/redisClient');
const TIMEOUT_IN_SECONDS = 3600;

module.exports = io => {

  let collaborations = [];
  let socketIdToSessionId = [];

  io.on('connection', socket => {
    let sessionId = socket.handshake.query['sessionId'];
    socketIdToSessionId[socket.id] = sessionId;

    if (!(sessionId in collaborations)) {
      collaborations[sessionId] = {
        'participants': []
      }
    }
    collaborations[sessionId]['participants'].push(socket.id);
    socket.on('change', delta => {
      console.log('change ' + socketIdToSessionId[socket.id] + " " + delta);
      forwardEvents(socket.id, 'change', delta);
    });
    socket.on('cursorMove', cursor => {
      console.log('cursorMove ' + socketIdToSessionId[socket.id] + " " + cursor);
      cursor = JSON.parse(cursor);
      cursor['socketId'] = socket.id;
      forwardEvents(socket.id, 'cursorMove', JSON.stringify(cursor));
    });    
  });

  function forwardEvents(socketId, eventName, datastring) {
    let sessionId = socketIdToSessionId[socketId];
    if (sessionId in collaborations) {
      let participants = collaborations[sessionId]['participants'];
      for (let i = 0; i < participants.length; i++) {
        if (socketId != participants[i]) {
          io.to(participants[i]).emit(eventName, datastring);
        }
      }
    } else {
      console.log("WARNING: Could not tie socket_id to any collaboration");
    }
  }
}