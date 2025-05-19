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

// Function to format timestamp
function getFormattedTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0');
}

// Function to add a message to the chat
function addMessageToChat(messageData) {
    const chatContent = document.getElementById('chat-content');
    const { type, sender, text } = messageData;

    // Check if it's a system message about connected peers or connection status
    if (type === 'system' && text.startsWith('Connected peers:')) {
        updateStatusBar(text);
        return; // Don't add this to the main chat
    }

    if (type === 'system' && (text.startsWith('WebSocket connected') ||
      text.startsWith('WebSocket Disconnected') ||
      text.startsWith('WebSocket connecting Error'))) {
        updateStatusBar('Server Status: ' + text);
        return; // Don't add this to the main chat for now, can be refined later
    }

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
        // Determine if this is the user's message or someone else's
        const isMe = sender === 'me'
        messageDiv.className = 'message ' + (isMe ? 'me' : 'other'); // Corrected ternary operator usage

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const senderDiv = document.createElement('div');
        senderDiv.className = 'message-sender';

        const avatar = getAvatar(sender);
        const avatarSpan = document.createElement('span');
        avatarSpan.className = 'avatar';
        avatarSpan.textContent = avatar;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = isMe ? ' You' : ' ' + sender;

        senderDiv.appendChild(avatarSpan);
        senderDiv.appendChild(nameSpan);

        const textDiv = document.createElement('div');
        textDiv.textContent = text;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = getFormattedTime();

        messageContent.appendChild(senderDiv);
        messageContent.appendChild(textDiv);
        messageContent.appendChild(timeDiv);
        messageDiv.appendChild(messageContent);
    }

    // Create a wrapper to help with clearing floats if needed
    // Note: With flexbox used for alignment, the float clearing container might be less necessary,
    // but we'll keep it for now as it was in the original structure.
    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = 'chat-bubbles-container';
    bubbleContainer.appendChild(messageDiv);
    chatContent.appendChild(bubbleContainer);

    // Scroll to bottom
    chatContent.scrollTop = chatContent.scrollHeight;
}

// Function to update the status bar
function updateStatusBar(text) {
    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.textContent = text;
    }
}

