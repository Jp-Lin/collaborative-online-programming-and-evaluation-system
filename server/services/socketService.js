const redisClient = require('../modules/redisClient');
const TIMEOUT_IN_SECONDS = 3600;

const sessionPatch = '/temp_session/'

module.exports = io => {

  let collaborations = [];
  let socketIdToSessionId = [];

  io.on('connection', socket => {
    let sessionId = socket.handshake.query['sessionId'];
    socketIdToSessionId[socket.id] = sessionId;

    if (sessionId in collaborations) {
      collaborations[sessionId]['participants'].push(socket.id);
    } else {
      redisClient.get(sessionPatch + sessionId, data => {
        if (data) {
          console.log('Session terminated previously; pulling back from Redis.');
          collaborations[sessionId] = {
            'cacheChangeEvents': JSON.parse(data),
            'participants': []
          };
        } else {
          console.log('Creating new session.');
          collaborations[sessionId] = {
            'cacheChangeEvents': [],
            'participants': []
          };
        }
        collaborations[sessionId]['participants'].push(socket.id);
      });
    }

    // if (!(sessionId in collaborations)) {
    //   collaborations[sessionId] = {
    //     'participants': []
    //   }
    // }
    // collaborations[sessionId]['participants'].push(socket.id);

    socket.on('change', delta => {
      console.log('change ' + socketIdToSessionId[socket.id] + " " + delta);
      let sessionId = socketIdToSessionId[socket.id];
      if (sessionId in collaborations) {
        collaborations[sessionId]['cacheChangeEvents'].push(['change', delta, Date.now()]);
      }
      forwardEvents(socket.id, 'change', delta);
    });

    socket.on('cursorMove', cursor => {
      console.log('cursorMove ' + socketIdToSessionId[socket.id] + " " + cursor);
      cursor = JSON.parse(cursor);
      cursor['socketId'] = socket.id;
      forwardEvents(socket.id, 'cursorMove', JSON.stringify(cursor));
    });

    socket.on('restoreBuffer', () => {
      let sessionId = socketIdToSessionId[socket.id];
      console.log('restroing buffer for session: ' + sessionId + ', socket: ' + socket.id);
      if (sessionId in collaborations) {
        let changeEvents = collaborations[sessionId]['cacheChangeEvents'];
        for (let i = 0; i < changeEvents.length; i++) {
          socket.emit(changeEvents[i][0], changeEvents[i][1]);
        }
      }
    });
    
    socket.on('disconnect', () => {
      let sessionId = socketIdToSessionId[socket.id];
      console.log('socket ' + socket.id + ' disconnected.');

      if (sessionId in collaborations) {
        let participants = collaborations[sessionId]['participants'];
        let index = participants.indexOf(socket.id);
        if (index >= 0) {
          socket.broadcast.emit('cursorDelete', socket.id);
          participants.splice(index, 1);
          if (participants.length == 0) {
            console.log('last participant left; storing in Redis.');
            let key = sessionPatch + sessionId;
            let value = JSON.stringify(collaborations[sessionId]['cacheChangeEvents']);
            redisClient.set(key, value, redisClient.redisPrint);
            redisClient.expire(key, TIMEOUT_IN_SECONDS);
            delete collaborations[sessionId];
          }
        }
      } else {
        console.log("WARNING: Could not find socket_id in any collaboration");
      }
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