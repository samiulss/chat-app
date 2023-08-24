const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userModel = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: { type: String, default: "https://res.cloudinary.com/dlwc3ggh6/image/upload/v1679288913/default_images/avater_gxr1ib.png" },
    cover: { type: String, default: "https://res.cloudinary.com/dlwc3ggh6/image/upload/v1680920842/default_images/cover_vykh5i.jpg" },
    verified: { type: Boolean, default: false }
},
    {
        timestamps: true,
    }
);

userModel.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userModel.pre("save", async function (next) {
    if (!this.isModified) {
        next()
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userModel);
module.exports = User;