'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.CompanyProfile, {
        foreignKey: 'userId',
        as: 'companyProfile'
      });
      User.hasMany(models.Application, {
        foreignKey: 'userId',
        as: 'applications'
      });
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('employer', 'jobseeker'),
      allowNull: false,
      defaultValue: 'jobseeker'
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};