const {property: PropertyModel,user:UserModel,payment:PaymentModel, product:ProductModel } = require('../models');
const { Op, where , Sequelize} = require('sequelize');
const logger = require('../logger'); // Import the logger
const createProperty = async (req, res) => {
  try {
    const userId = req.loginUser.id;
    
    const property = await PropertyModel.create({...req.body, userId});
    res.status(201).json({property,success:true, message: "Property created successfully!"});
  } catch (error) {
    res.status(500).json({ message: error.message,success:false });
  }
};

const getProperty = async (req, res) => {
  try {
    const property = await PropertyModel.findByPk(req.params.id, {
      where: { isDeleted: false },
      include: [{
        model: UserModel,
        as: 'user',
        attributes: ['name', 'email', 'phoneNumber', 'address', 'city', 'country','whatsappNumber','image','isAgent'], // specify the attributes you want to include
      }]
    });
    if (property) {
      res.status(200).json({property,success:true, message: "Property get successfully!"});
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//get property of a user
const getUserProperties = async (req, res) => {
  try {
    const userId = req.loginUser.id;
    const { page = 1, pageSize = 10 } = req.query;

    console.log("userId", userId);
    
    const offset = (page - 1) * pageSize;
    const limit = Number(pageSize);

    const { count, rows: properties } = await PropertyModel.findAndCountAll({ 
      where: { userId, isDeleted: false },
      include: [{
        model: UserModel,
        as: 'user',
        attributes: ['name', 'email', 'phoneNumber', 'address', 'city', 'country', 'whatsappNumber', 'image', 'isAgent'], // specify the attributes you want to include
      }],
      // offset,
      // limit
    });

    const totalPages = Math.ceil(count / pageSize);

    res.status(200).json({
      properties,
      success: true,
      message: "Properties retrieved successfully!",
      totalPages,
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
//get all properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await PropertyModel.findAll({
      where: {isDeleted:false},
      include: [{
        model: UserModel,
        as: 'user',
        attributes: ['name', 'email', 'phoneNumber', 'address', 'city', 'country','whatsappNumber','image','isAgent'], // specify the attributes you want to include
      }]
    });
    res.status(200).json({properties,success:true, message: "Property get successfully!"});
  } catch (error) {
    res.status(500).json({ message: error.message,success:false });
  }
};



const searchProperties = async (req, res) => {
  try {
    const { location, city, purpose, propertyType, areaMin, areaMax, areaUnit, page = 1, pageSize = 10 } = req.query;
    let { priceMin,priceMax } = req.query;
    //if price is is like 100,000 then it will be converted to 100000
    if (priceMin) {
      priceMin = priceMin.replace(/,/g, '');
    }
    if (priceMax) {
      priceMax = priceMax.replace(/,/g, '');
    }
    console.log("search query: ", req.query);
    const where = { isDeleted: false };

    if (location) {
      where['location.address'] = { [Op.iLike]: `%${location}%` };
    }
    if (city) {
      where['location.city'] = { [Op.iLike]: `%${city}%` };
    }
    if (propertyType) {
      where.propertyType = { [Op.iLike]: `%${propertyType}%` };
    }
    if (purpose) {
      where.purpose = { [Op.iLike]: `%${purpose.toLowerCase()}%` };
    }
    if (priceMin || priceMax) {
      if (priceMin) {
        where.price = { ...where.price, [Op.gte]: Number(priceMin) };
      }
      if (priceMax) {
        where.price = { ...where.price, [Op.lte]: Number(priceMax) };
      }
    }
    if ((areaMin || areaMax) && areaUnit) {
      if (areaMin) {
        where['areaSize.size'] = { ...where['areaSize.size'], [Op.gte]: Number(areaMin) };
      }
      if (areaMax) {
        where['areaSize.size'] = { ...where['areaSize.size'], [Op.lte]: Number(areaMax) };
      }
      where['areaSize.unit'] = areaUnit;
    }
    console.log("where: ", where);
    const offset = (page - 1) * pageSize;
    const limit = Number(pageSize);

    const { count, rows: properties } = await PropertyModel.findAndCountAll({ where,
      include: [{
        model: UserModel,
        as: 'user',
        attributes: ['name', 'email', 'phoneNumber', 'address', 'city', 'country','whatsappNumber','image','isAgent'], // specify the attributes you want to include
      }],
      
      offset, limit });

    const totalPages = Math.ceil(count / pageSize);

    res.status(200).json({
      properties,
      success: true,
      message: "Property get successfully!",
      totalPages,
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//find all cities list where all properties listed
const findCities = async (req, res) => {
  try {
    const cities = await PropertyModel.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.json('location.city')), 'city']],
    });

    const cityList = cities.map(city => city.getDataValue('city'));

    res.status(200).json({ cities: cityList, success: true, message: "Cities get successfully!" });
  } catch (error) {
    console.log("error", error);                        
    res.status(500).json({ message: error.message });
  }
};  

const findAddressesByCity = async (req, res) => {
  const { city } = req.body;

  try {
    const properties = await PropertyModel.findAll({
      where: Sequelize.where(
        Sequelize.json('location.city'),
        Op.iLike,
        `%${city}%`
      ),
      attributes: [
        [Sequelize.json('location.city'), 'city'],
        [Sequelize.json('location.address'), 'address']
      ],
    });

    const addresses = [...new Set(properties.map(property => property.getDataValue('address')))];

    res.status(200).json({ city, addresses, success: true, message: "Addresses fetched successfully!" });
  } catch (error) {
    console.log("error", error);                        
    res.status(500).json({ message: error.message });
  }
};



//property finder
const propertiesFinder = async (req, res) => {
  try {
    const { location, city} = req.query;
    const where = { isDeleted: false };

    if (location) {
      where['location.address'] = { [Op.iLike]: `%${location}%` };
    }
    if (city) {
      where['location.city'] = { [Op.iLike]: `%${city}%` };
    }
   

    const properties = await PropertyModel.findAll({ where,
      include: [{
        model: UserModel,
        as: 'user',
        attributes: ['name', 'email', 'phoneNumber', 'address', 'city', 'country','whatsappNumber','image','isAgent'], 
      }],
      });

   

    res.status(200).json({
      properties,
      success: true,
      message: "Properties get successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//delete property
const deleteProperty = async (req, res) => {
  try {
    const {propertyId} = req.body;
    const property = await PropertyModel.findByPk(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found', success: false });
    }

    property.isDeleted = true;
    await property.save();

    res.status(200).json({ success: true, message: "Property deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

//find latest 8 properties
const getLatestProperties = async (req, res) => {
  try {
    const properties = await PropertyModel.findAll({
      where: { isDeleted: false },
      include: [{
        model: UserModel,
        as: 'user',
        attributes: ['name', 'email', 'phoneNumber', 'address', 'city', 'country','whatsappNumber','image','isAgent'], // specify the attributes you want to include
      }],
      order: [['createdAt', 'DESC']],
      limit: 9
    });

    res.status(200).json({properties,success:true, message: "Property get successfully!"});
  } catch (error) {
    res.status(500).json({ message: error.message,success:false });
  }
}


const promoteProperty = async (req, res) => {
  try {
    const { propertyId,  productId} = req.body;
    console.log("promoteProperty req.body", req.body);
    // const userId = req.loginUser.id;
    const userId=req.loginUser.id||1;
    const paymentMethod = req.body.paymentMethod || 'Credit Card';
    // Check if the product exists and is a valid promotion type
    const product = await ProductModel.findByPk(productId);
    if (!product || !product.promotionType) {
      logger.warn(`Invalid product with ID: ${productId}`);
      return res.status(400).json({ success: false, message: 'Invalid product.' });
    }

    // Create a new payment record
    const payment = await PaymentModel.create({
      amount: product.price,
      paymentMethod: paymentMethod,
      paymentStatus: 'Paid',
      userId: userId,
      propertyId: propertyId
    });

    // Verify the payment status
    if (payment.paymentStatus !== 'Paid') {
      logger.warn(`Payment not successful for property ID: ${propertyId} by user ID: ${userId}`);
      return res.status(400).json({ success: false, message: 'Payment not successful.' });
    }

    // Calculate end date for promotion
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + product.durationDays);

    // Update the property with the promotion details
    const property = await PropertyModel.findByPk(propertyId);
    property.promotionType = product.promotionType;
    property.promotionEndDate = endDate;
    await property.save();

    logger.info(`Property ID: ${propertyId} promoted successfully for user ID: ${userId}`);

    res.status(200).json({ success: true, message: 'Property promoted successfully!', property });
  } catch (error) {
    logger.error(`Error promoting property ID: ${propertyId}`, { error: error });
    res.status(500).json({ success: false, message: error });
  }
};

//not in use...
const promotePropertyFun = async (propertyId, productId, userId = 1, paymentMethod = 'Credit Card') => {
  try {
    // Check if the product exists and is a valid promotion type
    const product = await ProductModel.findByPk(productId);
    if (!product || !product.promotionType) {
      logger.warn(`Invalid product with ID: ${productId}`);
      return { success: false, message: 'Invalid product.' };
    }

    // Create a new payment record
    const payment = await PaymentModel.create({
      amount: product.price,
      paymentMethod: paymentMethod,
      paymentStatus: 'Paid',
      userId: userId,
      propertyId: propertyId
    });

    // Verify the payment status
    if (payment.paymentStatus !== 'Paid') {
      logger.warn(`Payment not successful for property ID: ${propertyId} by user ID: ${userId}`);
      return { success: false, message: 'Payment not successful.' };
    }

    // Calculate end date for promotion
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + product.durationDays);

    // Update the property with the promotion details
    const property = await PropertyModel.findByPk(propertyId);
    property.promotionType = product.promotionType;
    property.promotionEndDate = endDate;
    await property.save();

    logger.info(`Property ID: ${propertyId} promoted successfully for user ID: ${userId}`);

    return { success: true, message: 'Property promoted successfully!', property };
  } catch (error) {
    logger.error(`Error promoting property ID: ${propertyId}`, { error: error.message });
    return { success: false, message: error.message };
  }
};


module.exports = {
  createProperty,
  getProperty,
    getAllProperties,
    searchProperties,
    getUserProperties,
  deleteProperty,
  getLatestProperties,
  promoteProperty,
  promotePropertyFun,
  propertiesFinder,
  findCities,
  findAddressesByCity
};



/* fututre work for optimization 
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

const searchProperties = async (req, res) => {
  try {
    const { location,city, propertyType, minPrice, maxPrice, minAreaSize, maxAreaSize } = req.query;

    const body = {
      query: {
        bool: {
          must: [],
          filter: []
        }
      }
    };

    if (location) {
      body.query.bool.must.push({
        match: { 'location.address': location }
      });
    }
    if (city) {
      body.query.bool.must.push({
        match: { 'location.city': city }
      });
    }

    if (propertyType) {
      body.query.bool.filter.push({
        term: { propertyType: propertyType }
      });
    }

    if (minPrice || maxPrice) {
      const priceRange = {};
      if (minPrice) {
        priceRange.gte = minPrice;
      }
      if (maxPrice) {
        priceRange.lte = maxPrice;
      }
      body.query.bool.filter.push({
        range: { price: priceRange }
      });
    }

    if ((minAreaSize || maxAreaSize) && areaUnit) {
      const areaSizeRange = {};
      if (minAreaSize) {
        areaSizeRange.gte = minAreaSize;
      }
      if (maxAreaSize) {
        areaSizeRange.lte = maxAreaSize;
      }
      body.query.bool.filter.push({
        nested: {
          path: "areaSize",
          query: {
            bool: {
              must: [
                { range: { "areaSize.size": areaSizeRange } },
                { match: { "areaSize.unit": areaUnit } }
              ]
            }
          }
        }
      });
    }

    const { body: { hits: { hits } } } = await client.search({
      index: 'properties',
      body: body
    });

    const properties = hits.map(hit => hit._source);
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

*/
