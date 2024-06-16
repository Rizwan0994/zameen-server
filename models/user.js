'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        // define association here
        User.hasOne(models.verificationtoken, { foreignKey: 'userId', as: 'verificationtoken' });
        User.hasMany(models.property, { foreignKey: 'userId', as: 'properties' });
        User.hasMany(models.payment, { foreignKey: 'userId', as: 'payments' });
        User.hasOne(models.agency, { foreignKey: 'userId', as: 'agency' }); 
    }
    
  }
  User.init({
    name: DataTypes.STRING,
    email: { 
      type: DataTypes.STRING,
      unique: true // Adding unique constraint to email field
    },
    phoneNumber: DataTypes.STRING,
    address: DataTypes.STRING,
    whatsappNumber: DataTypes.STRING,
    country: DataTypes.STRING,
    city: DataTypes.STRING,
    address: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
     role: {
      type: DataTypes.STRING,
      allowNull: false,
     defaultValue: 'user'
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: 'https://github.com/shadcn.png'
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    otp: DataTypes.STRING, 
    otpExpire: DataTypes.DATE,
    isAgent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    termsConditions: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }, 
  }, {
    sequelize,
    modelName: 'user',
  });
  return User;
};

