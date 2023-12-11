require('dotenv').config();
const User = require('../models/userSchema');
const ResetPassword = require('../models/resetPasswordSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const sendEmail = require('../services/emailService');
const validation = require('../config/validation');
const { validateEmail, validatePassword, validateString, validatePhone } = validation;

const user_register_post = async (req, res) => {
    try {
        const { userName, email, phone, password } = req.body;
        // Validation
    if (!validateEmail(email)) return res.status(400).json({ status: 0, message: 'Email is INVALID' });
    if (!validatePassword(password)) return res.status(400).json({ status: 0, message: 'Invalid password' });
    if (!validateString(userName)) return res.status(400).json({ status: 0, message: 'Invalid username' });
    if (!validatePhone(phone)) return res.status(400).json({ status: 0, message: 'Invalid phone number' });

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new User({ userName, email, phone, password: hashedPassword });
        await user.save();
        res.status(201).json({ status: 1, success: 'Inserted Successfully' });
    } catch (error) {
        res.status(500).json({ status: 0, message: 'Error registering user', error: error.message });
    }
};

const user_login_post = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Validation
        if (!validateEmail(email)) return res.status(400).json({ status: 0, message: 'Email is INVALID' });
        if (!validatePassword(password)) return res.status(400).json({ status: 0, message: 'Invalid password' });

        const user = await User.findOne({ email });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ status: 0, message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.KEY_TOKEN);
        if (!user.tokens) {
            user.tokens = [];
        }
        if (user.tokens.length >= process.env.COUNT_TOKEN) {
            return res.status(500).json({ status: 0, message: `You do not have the authority to own more than ${process.env.COUNT_TOKEN} devices` });
        }
        user.tokens.push(token);
        await user.save();
        return res.status(201).json({ status: 1, success: 'Logged Successfully', token });
    } catch (error) {
        res.status(500).json({ status: 0, message: 'Error logging in', error: error.message });
    }
};

const user_data_get = async (req, res) => {
    try {
        const decoded = req.decoded_token;
        const userId = decoded.userId;
        const user = await User.findById(userId).select('-_id -password -tokens -__v');

        if (!user) {
            return res.status(404).json({ status: 0, message: 'User not found' });
        }

        res.status(200).json({ status: 1, result: user });
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};
const user_resetPassword_post = async (req, res) => {
    try {
        const { email } = req.body;
        if (!validateEmail(email)) return res.status(400).json({ status: 0, message: 'Email is INVALID' });
       
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ status: 0, message: 'User not Exists!' });
        }

        const resetPassword = new ResetPassword({ email: user.email });
        await resetPassword.save();

        const resetId = resetPassword._id;
        const token = jwt.sign({ email: user.email, resetId }, process.env.KEY_TOKEN);
        const resetPasswordLink = `${process.env.EMAIL_HOST}/api/user/resetpassword/${user._id}/${token}`;

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            secure: true,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const to = resetPassword.email;
        const subject = 'Reset Your Password';
        const text = `Go to the link to reset your password: ${resetPasswordLink}`;

        await transporter.sendMail({ from: process.env.EMAIL, to, subject, text });

        res.status(200).json({ status: 1, message: 'Password reset link sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 0, error: 'Error while processing the request.' });
    }
};


const user_updatepassword_patch = async (req, res) => {
    try {
        const { email, resetId } = req.decoded_token;
        const { newPassword } = req.body;

        if (!validateEmail(email)) return res.status(400).json({ status: 0, message: 'Email is INVALID' });
        if (!validatePassword(password)) return res.status(400).json({ status: 0, message: 'Invalid password' });

        const reset = await ResetPassword.findOne({ _id: resetId });

        if (!reset) {
            return res.status(400).json({ status: 0, message: 'Invalid reset link' });
        }

        if (reset.expire === true) {
            return res.status(400).json({ status: 0, message: 'Expire Link' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ status: 0, message: 'User not found' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await User.updateOne({ _id: user._id }, { password: hashedPassword });

        await ResetPassword.updateOne({ _id: reset._id }, { expire: true });

        res.status(201).json({ status: 1, success: 'Successfully Changed' });
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};

const user_logout_delete = async (req, res) => {
    try {
        const { userId } = req.decoded_token;
        const tokenToDelete = req.user_token;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 0, message: 'User not found' });
        }

        const isFalse = user.tokens && !user.tokens.includes(tokenToDelete);

        if (isFalse) {
            return res.status(400).json({ status: 0, message: 'You were logged out by this token, please log in again.' });
        }

        if (user.tokens) {
            user.tokens = user.tokens.filter(token => token !== tokenToDelete);
        }

        await user.save();

        return res.status(200).json({ status: 1, success: 'User logged out' });
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};

const user_update_patch = async (req, res) => {
    try {
        const { userId } = req.decoded_token;
        const data = Object.keys(req.body);

        // Validation
    if (!validateEmail(email)) return res.status(400).json({ status: 0, message: 'Email is INVALID' });
    if (!validatePassword(password)) return res.status(400).json({ status: 0, message: 'Invalid password' });
    if (!validateString(userName)) return res.status(400).json({ status: 0, message: 'Invalid username' });
    if (!validatePhone(phone)) return res.status(400).json({ status: 0, message: 'Invalid phone number' });json({ status: 0, message: phoneValidation.message });

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 0, message: 'User not found' });
        }

        const myFields = ['userName', 'password', 'email', 'phone'];

        if (Object.keys(data).length === 0) {
            return res.status(404).json({ status: 0, message: 'Not Found Data' });
        }

        myFields.forEach(field => {
            if (data.includes(field)) {
                user[field] = req.body[field];
            }
        });

        await user.save();

        return res.status(201).json({ status: 1, success: 'Successfully Changed' });
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};

const user_delete = async (req, res) => {
    try {
        const { userId } = req.decoded_token;

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ status: 0, message: 'Not Found User' });
        }

        return res.status(200).json({ status: 1, success: 'Successfully Deleted' });
    } catch (error) {
        res.status(500).json({ status: 0, error: error.message });
    }
};

const user_profile_get = async (req, res) => {
    try {
      const userId = req.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ status: 0, message: 'User not found' });
      }
  
      res.status(200).json({ status: 1, data: user });
    } catch (error) {
      res.status(500).json({ status: 0, message: 'Error fetching user profile', error: error.message });
    }
  };


module.exports = {
    user_register_post,
    user_login_post,
    user_data_get,
    user_resetPassword_post,
    user_updatepassword_patch,
    user_logout_delete,
    user_update_patch,
    user_delete,
    user_profile_get
};