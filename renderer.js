const electron = require('electron');
const ipc = electron.ipcRenderer;

const userNames = [];
const userPicsNum = 33;
const takenUserPics = [];
let leftAlignNum = 0;
let rightAlignNum = 0;

ipc.on("setup", (event, usersNum) => {
    for (let i = 0; i < usersNum; i++) {

    }
});

// An event sent by the ipc main to add new user to the array
ipc.on("newUser", (event, userName) => {
    newUser(userName);
});

// An event sent by the ipc main to add new message to the screen
ipc.on("newMsg", (event, userName, message, time) => {
    if (!userNames.includes(userName)) 
        newUser(userName);
        
    newMsg(userName, message, time, 0);
});

// An event sent by the ipc main to remove a message from the screen
ipc.on("removeMsg", (event, userName, time) => {
    removeMsg(userName, time);
});

// An event sent by the ipc main to set whether user is currently speaking or not
ipc.on("setUserVoiceState", (event, userName, time, state) => {
    setUserVoiceState(userName, time, state);
});

// Adds a new user widget on the screen
const newUser = (userName) => {
    if (userNames.includes(userName)) return;

    const alignClass = (() => {
        if(rightAlignNum < leftAlignNum) {
            rightAlignNum++;
            return 'right';
        } else {
            leftAlignNum++;
            return 'left';
        }
    });

    const align = alignClass();

    const column = document.querySelector(`.maincolumn.${align}`);
    const userDiv = document.createElement('div');
    userDiv.className = `user ${userName} ${align}`;
    column.appendChild(userDiv);

    // Their image
    const userPicDiv = document.createElement('div');
    userPicDiv.className = `userPic ${align}`;
    userDiv.appendChild(userPicDiv);
    const userPicImg = document.createElement('IMG'); 
    const userPicPath = `./userPics/${Math.floor(Math.random() * userPicsNum) + 1}.svg`;
    while (takenUserPics.includes(userPicPath)) {
        userPicPath = `./userPics/${Math.floor(Math.random() * userPicsNum) + 1}.svg`;
    }
    takenUserPics.push(userPicPath);
    userPicImg.src = userPicPath;
    userPicDiv.appendChild(userPicImg);

    // The container for their name and list of messages
    const userSideContainerDiv = document.createElement('div');
    userSideContainerDiv.className = `userSideContainer ${align}`;
    userDiv.appendChild(userSideContainerDiv);

    // Their name
    const userNameDiv = document.createElement('div');
    userNameDiv.className = `userName ${align}`;
    userSideContainerDiv.appendChild(userNameDiv);
    const name = document.createElement('p');
    name.textContent = userName;
    name.className = `${align}`;
    userNameDiv.appendChild(name);

    // Their list of messages
    const userMsgListDiv = document.createElement('div');
    userMsgListDiv.className = `userMsgList ${align}`;
    userSideContainerDiv.appendChild(userMsgListDiv);

    userNames.push(userName);
}

// Adds a new message on the screen
const newMsg = (userName, message, time, state) => {

    const userMsgListDiv = document.querySelectorAll(`.user.${userName}`)[0].querySelectorAll('.userMsgList')[0];
    let msgContents = [message];

    // Gather the previous messages so that they can be shifted down, displaying the new message at the top
    userMsgListDiv.querySelectorAll('.userMsg').forEach(element => {
        msgContents.push(element.textContent);
    });

    // Add a new message widget below other messages
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = `userMsg`;
    userMsgListDiv.appendChild(userMsgDiv);
    const userMsgP = document.createElement('p');
    userMsgDiv.appendChild(userMsgP);

    // Set the text of each message widget
    const msgDivs = userMsgListDiv.querySelectorAll('.userMsg');
    for (let i = 0; i < msgDivs.length; i++) {
        msgDivs[i].querySelectorAll('p')[0].textContent = msgContents[i];
    }
}

// Removes a message from the screen
const removeMsg = (userName, index) => {

    const userMsgListDiv = document.querySelectorAll(`.user.${userName}`)[0].querySelectorAll('.userMsgList')[0];
    const msgDivs = userMsgListDiv.querySelectorAll('.userMsg');
    if (index < msgDivs.length)
        msgDivs[index].remove();
}

const setUserVoiceState = (userName, time, state) => {
    if (!userNames.includes(userName)) 
        newUser(userName);

    const userPicDiv = document.querySelectorAll(`.user.${userName}`)[0].querySelectorAll('.userPic')[0];

    if (state == 0) {
        userPicDiv.classList.remove('active');
        userPicDiv.classList.add('inactive');
    }
    else if (state == 1) {
        userPicDiv.classList.remove('inactive');
        userPicDiv.classList.add('active');
    }
}