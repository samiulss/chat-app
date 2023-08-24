const expressAsyncHandler = require("express-async-handler");
const cloudinary = require("../config/cloudinary");
const fs = require('fs');
const Chat = require("../models/chatModels");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const sendMessage = expressAsyncHandler(async (req, res) => {
    const { content, chatId, status, isDeleted } = req.body;

    const uploader = async (path) => await cloudinary.uploads(path, 'Images');
    const files = req.files
    const urls = []
    for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path)
        urls.push(newPath)
        fs.unlinkSync(path)
    }

    let newMessage = {
        sender: req.user._id,
        chat: chatId,
        content: content,
        image: urls,
        status: status
    }

    if (isDeleted) {
        await Chat.findByIdAndUpdate(chatId, { deleted: [] })
    }

    try {
        let message = await Message.create(newMessage);
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message,
        });
        res.send(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//
const deliveredMessage = expressAsyncHandler(async (req, res) => {
    const { chatId } = req.body;
    try {
        const setDelivered = await Message.find({ chat: chatId }).updateMany({ status: 'delivered' })
        res.send(setDelivered);
    } catch (error) {
        res.status(400).send(error.message);
    }
})

//
const seenMessage = expressAsyncHandler(async (req, res) => {
    const { chatId } = req.body;
    try {
        const setSeen = await Message.find({ chat: chatId }).updateMany({ status: 'seen' })
        res.send(setSeen);
    } catch (error) {
        res.status(400).send(error.message);
    }
})

//find all messages
const allMessages = expressAsyncHandler(async (req, res) => {
    try {
        let message = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic cover")
            .populate("chat")
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email cover"
        })
        res.send(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//delete message
const deleteMessage = expressAsyncHandler(async (req, res) => {
    const { chatId, msgId, userId, getLast } = req.body
    try {
        const result = await Message.findByIdAndUpdate(msgId, { $push: { deleted: userId } }, { new: true })
        getLast && await Chat.findByIdAndUpdate(chatId, { $push: { latestMessage: getLast } }, { new: true })
        res.send(result)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//unseen message
const unseenMessage = expressAsyncHandler(async (req, res) => {
    const { msgId, userId } = req.body
    try {
        const result = await Message.findByIdAndUpdate(msgId, { $push: { unseen: userId } }, { new: true })
            .populate("sender", "name pic")
        res.send(result)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//forword message
const forWardMessage = expressAsyncHandler(async (req, res) => {
    const { chatId, content, image, status, isDeleted } = req.body

    let urls = [];
    if (typeof image === "string") {
        let parseImg = JSON.parse(image)
        const processImg = {
            url: parseImg.url,
            id: parseImg._id
        }
        urls.push(processImg)
    } else {
        for (let i = 0; i < image?.length; i++) {
            const element = image[i];
            const parseImage = JSON.parse(element)
            urls.push(parseImage)
        }
    }

    let newMessage = {
        sender: req.user._id,
        chat: chatId,
        content: content,
        image: urls,
        status: status
    }

    if (isDeleted) {
        await Chat.findByIdAndUpdate(chatId, { deleted: [] })
    }

    try {
        let message = await Message.create(newMessage)
        message = await message.populate("sender", "name pic");
        message = await message.populate("image");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message,
        });
        res.send(message)
    } catch (error) {
        res.status(400).send(error)
    }


})
module.exports = { sendMessage, allMessages, seenMessage, deliveredMessage, deleteMessage, unseenMessage, forWardMessage };