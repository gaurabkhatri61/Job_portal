'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('CompanyProfiles', 'logoUrl', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'website' // This will place the column after the website column
      });
      console.log('Successfully added logoUrl column');
    } catch (error) {
      console.error('Error adding logoUrl column:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('CompanyProfiles', 'logoUrl');
      console.log('Successfully removed logoUrl column');
    } catch (error) {
      console.error('Error removing logoUrl column:', error);
      throw error;
    }
  }
};
