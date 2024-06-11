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
      this.hasMany(models.payment, { foreignKey: 'propertyId', as: 'payments' });
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
    purpose: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    bedrooms: DataTypes.INTEGER,
    bathrooms: DataTypes.INTEGER,
    areaSize: DataTypes.JSON,
    builtYear: DataTypes.INTEGER,
    imageUrl: DataTypes.ARRAY(DataTypes.STRING),
    videoUrl: DataTypes.ARRAY(DataTypes.STRING),
    contactNumber: DataTypes.STRING,
    contactEmail: DataTypes.STRING,
    whatsAppNumber: DataTypes.STRING,
    location: DataTypes.JSON,
    features: DataTypes.JSON,
    propertyType: DataTypes.STRING,
    status: DataTypes.STRING,
    builddate: DataTypes.DATE,    
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    promotionType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    promotionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'property',
  });
  return Property;
};

