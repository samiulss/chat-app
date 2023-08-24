const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModels");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const sendNotification = expressAsyncHandler(async (req, res) => {
    const { content, isGroupChat, chatId, image } = req.body;
    let newNotification = {
        sender: req.user._id,
        content: content,
        image: image,
        chat: chatId,
        isGroupChat: isGroupChat,
    }

    try {
        await Notification.create(newNotification)
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
    }
})

const getNotification = expressAsyncHandler(async (req, res) => {
    try {
        const notification = await Notification.find({})
        res.send(notification);
    } catch (error) {
        res.status(400)
        throw new Error(error.message);
    }
})

const deleteNotification = expressAsyncHandler(async (req, res) => {
    try {
        const delNotification = await Notification.deleteMany({ chat: req.params.chatId })
        res.send(delNotification);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

module.exports = { sendNotification, getNotification, deleteNotification }