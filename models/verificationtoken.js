'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VerificationToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      VerificationToken.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
    }
  }
  VerificationToken.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // name of your user table
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'verificationtoken',
  });
  return VerificationToken;
};