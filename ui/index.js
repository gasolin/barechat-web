// HTML content
const JS = `
// User avatars mapping
const avatars = {
    me: "🧝",
    system: "🔮",
};

// Get a default avatar for users we haven't seen before
const defaultAvatars = ["🧙", "⚔️", "🏹", "🛡️", "🐉", "🐺", "🦊", "🦁", "🦝", "🦡"];
let avatarIndex = 0;

// Keep track of which users we've assigned avatars to
const knownUsers = {};

// Function to get avatar for a user
function getAvatar(userId) {
    if (avatars[userId]) return avatars[userId];
    if (knownUsers[userId]) return knownUsers[userId];

    const newAvatar = defaultAvatars[avatarIndex % defaultAvatars.length];
    avatarIndex++;
    knownUsers[userId] = newAvatar;
    return newAvatar;
}

// Function to add a message to the chat
function addMessageToChat(messageData) {
    const chatContent = document.getElementById('chat-content');
    const { type, sender, text } = messageData;

    const messageDiv = document.createElement('div');

    if (type === 'system') {
        messageDiv.className = 'message system';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const textDiv = document.createElement('div');
        textDiv.textContent = text;

        messageContent.appendChild(textDiv);
        messageDiv.appendChild(messageContent);
    } else {
        messageDiv.className = \`message \${sender === 'me' ? 'me' : 'other'}\`; // Using template literal for class name

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const senderDiv = document.createElement('div');
        senderDiv.className = 'message-sender';
        const avatar = getAvatar(sender);
        senderDiv.textContent = \`\${avatar} \${sender === 'me' ? 'You' : sender}\`; // Using template literal for sender text

        const textDiv = document.createElement('div');
        textDiv.textContent = text;

        messageContent.appendChild(senderDiv);
        messageContent.appendChild(textDiv);
        messageDiv.appendChild(messageContent);
    }

    chatContent.appendChild(messageDiv);

    // Scroll to bottom
    chatContent.scrollTop = chatContent.scrollHeight;
}

// Initialize WebSocket connection
let ws = null;

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = \`\${protocol}//\${window.location.host}\`; // Using template literal for WebSocket URL

    ws = new WebSocket(wsUrl);
    console.log('link to ' + wsUrl)

    ws.onopen = function() {
        console.log('WebSocket connected');
        addMessageToChat({
            type: 'system',
            text: 'Connected to server'
        });
    };

    ws.onmessage = function(event) {
        const message = JSON.parse(event.data);
        addMessageToChat(message);
    };

    ws.onclose = function() {
        console.log('WebSocket closed');
        addMessageToChat({
            type: 'system',
            text: 'Disconnected from server. Reconnecting in 5 seconds...'
        });

        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
        addMessageToChat({
            type: 'system',
            text: 'Error connecting to server'
        });
    };
}

// Set up UI interactions
window.onload = function() {
    // Connect to WebSocket server
    connectWebSocket();

    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('chat-input');
    const joinButton = document.getElementById('join-button');
    const createButton = document.getElementById('create-button');
    const infoButton = document.getElementById('info-button');
    const roomInput = document.getElementById('room-input');

    function sendChatMessage() {
        const messageText = chatInput.value.trim();
        if (messageText && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'chat',
                text: messageText
            }));
            chatInput.value = '';
        }
    }

    function sendCommand(command) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'command',
                command: command
            }));
        }
    }

    sendButton.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    joinButton.addEventListener('click', function() {
        const roomId = roomInput.value.trim();
        if (roomId) {
            sendCommand(\`join \${roomId}\`); // Using template literal for join command
            roomInput.value = '';
        } else {
            addMessageToChat({
                type: 'system',
                text: 'Please enter a room ID to join'
            });
        }
    });

    createButton.addEventListener('click', function() {
        sendCommand('create');
    });

    infoButton.addEventListener('click', function() {
        sendCommand('info');
    });

    roomInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            joinButton.click();
        }
    });
};
`

export const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BareChat Web</title>
    <link href="https://cdn.jsdelivr.net/gh/RonenNess/RPGUI@1.0.4/dist/rpgui.min.css" rel="stylesheet" type="text/css">
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        .chat-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            max-width: 800px;
            margin: 0 auto;
            padding: 10px;
            box-sizing: border-box;
        }
        .chat-content {
            flex-grow: 1;
            overflow-y: auto;
            padding: 10px;
            margin-bottom: 10px;
        }
        .chat-input-container {
            display: flex;
            padding: 10px;
            margin-bottom: 10px;
        }
        .chat-input {
            flex-grow: 1;
            margin-right: 10px;
            padding: 10px;
        }
        .message {
            margin-bottom: 15px;
            clear: both;
            max-width: 70%;
        }
        .message-content {
            padding: 10px;
            border-radius: 5px;
            display: inline-block;
        }
        .message-sender {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .message.other {
            float: left;
        }
        .message.other .message-content {
            background-color: #4a4a4a;
            color: white;
        }
        .message.me {
            float: right;
            text-align: right;
        }
        .message.me .message-content {
            background-color: #007bff;
            color: white;
        }
        .message.system {
            clear: both;
            text-align: center;
            max-width: 100%;
            margin: 10px 0;
        }
        .message.system .message-content {
            background-color: #6c757d;
            color: white;
            display: inline-block;
        }
        .avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: 10px;
            vertical-align: middle;
        }
        .room-controls {
            display: flex;
            padding: 10px;
            margin-bottom: 10px;
        }
        .command-input {
            flex-grow: 1;
            margin-right: 10px;
            padding: 10px;
        }
        .rpgui-button {
            margin-left: 5px;
        }
    </style>
</head>
<body class="rpgui-content">
    <div class="chat-container">
        <div class="rpgui-container framed-grey room-controls">
            <input type="text" class="rpgui-input command-input" id="room-input" placeholder="Enter room ID to join...">
            <button class="rpgui-button" id="join-button">
                <p>Join</p>
            </button>
            <button class="rpgui-button" id="create-button">
                <p>Create</p>
            </button>
            <button class="rpgui-button" id="info-button">
                <p>Info</p>
            </button>
        </div>

        <div class="rpgui-container framed chat-content" id="chat-content">
            <div class="message system">
                <div class="message-content">
                    <div>Welcome to BareChat Web! Create a new room or join an existing one.</div>
                </div>
            </div>
        </div>

        <div class="rpgui-container framed-grey chat-input-container">
            <input type="text" class="rpgui-input chat-input" id="chat-input" placeholder="Type your message...">
            <button class="rpgui-button" id="send-button">
                <p>Send</p>
            </button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/RonenNess/RPGUI@1.0.4/dist/rpgui.min.js"></script>
    <script>
        ${JS}
    </script>
</body>
</html>
`;
