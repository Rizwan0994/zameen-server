'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Agency extends Model {
    static associate(models) {
      // define association here
      Agency.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
    }
  }
  Agency.init({
    userId: DataTypes.INTEGER,
    city: DataTypes.STRING,
    agencyName: DataTypes.STRING,
    companyEmail: DataTypes.STRING,
    agencyAddress: DataTypes.STRING,
    agencyImage: DataTypes.STRING,
    description: DataTypes.STRING,
    ownerName: DataTypes.STRING,
    message: DataTypes.STRING,
    designation: DataTypes.STRING,
    ownerPicture: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'agency',
  });
  return Agency;
};