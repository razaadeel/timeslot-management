'use strict';
const {
    Model
} = require('sequelize');
const AdsReporting = require('./AdsReporting');
module.exports = (sequelize, DataTypes) => {
    class StitchAdsInfo extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    StitchAdsInfo.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "User ID must have an ID" },
                notEmpty: { msg: "ID must not be empty" },
            },
        },
        videoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Ads Viewers must have an value" },
                notEmpty: { msg: "Ads Viewers must not be empty" },
            },
        },
        campaignId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign ID must have an ID" },
                notEmpty: { msg: "ID must not be empty" },
            },
        },
        airDate: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "Air Date must have an Date" },
                notEmpty: { msg: "Date must not be empty" },
            },
        },
        stateCode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a State Code" },
                notEmpty: { msg: "State Code must not be empty" },
            },
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a City Name" },
                notEmpty: { msg: "City Name must not be empty" },
            },
        },
        channelName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a channel Name" },
                notEmpty: { msg: "channel Name must not be empty" },
            },
        },
    }, {
        sequelize,
        modelName: 'StitchAdsInfo',
    });
    return StitchAdsInfo;
};