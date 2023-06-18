const { WAConnection, MessageType } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');

const sessionPath = './session.json';

// Create a new connection instance
const conn = new WAConnection();

// Event fired when session has been successfully restored
conn.on('open', () => {
  console.log('Connected to WhatsApp');

  // Save the session data to file when logged in
  const sessionData = conn.base64EncodedAuthInfo();
  require('fs').writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
});

// Event fired when a new message is received
conn.on('chat-update', async (chat) => {
  if (chat.messages && chat.count) {
    const message = chat.messages.all()[0];
    const sender = message.key.remoteJID;

    // Reply with a text message
    conn.sendMessage(sender, "I'm not online at the moment.", MessageType.text);

    // Reply with a voice message
    const voiceMessage = await conn.prepareMessage(sender, MessageType.audio);
    voiceMessage.recordedAudio = 'path_to_voice_message.mp3';
    conn.relayWAMessage(voiceMessage);
  }
});

// Load session data from file
let sessionData;
try {
  sessionData = require(sessionPath);
} catch (err) {
  sessionData = null;
}

// Connect to WhatsApp
conn.loadAuthInfo(sessionData);
conn.connect();

// Generate and display QR code for linking the WhatsApp account to the device
conn.on('qr', (qr) => {
  console.log('Scan the QR code to link your WhatsApp account:');
  qrcode.generate(qr, { small: true });
});
