const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModels");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

//access chat
const accessChat = expressAsyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        res.status(400);
    }

    let isChat = await Chat.find({
        isGroupChat: false,

        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    })
        .populate("users", "-password")
        .populate("latestMessage");

    //change
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name, email, pic"
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        let chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        }
        try {
            const createChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createChat._id }).populate("users", "-password");

            res.status(200).send(fullChat);
        } catch (error) {
            res.status(400)
            throw new Error(error.message);
        }
    }
});

//fetching chat
const fetchChat = expressAsyncHandler(async (req, res) => {
    try {
        let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage", "-password")
            .sort({ updatedAt: -1 })
        results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email"
        });
        res.send(results);
    } catch (error) {
        res.status(400).send(error.message);
    }
})

//create group chat 
const createGroupChat = expressAsyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "please fill all the fields" });
    }

    let users = req.body.users;

    if (!users.length) {
        return res.status(400).send({ message: "More than 1 users are requierd to form a group chat" });
    }

    users.push(req.user)

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        })

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
        res.status(200).send(fullGroupChat);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//rename gruop
const renameGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updateChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!updateChat) {
        res.status(400).send("Chat Not Found");
    } else {
        res.json(updateChat);
    }
})

//rename gruop
const addToGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!added) {
        res.status(400).send("Chat Not Found");
    } else {
        res.json(added);
    }
})

//rename gruop
const removeFromGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId, isAdmin } = req.body;

    if (isAdmin) {
        await Chat.findByIdAndUpdate(chatId, { $pull: { groupAdmin: userId } }, { new: true })
    }

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!removed) {
        res.status(400).send("Chat Not Found");
    } else {
        res.json(removed);
    }
})

//block user
const blockUser = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    const findUser = await User.findById(userId)
    try {
        const blockUser = await Chat.findByIdAndUpdate(chatId, { $push: { block: findUser } }, { new: true })
            .populate("users", "-password").populate("block")
        res.send(blockUser)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//unblock user
const unBlockUser = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const findUser = await User.findById(userId)
    try {
        const unBlock = await Chat.findByIdAndUpdate(chatId, { $pull: { block: findUser._id } }, { new: true })
            .populate("users", "-password").populate("block")
        res.send(unBlock);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//make admin
const makeAdmin = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const findUser = await User.findById(userId)
    try {
        const result = await Chat.findByIdAndUpdate(chatId, { $push: { groupAdmin: findUser._id } }, { new: true })
            .populate("users", "-password").populate("groupAdmin")
        res.send(result);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//remove admin
const removeAdmin = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const findUser = await User.findById(userId)
    try {
        const result = await Chat.findByIdAndUpdate(chatId, { $pull: { groupAdmin: findUser._id } }, { new: true })
            .populate("users", "-password").populate("groupAdmin")
        res.send(result);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//delete chat
const deleteChat = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    try {
        const result = await Chat.findByIdAndUpdate(chatId, { $push: { deleted: userId } }, { new: true })
        await Message.find({ chat: chatId }).updateMany({ $push: { deleted: userId } })
        res.send(result)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//favourite chat
const favourite = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    try {
        const result = await Chat.findByIdAndUpdate(chatId, { $push: { favourite: userId } }, { new: true })
            .populate("users", "-password")
            .populate("favourite")
        res.send(result)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//favourite chat
const unFavourite = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    try {
        const result = await Chat.findByIdAndUpdate(chatId, { $pull: { favourite: userId } }, { new: true })
        res.send(result)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//change group image
const groupImage = expressAsyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body
    const file = req.files[0]

    try {
        const { url } = await cloudinary.uploader.upload(file.path, {
            transformation: [
                { height: 400, width: 400, },
            ],
            folder: 'profileAvater',
            public_id: chatId + "-" + chatName
        })
        fs.unlinkSync(file.path)
        const result = await Chat.findByIdAndUpdate(chatId, { groupPic: url }, { new: true })
            .populate("users", "-password")
            .populate("groupAdmin")
        res.json(result)
    } catch (error) {
        res.status(400).send(error.message);
    }
})

//change group cover image
const groupCoverImage = expressAsyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body
    const file = req.files[0]

    try {
        const { url } = await cloudinary.uploader.upload(file.path,
            {
                transformation: [
                    { height: 300, width: 600, },
                ],
                folder: 'coverImage',
                public_id: chatId + "-" + chatName
            })
        fs.unlinkSync(file.path)
        const result = await Chat.findByIdAndUpdate(chatId, { groupCover: url })
            .populate("users", "-password")
            .populate("groupAdmin")
        res.json(result)
    } catch (error) {
        res.status(400).send(error.message);
    }
})

module.exports = {
    accessChat,
    fetchChat,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    blockUser,
    unBlockUser,
    makeAdmin,
    removeAdmin,
    deleteChat,
    favourite,
    unFavourite,
    groupImage,
    groupCoverImage,
}