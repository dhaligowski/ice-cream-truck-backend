// import { WebSocketServer } from "ws";
const { WebSocketServer } = require("ws");
// const WebSocket = require("ws");
const wss = new WebSocketServer({ port: 3000 });

let currentLocation = {};
wss.on("connection", (ws) => {
  // console.log("connection open, sending location", currentLocation);
  ws.send(JSON.stringify(currentLocation));
  // console.log("clients", wss.clients);
  ws.on("message", (message) => {
    currentLocation = JSON.parse(message);
    // console.log("message received:", currentLocation);
    // console.log("Sending message back");
    // ws.send(JSON.stringify(data));
    wss.broadcast(JSON.parse(message));
    // let msg=JSON.parse(message);
    // wss.clients.forEach((client) => client.send(message));
  });

  // ws.send("something");
});

wss.broadcast = (msg) => {
  // console.log(msg);
  wss.clients.forEach((client) => {
    // if (client !== ws && client.readyState === WebSocket.OPEN)
    client.send(JSON.stringify(msg));
  });
};
