const asyncHandler = require("express-async-handler");
const {
  user:UserModel,

} = require("../models");
const bcrypt = require("bcrypt");




//reset password from Profile settings
const resetProfilePassword = asyncHandler(async (req, res) => {
  const {  oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.loginUser.id;


  if (!userId || !oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'Data Missing!' });
  }
  // Find the user by userId
  const user = await UserModel.findByPk(userId);
  if (!user) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }

  // Compare old password with the stored password
  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatch) {
    return res.status(400).json({ success: false, message: 'Old password is incorrect' });
  }

  // Check if new password and confirm password match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New password and confirm password do not match' });
  }

  // Update the password with the new password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully' });
});
const updateUserProfile = asyncHandler(async (req, res) => {
  const data = req.body;
  const userId = data.userId;
  ////console.log(data);
  // Find the user by userId
  const user = await UserModel.findByPk(userId);
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
    await user.update();

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
    const user = await UserModel.findByPk(userId);
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
  resetProfilePassword,
  updateUserProfile,
  deleteUserProfile,


};
