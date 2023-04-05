const { WebSocketServer } = require('ws');
const uuid = require('uuid');

class PeerProxy {
    constructor(httpServer) {
        // Create a websocket object
        const wss = new WebSocketServer({ noServer: true });

        // Handle the protocol upgrade from HTTP to WebSocket
        httpServer.on('upgrade', (request, socket, head) => {
            wss.handleUpgrade(request, socket, head, function done(ws) {
                wss.emit('connection', ws, request);
            });
        });

        // Keep track of all the connections so we can forward messages
        let connections = {};

        wss.on('connection', (ws, request) => {
            const url = request.url;
            if (!connections[url]) {
                connections[url] = [];
            }
            let currConnections = connections[url];
            const connection = { id: uuid.v4(), alive: true, ws: ws };
            currConnections.push(connection);

            // Forward messages to everyone except the sender
            ws.on('message', function message(data) {
                let currConnections = connections[url];
                currConnections.forEach((c) => {
                    if (c.id !== connection.id) {
                        c.ws.send(data);
                    }
                });
            });

            // Remove the closed connection so we don't try to forward anymore
            ws.on('close', () => {
                let currConnections = connections[url];
                currConnections.findIndex((o, i) => {
                    if (o.id === connection.id) {
                        currConnections.splice(i, 1);
                        return true;
                    }
                });
            });

            // Respond to pong messages by marking the connection alive
            ws.on('pong', () => {
                connection.alive = true;
            });
        });

        // Keep active connections alive
        setInterval(() => {
            Object.keys(connections).forEach((url) => {
                let currConnections = connections[url];
                currConnections.forEach((c) => {
                    // Kill any connection that didn't respond to the ping last time
                    if (!c.alive) {
                        c.ws.terminate();
                    } else {
                        c.alive = false;
                        c.ws.ping();
                    }
                });
            });
        }, 10000);
    }
}

module.exports = { PeerProxy };
