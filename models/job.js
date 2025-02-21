'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Job extends Model {
        static associate(models) {
            Job.belongsTo(models.CompanyProfile, {
                foreignKey: 'companyProfileId',
                as: 'company',
                onDelete: 'CASCADE'
            });
            Job.hasMany(models.Application, {
                foreignKey: 'jobId',
                as: 'applications'
            });
        }
    }

    Job.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        requirements: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship'),
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        salary: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('open', 'closed'),
            allowNull: false,
            defaultValue: 'open'
        },
        companyProfileId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'CompanyProfiles',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'Job',
    });

    return Job;
};