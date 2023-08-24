const mongoose = require('mongoose');

const chatModels = mongoose.Schema({
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    groupPic: { type: String, default: 'https://res.cloudinary.com/dlwc3ggh6/image/upload/v1679287288/default_images/group_logo_konhdo.png' },
    groupCover: { type: String, default: 'https://res.cloudinary.com/dlwc3ggh6/image/upload/v1680920842/default_images/cover_vykh5i.jpg' },
    favourite: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    block: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    latestMessage: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    }],
    groupAdmin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    deleted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
},
    {
        timestamps: true,
    }
)

const Chat = mongoose.model("Chat", chatModels);
module.exports = Chat;