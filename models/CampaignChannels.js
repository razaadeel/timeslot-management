'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CampaignChannels extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            CampaignChannels.belongsTo(models.CampaignInfo, {
                foreignKey: 'campaignId'
            });
        }
    };

    CampaignChannels.init({
        channelName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "channel Name must have an name" },
                notEmpty: { msg: "name must not be empty" },
            },
        },
        campaignId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign Imust have an ID" },
                notEmpty: { msg: "ID must not be empty" },
            },
        }
    }, {
        sequelize,
        modelName: 'CampaignChannels',
    });

    return CampaignChannels;
};