'use strict';
const {
    Model,
    Op
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CampaignInfo extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            CampaignInfo.hasMany(models.AdsReporting, {
                foreignKey: 'campaignId'
            });
            CampaignInfo.hasMany(models.CampaignChannels, {
                foreignKey: 'campaignId',
            });
        }
    };
    CampaignInfo.init({
        campaignName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a Name" },
                notEmpty: { msg: "Camapign Name must not be empty" },
            },
        },
        organizationName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a Organization Name" },
                notEmpty: { msg: "Organization Name must not be empty" },
            },
        },
        stateCode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a State Code" },
                notEmpty: { msg: "State Code must not be empty" },
            },
            defaultValue: "0",
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a City Name" },
                notEmpty: { msg: "City Name must not be empty" },
            },
            defaultValue: "0",
        },
        videoDuration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Camapign must have an Video Duration" },
                notEmpty: { msg: "Video Duration  must not be empty" },
            },
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a Start Date" },
                notEmpty: { msg: "Start Date must not be empty" },
            },
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a End Date" },
                notEmpty: { msg: "End Date must not be empty" },
            },
        },
        totalAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a Total Amount" },
                notEmpty: { msg: "Total Amount must not be empty" },
            },
        },
        leftAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a Left Amount" },
                notEmpty: { msg: "Lenf Amount must not be empty" },
            },

        },
        videoUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a video Url" },
                notEmpty: { msg: "Video URL must not be empty" },
            },
        },
        priority: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Channel Priority must have a priority" },
                notEmpty: { msg: "priority must not be empty" },
            },
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "ChannelStatus must have a status" },
                notEmpty: { msg: "status must not be empty" },
            },
            defaultValue: 1,
        },
        adsUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Camapign must have an UserID" },
                notEmpty: { msg: "User ID must not be empty" },
            },
        },
    }, {
        sequelize,
        modelName: 'CampaignInfo',
        tableName: 'CampaignInfo'
    });

    CampaignInfo.checkName = async (adsUserId, campaignName) => {
        try {
            let campaign = await CampaignInfo.findOne({ where: { adsUserId, campaignName } });
            if (campaign) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error)
            throw Error(error)
        }
    }

    CampaignInfo.createCampaign = async (data) => {
        try {

            const db = require('./index.js');
            const CampaignChannels = db.CampaignChannels;

            let campaign = await CampaignInfo.create({
                campaignName: data.campaignName,
                organizationName: data.organizationName,
                stateCode: data.state,
                city: data.cityName,
                channelName: data.channel,
                totalAmount: data.budget,
                leftAmount: data.budget,
                startDate: data.startDate,
                endDate: data.endDate,
                videoUrl: data.videoUrl,
                adsUserId: data.adsUserId,
                videoDuration: data.duration,
                priority: data.priority,
                CampaignChannels: JSON.parse(data.channels)
            }, {
                include: [CampaignChannels]
            });
            return campaign;

        } catch (error) {
            console.log(error)
            throw Error(error)
        }
    }

    //returns campaigns with low priority
    CampaignInfo.getCampaignName = async (stateCode, city, channelName, duration) => {
        const db = require('./index.js');
        const CampaignChannels = db.CampaignChannels;
        let adsInfo = await CampaignInfo.findAll({
            where: {
                stateCode: stateCode, city: city, videoDuration: duration, status: 1, priority: "high",
                startDate: {
                    [Op.lte]: new Date(),
                    // [Op.gte]: new Date()
                },
                endDate: {
                    // [Model.lte]: new Date(),
                    [Op.gte]: new Date()
                },
                leftAmount: {
                    [Op.gte]: 0
                },
            },
            include: {
                model: CampaignChannels,
                where: {
                    channelName: channelName,
                }
            }
        });
        return adsInfo;
    }

    //returns campaigns with low priority
    CampaignInfo.getInternalCampaignName = async (stateCode, city, channelName, duration) => {
        const db = require('./index.js');
        const CampaignChannels = db.CampaignChannels;
        let adsInfo = await CampaignInfo.findAll({
            where: {
                stateCode: stateCode, city: city, videoDuration: duration, status: 1, priority: "low",
                startDate: {
                    [Op.lte]: new Date(),
                    // [Op.gte]: new Date()
                },
                endDate: {
                    // [Model.lte]: new Date(),
                    [Op.gte]: new Date()
                },
                leftAmount: 0,
            },
            include: {
                model: CampaignChannels,
                where: {
                    channelName: channelName,
                }
            }
        });
        return adsInfo;
    }

    return CampaignInfo;
};