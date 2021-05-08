const dotenv = require('dotenv');
const electron = require('electron');
const { app, BrowserWindow } = electron;
const PubNub = require('pubnub');
const config = require('./config.json');

dotenv.config();
let mainWindow = null;
const pubnub = new PubNub({
    publishKey: "pub-c-5eaaf65b-e640-4e31-9c09-e39f38676b66",
    subscribeKey: "sub-c-50f20552-8502-11eb-88a7-4a59fc122af9",
    secretKey: "sec-c-OWI5Njk1MjUtNjFmMC00YjI2LThkMWYtYWNhOWY3ZTM5ZDBj"
});
pubnub.subscribe({
    channels: ['main']
});
pubnub.addListener({
    message: (log) => {
        newMsg(log.message);
    }
});
const myName = "USER_NAME";

// Key is made of name (sender's username) and time (when message was sent)
// Value stores the index of the message (how far it is from the top most message widget of this user)
const msgs = new Map();

// Creates the main window
const createWindow = (width, height) => {
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        resizable: false,
        frame: false,
        transparent: true,
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.setIgnoreMouseEvents(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setVisibleOnAllWorkspaces(true);
    mainWindow.maximize();

    mainWindow.show();
}

/*
    Receives a new message (log) in the following format: username|date|time|message|metadata 
                                                for example: admin|12/03/2021|22:49:27|Hello
    and displayes it on the screen
*/                                                          
function newMsg(log) {
    if (log.length <= 1) return;

    const args = log.toString().split('|');

    const name = args[0].replace(/\s+/g, '_');
    const date = args[1];
    const time = args[2];
    const msg = args[3];
    const meta = args[4];

    if (name.length <= 1 || msg.length <= 1) return;

    if(msg.startsWith(config.prefix)) {
        processCommand(name, time, msg);
        return;
    }
    
    mainWindow.webContents.send('newMsg', name, msg);

    // Increment the index of each message (new message is added at the top of the list)
    msgs.forEach((value, key) => {
        if (key.name == name) {
            msgs.set(key, value + 1);
        }
    });
    
    // Add the new message to the map of messages
    const newKey = {
        name: name, 
        time: time
    };
    msgs.set(newKey, 0);

    // Set a timer calling an event in the ipc renderer to remove this message from the screen
    setTimeout(() => {
        removeMsg(name, time);
    }, 6000);
}

// Removes a message from the screen
function removeMsg(name, time) {
    msgs.forEach((value, key) => {
        if(name == key.name && time == key.time) {
            mainWindow.webContents.send('removeMsg', name, value);
            msgs.delete(key);
        }
    });
}

function processCommand(name, time, msg) {

    let state = 0;
    // User stopped speaking
    if(msg.includes('voice 0')) {
        state = 0;
    }
    if(msg.includes('voice 1')) {
        state = 1;
    }

    mainWindow.webContents.send('setUserVoiceState', name, time, state);
}

app.commandLine.appendSwitch('enable-transparent-visuals');
app.disableHardwareAcceleration();

// Called as soon as the electron app is ready
app.on('ready', () => {
    setTimeout(() => {
        const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
        createWindow(width, height);
    }, 300);
});
