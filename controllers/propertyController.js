const {property: PropertyModel } = require('../models');

const createProperty = async (req, res) => {
  try {
    const userId = req.loginUser.id;
    
    const property = await PropertyModel.create({...req.body, userId});
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProperty = async (req, res) => {
  try {
    const property = await PropertyModel.findByPk(req.params.id);
    if (property) {
      res.status(200).json(property);
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
    const properties = await PropertyModel.findAll({ where: { userId } });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//get all properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await PropertyModel.findAll();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const searchProperties = async (req, res) => {
  try {
    const { location, city, propertyType, minPrice, maxPrice, minAreaSize, maxAreaSize, areaUnit } = req.query;
    console.log("search query: ",req.query)
    const where = {};
    const areaSizeWhere = {};

    if (location) {
      where['location.address'] = location;
    }
    if (city) {
      where['location.city'] = city;
    }
    if (propertyType) {
      where.propertyType = propertyType;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        where.price.$lte = Number(maxPrice);
      }
    }
    if ((minAreaSize || maxAreaSize) && areaUnit) {
      if (minAreaSize) {
        where['areaSize.size'] = { ...where['areaSize.size'], '$gte': Number(minAreaSize) };
      }
      if (maxAreaSize) {
        where['areaSize.size'] = { ...where['areaSize.size'], '$lte': Number(maxAreaSize) };
      }
      where['areaSize.unit'] = areaUnit;
    }
    console.log("where: ",where)

    const properties = await PropertyModel.findAll({ where: where });

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty,
  getProperty,
    getAllProperties,
    searchProperties,
    getUserProperties
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
