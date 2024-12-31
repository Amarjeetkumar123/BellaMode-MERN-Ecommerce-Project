const express = require('express');
const router = express.Router();
const User = require("../models/user.model");
const generateToken = require('../middleware/generateToken');
// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username, password });
        await user.save();
        res.status(200).json({
            message: "User registered successfully."
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Username or Email is already exists." });
    }
})

// login user endpoint 
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "User not found." })
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).send({ message: "Pasword not match." })
        }
        const token = await generateToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        res.status(200).send({
            message: "Login successfuly", token, user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession
            }
        })
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})

// logout
router.post('/logout', async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).send({ message: "Logged out succesfully." })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).send({ message: "User deleted successfully." })
    } catch (error) {
        res.status(500).send(error.message)
    }
})
// List user
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '_id email role').sort({ createdAt: -1 });
        res.status(200).send(users)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// update user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) {
            return res.status(404).send({ message: 'User not found' })
        }
        res.status(200).send({ message: 'User role updated successfully', userId: user._id })

    } catch (error) {
        console.error("Error updating user role", error);
        res.status(500).send({ message: error.message, })
    }
})

// edit or update profile
router.patch('/edit-profile', async (req, res) => {
    try {
        const { userId, username, profileImage, bio, profession } = req.body;
        if (!userId) {
            return res.status(400).send({ message: 'User ID is required' })
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).send({ message: 'User not found.' })
        }
        // update profile
        if (username !== undefined) user.username = username;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (bio !== undefined) user.bio = bio;
        if (profession !== undefined) user.profession = profession;
        await user.save();
        res.status(200).send({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession,
            },
        });
    }
    catch (error) {
        console.error("Error updating user profile", error);
        res.status(500).send({ message: "Error updating user profile", })
    }
})
module.exports = router;