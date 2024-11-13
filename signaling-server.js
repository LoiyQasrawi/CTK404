const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');

// Read SSL certificates
const serverConfig = {
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem')
};

// Create HTTPS server
const server = https.createServer(serverConfig);
const wss = new WebSocket.Server({ server });

// Connected clients
const clients = new Map();

wss.on('connection', (ws) => {
    const clientId = Date.now().toString();
    clients.set(clientId, ws);

    console.log(`Client ${clientId} connected`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Broadcast to all other clients
            clients.forEach((client, id) => {
                if (id !== clientId && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        ...data,
                        fromClient: clientId
                    }));
                }
            });
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        clients.delete(clientId);
    });

    ws.on('error', (error) => {
        console.error(`Client ${clientId} error:`, error);
        clients.delete(clientId);
    });
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});