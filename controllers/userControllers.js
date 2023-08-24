const asyncHandler = require('express-async-handler');
const genarateToken = require('../config/genarateToken');
const User = require('../models/userModel');
const Chat = require("../models/chatModels");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

//register user create
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const file = req.file;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please enter all fields");
    };

    //exitsting user
    const userExits = await User.findOne({ email });
    if (userExits) {
        res.status(400);
        throw new Error("User already exits");
    }

    // new user create
    try {
        let pic;
        if (file) {
            const { url } = await cloudinary.uploader.upload(file.path, {
                transformation: [
                    { height: 400, width: 400, },
                ],
                folder: 'profileAvater',
                public_id: name + "-" + email
            })
            fs.unlinkSync(file.path)
            pic = url;
        }
        const user = await User.create({
            name,
            email,
            password,
            pic
        })
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: genarateToken(user._id)
            });
        }
    } catch (error) {
        res.status(400);
        throw new Error(error);
    }
});

//existing user login
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            cover: user.cover,
            token: genarateToken(user._id)
        });

    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }

})

//search users
const getUsers = asyncHandler(async (req, res) => {
    const keywords = req.query.search
        && {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { chatName: { $regex: req.query.search, $options: "i" } }
        ],
    }
    const users = await User.find(keywords).find({ _id: { $ne: req.user._id } }).select("-password");
    const groups = await Chat.find(keywords).populate("users", "-password").populate("groupAdmin");
    if (users.length) {
        res.send(users);
    } else {
        res.send(groups);
    }
})

//change profile avater
const changeAvater = asyncHandler(async (req, res) => {
    const { userId, userName } = req.body;
    const file = req.file;
    try {
        const { url } = await cloudinary.uploader.upload(file.path,
            {
                transformation: [
                    { height: 400, width: 400, },
                ],
                folder: 'profileAvater',
                public_id: userId + "-" + userName,
            })
        fs.unlinkSync(file.path)

        const updateAater = await User.findByIdAndUpdate(userId, { pic: url });
        res.json({
            _id: updateAater._id,
            name: updateAater.name,
            email: updateAater.email,
            pic: url,
            cover: updateAater.cover,
            token: genarateToken(updateAater._id)
        });
    } catch (error) {
        res.status(400).send(error.message)
    }
})

const changeCover = asyncHandler(async (req, res) => {
    const { userId, userName } = req.body;
    const file = req.file;
    try {
        const { url } = await cloudinary.uploader.upload(file.path, {
            transformation: [
                { height: 300, width: 600, },
            ],
            folder: 'coverImage',
            public_id: userId + "-" + userName
        },)
        fs.unlinkSync(file.path)

        const coverUpdate = await User.findByIdAndUpdate(userId, { cover: url });
        res.json({
            _id: coverUpdate._id,
            name: coverUpdate.name,
            email: coverUpdate.email,
            pic: coverUpdate.pic,
            cover: url,
            token: genarateToken(coverUpdate._id)
        });
    } catch (error) {
        res.status(400).send(error.message)
    }
})

module.exports = { registerUser, authUser, getUsers, changeAvater, changeCover };