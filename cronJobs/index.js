const cron = require('node-cron');
const {property: PropertyModel } = require('../models');
const { Op } = require('sequelize');
const logger = require('../logger'); // Import the logger

const setupCronJobs = () => {
  cron.schedule('0 0 * * *', async () => { // Runs every day at midnight
    try {
      const now = new Date();
      const result = await PropertyModel.update(
        { promotionType: null, promotionEndDate: null },
        { where: { promotionEndDate: { [Op.lte]: now } } }
      );
      logger.info('Promotion expiry check completed.', { updatedProperties: result[0] });
    } catch (error) {
      logger.error('Error during promotion expiry check:', { error: error.message });
    }
  });

  // Add more cron jobs here as needed
};

module.exports = setupCronJobs;
