'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('properties', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      title: Sequelize.STRING,
      description: Sequelize.TEXT,
      purpose: Sequelize.ENUM('sale', 'rent'),
      price: Sequelize.DECIMAL,
      bedrooms: Sequelize.INTEGER,
      bathrooms: Sequelize.INTEGER,
      areaSize: Sequelize.JSON,
      builtYear: Sequelize.INTEGER,
      imageUrl: Sequelize.ARRAY(Sequelize.STRING),
      location: Sequelize.JSON,
      features: Sequelize.ARRAY(Sequelize.STRING),
      propertyType: Sequelize.ENUM('House', 'Apartment', 'Condo'),
      status: Sequelize.ENUM('for-sale', 'sold', 'pending'),
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('properties');
  }
};
