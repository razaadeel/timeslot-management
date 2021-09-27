'use strict';
const {
    Model,
    Op
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AdsReporting extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            AdsReporting.belongsTo(models.CampaignInfo, {
                foreignKey: 'campaignId'
            });
        }
    };
    AdsReporting.init({
        adSlot: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Ads Running Timing Slot must have an Slot info" },
                notEmpty: { msg: "Slot Info must not be empty" },
            },
        },
        adsViewers: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Ads Viewers must have an value" },
                notEmpty: { msg: "Ads Viewers must not be empty" },
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
        showName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Show Name must have an Name" },
                notEmpty: { msg: "Show Name must not be empty" },
            },
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "User ID must have an ID" },
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
        adStatus: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a status Name" },
                notEmpty: { msg: "status Name must not be empty" },
            },
        },

        campaignId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign Imust have an ID" },
                notEmpty: { msg: "ID must not be empty" },
            },
        },
    }, {
        sequelize,
        modelName: 'AdsReporting',
        tableName: 'AdsReporting',
    });

    AdsReporting.saveAdsReport = async (data) => {
        const db = require('./index.js');
        const CampaignInfo = db.CampaignInfo;
        try {
            await AdsReporting.create({
                adSlot: data.adSlot,
                adsViewers: data.viewers,
                videoId: data.videoId,
                showName: 'Not available',
                userId: data.userId,
                airDate: data.airDate,
                campaignId: data.campaignID,
                stateCode: data.state,
                city: data.city,
                channelName: data.channel,
                adStatus: "pending"
            });

            await CampaignInfo.update(
                { stitchingAmount: CampaignInfo.stitchingAmount - 6.25 },
                {
                    where: {
                        id: data.campaignID,
                        videoDuration: 60
                    }
                }
            );
            await CampaignInfo.update(
                { stitchingAmount: CampaignInfo.stitchingAmount - 3.13 },
                {
                    where: {
                        id: data.campaignID,
                        videoDuration: 30
                    }
                }
            );

        } catch (error) {
            throw Error(error)
        }
    }

    AdsReporting.removeAdReport = async (userId, airDate) => {
        try {
            const db = require('./index.js');
            const CampaignInfo = db.CampaignInfo;
            // await AdsReporting.destroy({ where: { userId, airDate } });
            //////////////

            let delCampaignID = await AdsReporting.findAll({
                where: { userId, airDate }
            }).then(async (result) => {
                return await AdsReporting.destroy({ where: { userId, airDate } })
                    .then((u) => { return result });
            });

            //////////////////////
            await CampaignInfo.update(
                { stitchingAmount: CampaignInfo.stitchingAmount + 6.25 },
                {
                    where: {
                        // id: [delCampaignID.campaignId],
                        id: {
                            [Op.in]: [delCampaignID.campaignId]
                        },
                        videoDuration: 60
                    }
                }
            );
            await CampaignInfo.update(
                { stitchingAmount: CampaignInfo.stitchingAmount + 3.13 },
                {
                    where: {
                        // id: delCampaignID.campaignId,
                        id: {
                            [Op.in]: [delCampaignID.campaignId]
                        },
                        videoDuration: 30
                    }
                }
            );


        } catch (error) {
            throw Error(error)
        }
    }


    // AdsReporting.removeAdReport = async (userId, airDate) => {
    //     try {
    //         await AdsReporting.destroy({ where: { userId, airDate } });
    //     } catch (error) {
    //         throw Error(error)
    //     }
    // }






    return AdsReporting;
};