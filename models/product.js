'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  Product.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    description: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    promotionType: DataTypes.STRING, // e.g., 'Hot Listing', 'Super Host'
    durationDays: DataTypes.INTEGER, // Duration for the promotion in days
  }, {
    sequelize,
    modelName: 'product',
  });
  return Product;
};
