const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");
const { user } = require("../models");
const Sequelize = require("sequelize");
const { Op } = require('sequelize');
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendEmailWithAttachment, sendForgotPasswordEmail } = require("../utils/Email");
const loginUser = asyncHandler(async (req, res) => {
  const userCredentials = req.body;

  const userEmail = userCredentials.email;
  const userPassword = userCredentials.password;

  // Find the user by email
  const userVar = await user.findOne({ where: { email: userEmail } });

  if (!userVar) {
    // User not found
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  // Compare passwords
  const isPasswordMatch = await bcrypt.compare(userPassword, userVar.password);

  if (isPasswordMatch) {
    const userResponse = {
      id: userVar.id,
      email: userVar.email,
      name: userVar.name,
      phoneNumber: userVar.phoneNumber,
      role: userVar.role,
      image: userVar.image,
    };
    const token = jwt.sign({ id: userVar.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    // Passwords match, login successful
    res.status(200).json({ message: "Login successful", user: userResponse, token});
  } else {
    // Passwords do not match
    res.status(401).json({ message: "Invalid email or password" });
  }
});

const registerUser = async (req, res) => {
  const { name, email, phoneNumber, password, role, image, termsConditions } = req.body;
  //validate user input
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await user.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await user.create({
      email,
      password: hashedPassword,
      name: name,
      phoneNumber: phoneNumber,
      role: role,
      image: image,
      termsConditions: termsConditions

    });

    const userData = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      image: newUser.image,
      phoneNumber: newUser.phoneNumber,
      name: newUser.name,
    };

    res
      .status(201)
      .json({ message: "User registered successfully", user: userData });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//forgot password..........
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email)

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  // Generate a 5-digit OTP
  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  user.otp = otp;
  user.otpExpire = Date.now() + 300000; // OTP expires after 5 minutes
  await user.save();

  await sendForgotPasswordEmail(user.email, otp);

  res.status(200).json({ success: true, message: 'OTP sent to email' });
};

const resendOtp = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  // if (Date.now() < user.otpExpire) {
  //   return res.status(400).json({ success: false, message: 'OTP is still valid' });
  // }

  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  user.otp = otp;
  user.otpExpire = Date.now() + 300000; // OTP expires after 5 minutes
  await user.save();

  await sendForgotPasswordEmail(user.email, otp);

  res.status(200).json({ success: true, message: 'New OTP sent to email' });
};

const verifyOtp = async (req, res) => {
  const { otp, email } = req.body;
  console.log("verifyOtp->: ", otp, email)

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ success: false, message: 'OTP is invalid' });
  }

  if (Date.now() > user.otpExpire) {
    return res.status(400).json({ success: false, message: 'OTP has expired' });
  }

  user.otp = null;
  user.otpExpire = null;
  await user.save();

  res.status(200).json({ success: true, message: 'OTP is valid' });
};

const resetPassword = async (req, res) => {
  const { password, confirmPassword, email } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.otp = null;
  user.otpExpire = null;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully' });
};


//forgot passowrd......... end

const loginwithGoogle = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  if (!email) {
    return res.status(400).send({ message: "User data are required!" });
  }

  const isEmailExists = await User.findOne({ where: { email } });
  if (isEmailExists) {
    return res.status(200).send({ message: "Login Successful!", user: isEmailExists });
  }

  res.status(404).json({ message: "notFound!" });

}



const getUserProfile = asyncHandler(async (req, res) => {
  // Implementation for getting user profile
  res.status(200).json({ message: "User profile fetched successfully" });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const data = req.body;
  const userId = data.userId;
  ////console.log(data);
  // Find the user by userId
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update user's fields
  user.firstName = data.fullName;
  user.username = data.username;
  user.email = data.email;
  user.phoneNumber = data.phoneNumber;
  user.address = data.address;
  user.image = data.image;

  try {
    // Save the changes to the database
    await user.save();

    const data = {
      companyName: user.companyName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      id: user.id,
      role: user.role,
      image: user.image,
    }
    res.status(200).json({ message: "User profile updated successfully", user: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user profile" });
  }
});

const deleteUserProfile = asyncHandler(async (req, res) => {
  const data = req.body;
  const userId = data.userId;

  try {
    // Find the user by userId
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await user.destroy();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user profile" });
  }
});








module.exports = {
  loginUser,
  registerUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendOtp,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  loginwithGoogle,

};
