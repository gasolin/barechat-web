// HTML content
export const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BareChat Web</title>
    <!-- RPGUI CSS -->
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
        .message.system .message-content {
            background-color: #6c757d;
            color: white;
        }
        .avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: 10px;
            vertical-align: middle;
        }
    </style>
</head>
<body class="rpgui-content">
    <div class="chat-container">
        <div class="rpgui-container framed chat-content" id="chat-content">
            <!-- Messages will be inserted here dynamically -->
        </div>
        <div class="rpgui-container framed-grey chat-input-container">
            <input type="text" class="rpgui-input chat-input" id="chat-input" placeholder="Type your message...">
            <button class="rpgui-button" id="send-button">
                <p>Send</p>
            </button>
        </div>
    </div>

    <!-- RPGUI Scripts -->
    <script src="https://cdn.jsdelivr.net/gh/RonenNess/RPGUI@1.0.4/dist/rpgui.min.js"></script>
    <script>
        // Mock users data
        const users = {
            wizard: { name: "Wizard Gandorf", avatar: "🧙" },
            knight: { name: "Sir Lancelot", avatar: "⚔️" },
            me: { name: "You", avatar: "🧝" }
        };

        // Mock messages
        const mockMessages = [
            { sender: "wizard", text: "Welcome to the realm of BareChat! I've been expecting you." },
            { sender: "knight", text: "Greetings, traveler! How fares your journey?" },
            { sender: "me", text: "Hello everyone! I'm new to this magical chat." },
            { sender: "wizard", text: "Ah, a newcomer! Let me cast a spell to enhance your experience..." },
            { sender: "knight", text: "Don't worry about the wizard's antics. He's harmless... mostly." },
            { sender: "me", text: "Thanks for the welcome! This UI looks amazing with RPGUI." },
            { sender: "wizard", text: "RPGUI is indeed a powerful artifact. It was forged in the depths of GitHub." },
            { sender: "knight", text: "My sword and shield are at your service. Feel free to ask if you need assistance." },
            { sender: "me", text: "I'm excited to be part of this chat adventure!" }
        ];

        // Function to add a message to the chat
        function addMessageToChat(message) {
            const chatContent = document.getElementById('chat-content');
            const user = users[message.sender];
            
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${message.sender === 'me' ? 'me' : 'other'}\`;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            const senderDiv = document.createElement('div');
            senderDiv.className = 'message-sender';
            senderDiv.textContent = \`\${user.avatar} \${user.name}\`;
            
            const textDiv = document.createElement('div');
            textDiv.textContent = message.text;
            
            messageContent.appendChild(senderDiv);
            messageContent.appendChild(textDiv);
            messageDiv.appendChild(messageContent);
            chatContent.appendChild(messageDiv);
            
            // Scroll to bottom
            chatContent.scrollTop = chatContent.scrollHeight;
        }

        // Initialize chat with mock messages
        window.onload = function() {
            // Add mock messages
            mockMessages.forEach(message => {
                addMessageToChat(message);
            });

            // Set up send button functionality
            const sendButton = document.getElementById('send-button');
            const chatInput = document.getElementById('chat-input');

            function sendMessage() {
                const messageText = chatInput.value.trim();
                if (messageText) {
                    addMessageToChat({
                        sender: 'me',
                        text: messageText
                    });
                    chatInput.value = '';
                }
            }

            sendButton.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        };
    </script>
</body>
</html>
`
