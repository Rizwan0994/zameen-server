const asyncHandler = require("express-async-handler");
const {
  user:UserModel,
  agency: AgencyModel
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
  const userId = req.loginUser.id;

  // Find the user by userId
  const user = await UserModel.findByPk(userId);
  if (!user) {
    return res.status(404).json({success:false, message: "User not found" });
  }

  try {
    // Update and save the changes to the database
    await user.update({
      name: data.name,
      phoneNumber: data.phoneNumber,
      image: data.image,
      address: data.address,
      country: data.country,
      city: data.city,
      whatsappNumber: data.whatsappNumber
    });

    res.status(200).json({ 
      success: true, 
      message: "User profile updated successfully", 
      user: {
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        image: user.image,
        address: user.address,
        country: user.country,
        city: user.city,
        whatsappNumber: user.whatsappNumber
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({success:false, message: "Failed to update user profile" });
  }
});

const deleteUserProfile = asyncHandler(async (req, res) => {
  const data = req.body;
  const userId = req.loginUser.id;

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




const addOrUpdateAgency = asyncHandler(async (req, res) => {
  const userId = req.loginUser.id;
  const {
    city,
    agencyName,
    companyEmail,
    agencyAddress,
    agencyImage,
    description,
    ownerName,
    message,
    designation,
    ownerPicture
  } = req.body;

  console.log("agency body: ",req.body);

  // Find the user by userId
  const user = await UserModel.findByPk(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Check if user is an agent
  if (!user.isAgent) {
    return res.status(400).json({ success: false, message: 'User is not an agent' });
  }

  try {
    // Create or update agency
    const [agency, created] = await AgencyModel.upsert({
      userId,
      city,
      agencyName,
      companyEmail,
      agencyAddress,
      agencyImage,
      description,
      ownerName,
      message,
      designation,
      ownerPicture
    }, {
      returning: true
    });

    console.log("agency db: ",agency);

    res.status(200).json({
      success: true,
      message: created ? 'Agency information added successfully' : 'Agency information updated successfully',
      agency
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Failed to add or update agency information' });
  }
});

const getAgency = asyncHandler(async (req, res) => {
  const userId = req.loginUser.id;

  // Find the user by userId
  const user = await UserModel.findByPk(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Check if user is an agent
  if (!user.isAgent) {
    return res.status(400).json({ success: false, message: 'User is not an agent' });
  }

  // Find the agency by userId
  const agency = await AgencyModel.findOne({
    where: {
      userId
    }
  });

  if (!agency) {
    return res.status(404).json({ success: false, message: 'Agency information not found' });
  }

  res.status(200).json({ success: true, agency });
});


//get all agencies
const getAllAgencies = asyncHandler(async (req, res) => {
  try {
    const agencies = await AgencyModel.findAll();
    res.status(200).json({ success: true, agencies, message: 'agency get successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Failed to get agencies' });
  }
});
module.exports = {
  resetProfilePassword,
  updateUserProfile,
  deleteUserProfile,
  addOrUpdateAgency,
  getAgency,
  getAllAgencies


};
