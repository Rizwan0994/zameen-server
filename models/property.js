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
      this.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
    }
  }
  Property.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    videoUrl: DataTypes.ARRAY(DataTypes.STRING),
    contactNumber: DataTypes.STRING,
    contactEmail: DataTypes.STRING,
    location: DataTypes.JSON,
    features: DataTypes.ARRAY(DataTypes.STRING),
    propertyType: DataTypes.STRING,
    status: DataTypes.ENUM('for-sale', 'sold', 'pending'),
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'property',
  });
  return Property;
};