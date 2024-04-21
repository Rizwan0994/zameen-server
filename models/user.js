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
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: { 
      type: DataTypes.STRING,
      unique: true // Adding unique constraint to email field
    },
    phoneNumber: DataTypes.STRING,
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
      defaultValue: 'https://i.postimg.cc/sxV3gm0H/User-Profile-PNG-Image-removebg-preview.png'
    },
    otp: DataTypes.STRING, 
    otpExpire: DataTypes.DATE,
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