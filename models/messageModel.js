const mongoose = require('mongoose');

const messageModel = mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    image: [{
        url: String,
        filename: String
    }],
    status: { type: String, default: null },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    deleted: [{
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }],
    unseen: [{
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }]
},
    {
        timestamps: true,
    }
)

const Message = mongoose.model("Message", messageModel);
module.exports = Message;