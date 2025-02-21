'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.User, {
        foreignKey: 'userId'
      });
      Application.belongsTo(models.Job, {
        foreignKey: 'jobId'
      });
    }
  }
  Application.init({
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'accepted', 'rejected'),
      defaultValue: 'pending'
    },
    coverLetter: DataTypes.TEXT,
    resumeUrl: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Jobs',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Application',
  });
  return Application;
};