// Initialize WebSocket connection
let ws = null;

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = protocol + '//' + window.location.host;

    ws = new WebSocket(wsUrl);
    console.log('linking to ' + wsUrl)

    ws.onopen = function() {
        console.log('WebSocket connected');
        addMessageToChat({
            type: 'system',
            text: 'WebSocket Connected'
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
            text: 'WebSocket Disconnected. Reconnecting in 5 seconds...'
        });

        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
        addMessageToChat({
            type: 'system',
            text: 'WebSocket connecting Error'
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
            sendCommand('join ' + roomId); // Using template literal for join command
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

    // Focus on input for better UX
    chatInput.focus();
};
`

export const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BareChat Web</title>
    <link href="https://cdn.jsdelivr.net/gh/RonenNess/RPGUI@1.0.3/dist/rpgui.min.css" rel="stylesheet" type="text/css">
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: 'Press Start 2P', cursive, monospace;
            /* Removed overflow: hidden; */
            background-color: #222;
            color: #eee;
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
        .status-bar {
            padding: 10px;
            margin-bottom: 10px;
            text-align: center;
            background-color: #444;
            color: #fff;
            border-radius: 5px;
            font-size: 0.9em;
        }
        .chat-content {
            flex-grow: 1;
            overflow-y: auto; /* This should enable scrolling */
            overflow-x: hidden; /* Hide horizontal scrolling */
            padding: 10px;
            margin-bottom: 10px;
            position: relative;
            min-height: 300px; /* Ensure it has a minimum height */
            background-color: #333;
            display: flex; /* Added display: flex */
            flex-direction: column; /* Added flex-direction: column */
        }
        .chat-input-container {
            display: flex;
            padding: 10px;
            margin-bottom: 10px;
            position: relative;
            flex-shrink: 0; /* Prevent shrinking */
        }
        .chat-input {
            flex-grow: 1;
            margin-right: 10px;
            padding: 10px;
        }
        .message {
            margin-bottom: 15px;
            max-width: 70%;
            /* Removed float properties */
            /* Removed overflow: hidden; */
        }
        .message-content {
            padding: 12px;
            border-radius: 8px;
            display: inline-block;
            max-width: 100%;
            position: relative;
            word-wrap: break-word;
            /* adjust line-height */
            line-height: 1.6;
        }
        .message-sender {
            font-weight: bold;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
        }
        /* Other user messages */
        .message.other {
            /* Removed float: left; */
            text-align: left; /* Ensure text alignment is correct */
        }
        .message.other .message-content {
            background-color: #4a4a4a;
            color: white;
            border: 2px solid #666;
        }
        .message.other .message-content::after {
            content: '';
            position: absolute;
            left: -10px;
            top: 10px;
            border-width: 5px 10px 5px 0;
            border-style: solid;
            border-color: transparent #4a4a4a transparent transparent;
        }
        /* My messages */
        .message.me {
            /* Removed float: right; */
            text-align: right; /* Ensure text alignment is correct */
        }
        .message.me .message-content {
            background-color: #75621b;
            color: white;
            border: 2px solid #9c7f21;
        }
        .message.me .message-content::after {
            content: '';
            position: absolute;
            right: -10px;
            top: 10px;
            border-width: 5px 0 5px 10px;
            border-style: solid;
            border-color: transparent transparent transparent #75621b;
        }
        /* System messages */
        .message.system {
            clear: both; /* Keep clear: both for system messages if they need to break floats (though floats are removed now) */
            text-align: center;
            max-width: 100%;
            margin: 15px auto;
        }
        .message.system .message-content {
            background-color: rgba(108, 117, 125, 0.7);
            color: white;
            display: inline-block;
            border: 1px solid #888;
            font-size: 0.85em;
            padding: 8px 15px;
        }
        .avatar {
            font-size: 1.2em;
            margin-right: 5px;
        }
        .room-controls {
            display: flex;
            padding: 10px;
            margin-bottom: 10px;
            position: relative;
            flex-shrink: 0; /* Prevent shrinking */
        }
        .command-input {
            flex-grow: 1;
            margin-right: 10px;
            padding: 10px;
        }
        .rpgui-button {
            margin-left: 5px;
            position: relative;
            min-width: 80px;
            height: auto !important;
        }
        .rpgui-button p {
            margin: 0;
            padding: 5px;
        }
        .room-controls .rpgui-button {
            padding-left: 5px;
        }
        /* Fix input fields in RPGUI 1.0.3 */
        .rpgui-input {
            position: relative;
            height: auto !important;
            min-height: 32px;
        }
        /* Fix container spacing */
        .rpgui-container {
            position: relative;
            margin-bottom: 10px;
            /* overflow: visible;  Keep as rpgui default */
        }
        /* Chat bubble container - used as a flex item within chat-content */
        .chat-bubbles-container {
            width: 100%;
            margin-bottom: 10px;
            display: flex;
            flex-direction: column;
            flex-shrink: 0; /* Prevent shrinking */
        }

        /* Align messages within the chat-bubbles-container using align-self */
        .chat-bubbles-container .message.other {
            align-self: flex-start;
        }

        .chat-bubbles-container .message.me {
            align-self: flex-end;
        }

        .chat-bubbles-container .message.system {
            align-self: center;
        }
        /* Header styling */
        .app-header {
            text-align: center;
            margin-bottom: 15px;
            font-size: 1.2em;
            color: #ffd700;
            flex-shrink: 0; /* Prevent shrinking */
        }
        /* Room info display */
        .room-info {
            font-size: 0.8em;
            text-align: center;
            margin-top: 5px;
            color: #aaa;
        }
        /* Message timestamp */
        .message-time {
            font-size: 0.75em;
            opacity: 0.7;
            margin-top: 5px;
        }
    </style>
</head>
<body class="rpgui-content">
    <div class="chat-container">
        <div class="app-header">
            <h1>BareChat Web</h1>
        </div>

        <div class="rpgui-container framed-golden room-controls">
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

        <div class="rpgui-container framed-grey status-bar" id="status-bar">
            Connecting WebSocket...
        </div>

        <div class="rpgui-container framed-grey chat-content" id="chat-content">
            <div class="message system">
                <div class="message-content">
                    <div>Welcome to BareChat! Create a new room or join an existing one.</div>
                </div>
            </div>
        </div>

        <div class="rpgui-container framed-golden chat-input-container">
            <input type="text" class="rpgui-input chat-input" id="chat-input" placeholder="Type your message...">
            <button class="rpgui-button" id="send-button">
                <p>Send</p>
            </button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/RonenNess/RPGUI@1.0.3/dist/rpgui.min.js"></script>
    <script>
        ${JS}
    </script>
</body>
</html>
`;
