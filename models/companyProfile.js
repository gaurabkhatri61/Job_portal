'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class CompanyProfile extends Model {
        static associate(models) {
            CompanyProfile.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
                onDelete: 'CASCADE'
            });
            CompanyProfile.hasMany(models.Job, {
                foreignKey: 'companyProfileId',
                as: 'jobs'
            });
        }
    }

    CompanyProfile.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        companyName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        industry: {
            type: DataTypes.STRING,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true
        },
        logoUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        employeeCount: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'CompanyProfile',
        tableName: 'CompanyProfiles'
    });

    return CompanyProfile;
};