'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Property.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    purpose: DataTypes.ENUM('sale', 'rent'),
    price: DataTypes.DECIMAL,
    bedrooms: DataTypes.INTEGER,
    bathrooms: DataTypes.INTEGER,
    areaSize: DataTypes.JSON,
    builtYear: DataTypes.INTEGER,
    imageUrl: DataTypes.ARRAY(DataTypes.STRING),
    location: DataTypes.JSON,
    features: DataTypes.ARRAY(DataTypes.STRING),
    propertyType: DataTypes.ENUM('House', 'Apartment', 'Condo'),
    status: DataTypes.ENUM('for-sale', 'sold', 'pending'),
  }, {
    sequelize,
    modelName: 'property',
  });
  return Property;
};