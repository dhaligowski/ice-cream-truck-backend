const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: process.env.PORT || 3000 });

let currentLocation = {};
let driver = false;
let driverSocket = {};
let socketCounter = 0;
const SOCKET_RESET_TIMER = 200;
const SEND_PING = 3000;

wss.on("connection", (ws) => {
  var id = setInterval(function () {
    ws.send(JSON.stringify(driver), function () {
      if (ws === driverSocket) socketCounter++;

      // console.log("socketCounter", socketCounter);

      if (socketCounter === SOCKET_RESET_TIMER) {
        ws.send(JSON.stringify(false));
        socketCounter = 0;
        driver = false;
        driverSocket = {};
        currentLocation = {};
        ws.close();
      }
    });
  }, SEND_PING);

  if (driver) ws.send(JSON.stringify(currentLocation));

  ws.on("message", (message) => {
    //driver check, can only have 1 logged in
    if (driver && ws !== driverSocket) ws.send(JSON.stringify(false));
    else {
      try {
        currentLocation = JSON.parse(message);

        if (!driver) {
          driverSocket = ws;
          driver = true;
        }

        wss.broadcast(JSON.parse(message));
      } catch (error) {
        console.log("an error occured...", error);
      }
    }
  });
  ws.on("close", function () {
    // console.log("websocket connection close");
    if (driverSocket === ws) {
      // console.log("driver is logging out");
      driver = false;
      driverSocket = {};
      currentLocation = {};
    }
    clearInterval(id);
  });
});

wss.broadcast = (msg) => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(msg));
  });
};
