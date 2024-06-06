const {property: PropertyModel,user:UserModel } = require('../models');
const { Op, where } = require('sequelize');

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
    console.log("userId",userId)
    const properties = await PropertyModel.findAll({ 
      where: { userId,isDeleted: false },
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

    const properties = await PropertyModel.findAll({ where: where, offset: offset, limit: limit });

    res.status(200).json({ properties, success: true, message: "Property get successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      order: [['createdAt', 'DESC']],
      limit: 8
    });

    res.status(200).json({properties,success:true, message: "Property get successfully!"});
  } catch (error) {
    res.status(500).json({ message: error.message,success:false });
  }
}

module.exports = {
  createProperty,
  getProperty,
    getAllProperties,
    searchProperties,
    getUserProperties,
  deleteProperty,
  getLatestProperties
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
