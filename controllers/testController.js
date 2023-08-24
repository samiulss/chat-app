const expressAsyncHandler = require("express-async-handler");
const cloudinary = require('cloudinary').v2;

const testTing = expressAsyncHandler(async (req, res) => {
    const { image } = req.files;
    const { name } = req.body;

    // const filePath = pic.tempFilePath;

    console.log(image, name);

    // try {
    //     const results = await cloudinary.uploader.upload(filePath, { folder: 'profileAvater', public_id: pic.name });
    //     res.status(200).send('Upload successfully')
    // } catch (error) {
    //     res.status(500).send(error.message)
    // }

});

module.exports = { testTing };