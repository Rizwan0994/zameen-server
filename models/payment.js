'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      this.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
      this.belongsTo(models.property, { foreignKey: 'propertyId', as: 'property' });

      
    }
  }
  Payment.init({
    amount: DataTypes.DECIMAL,
    paymentMethod: DataTypes.STRING,
    paymentStatus: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'payment',
  });
  return Payment;
};
