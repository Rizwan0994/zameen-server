const asyncHandler = require("express-async-handler");
const {
  user:UserModel,
  agency: AgencyModel,
  property: PropertyModel                               
} = require("../models");
const bcrypt = require("bcrypt");
const { Op, where , Sequelize} = require('sequelize');



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

const getUserAgency = asyncHandler(async (req, res) => {
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
    // filter by category,city,companyName
    const { category,city, companyName ,location,page = 1, pageSize = 10 } = req.query;
   const where = {};
   let agencyAddress = location;                                           

    if (category) {
      where.category = { [Op.iLike]: `%${category}%` };
    } 
    if (city) {
      where.city = { [Op.iLike]: `%${city}%` };                   
    }
    if (companyName) {
      where.companyName = { [Op.iLike]: `%${companyName}%` };

    }
    if (agencyAddress) {
      where.agencyAddress = { [Op.iLike]: `%${agencyAddress}%` };
    }
    
    const offset = (page - 1) * pageSize;
    const limit = Number(pageSize);

    const {count, rows:agencies} = await AgencyModel.findAndCountAll({                      
      where,
      offset,
      limit
    });
    const totalPages = Math.ceil(count / pageSize);


    res.status(200).json({ success: true, agencies, message: 'agency get successfully', totalPages, totalCount: count});
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Failed to get agencies' });
  }
});
const getAllAgenciesCities = asyncHandler(async (req, res) => {
  try {
    const cityObjects = await AgencyModel.findAll({
      attributes: ['city'],
      group: ['city']
    });

    // Convert cities to camel case and remove duplicates
    const agencyCities = [...new Set(cityObjects.map(cityObject => {
      return cityObject.city.charAt(0).toUpperCase() + cityObject.city.slice(1).toLowerCase();
    }))];

    res.status(200).json({ success: true, agencyCities, message: 'Cities get successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Failed to get cities' });
  }
});

const findAgencyAddressAndCompanyByCity = asyncHandler(async (req, res) => {
  const { city } = req.body;
  try {
    const agencies = await AgencyModel.findAll({
      where: {
        agencyAddress: {
          [Op.iLike]: `%${city}%`
        }
      },
      attributes: ['agencyAddress', 'companyEmail']
    });

    res.status(200).json({ success: true, agencies, message: 'Agency address and company email get successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Failed to get agency address and company email' });
  }
}); 

//get agency by agency id
const getAgencyById = asyncHandler(async (req, res) => {
  const { id } = req.body;
  try {
    const agency = await AgencyModel.findByPk(id);
    let properties = [];
    if (agency) {
      properties = await PropertyModel.findAll({ where: { userId: agency.userId } });
      console.log("properties: ", properties);
    }

    // Initialize counters
    let totalSell = 0;
    let totalRent = 0;
    let propertySell = {};
    let propertyRent = {};

    // Iterate through properties to count based on status and type
    properties.forEach(property => {
      if (!property.isDeleted) {
        if (property.status === 'sale') {
          totalSell++;
          propertySell[property.propertyType] = (propertySell[property.propertyType] || 0) + 1;
        } else if (property.status === 'rent') {
          totalRent++;
          propertyRent[property.propertyType] = (propertyRent[property.propertyType] || 0) + 1;
        }
      }
    });
    const recentProperties = properties.slice(0, 4);

    res.status(200).json({
      success: true,
      totalSell,
      totalRent,
      propertySell,
      propertyRent,
      agency,
      recentProperties,
      message: 'Agency get successfully'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Failed to get agency' });
  }
});
                                                                                     
  
module.exports = {
  resetProfilePassword,
  updateUserProfile,
  deleteUserProfile,


  addOrUpdateAgency,
  getUserAgency,
  getAllAgencies,
  getAllAgenciesCities,
  findAgencyAddressAndCompanyByCity,
  getAgencyById


};
