const {property: PropertyModel } = require('../models');

const createProperty = async (req, res) => {
  try {
    const property = await PropertyModel.create(req.body);
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
//get all properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await PropertyModel.findAll();
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty,
  getProperty,
    getAllProperties
};