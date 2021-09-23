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
            // CampaignInfo.hasMany(models.AdsReporting, {
            //     foreignKey: 'campaignId'
            // });

            CampaignInfo.belongsTo(models.userAds, {
                foreignKey: 'serverUserId'
            });


            CampaignInfo.hasMany(models.CampaignChannels, {
                foreignKey: 'campaignId',
            });

            CampaignInfo.hasMany(models.AdsReporting, {
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
            type: DataTypes.DOUBLE,
            allowNull: false,
            validate: {
                notNull: { msg: "Campaign must have a Total Amount" },
                notEmpty: { msg: "Total Amount must not be empty" },
            },
        },
        leftAmount: {
            type: DataTypes.DOUBLE,
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
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Camapign must have an UserID" },
                notEmpty: { msg: "User ID must not be empty" },
            },
        },
        serverUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Camapign must have an server UserID" },
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
                // channelName: data.channel,
                totalAmount: data.budget,
                leftAmount: data.budget,
                startDate: data.startDate,
                endDate: data.endDate,
                videoUrl: data.videoUrl,
                videoDuration: data.duration,
                priority: data.priority,
                CampaignChannels: JSON.parse(data.channels),
                // CampaignChannels: data.channels
                adsUserId: data.adsUserId,
                serverUserId: data.serverUserId,
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
    CampaignInfo.getCampaignName = async (stateCode, city, channelName, duration, priority, airDate) => {
        const db = require('./index.js');
        const CampaignChannels = db.CampaignChannels;
        console.log('getCampaignName model', stateCode, city, channelName, duration, priority, airDate)
        let adsInfo = await CampaignInfo.findAll({
            where: {
                stateCode: { [Op.iLike]: stateCode },
                city: { [Op.iLike]: city },
                videoDuration: duration,
                status: 1,
                priority: priority,
                startDate: {
                    [Op.lte]: new Date(),
                },
                endDate: {
                    [Op.gte]: new Date(),
                    [Op.gte]: airDate
                },

                [Op.or]: [
                    {
                        // 60
                        [Op.and]: [
                            {
                                leftAmount:
                                {
                                    [Op.gte]: 6.25
                                }
                            },
                            {
                                videoDuration:
                                {
                                    [Op.eq]: 60
                                }
                            },
                        ],
                        //    
                    },

                    {
                        // 30
                        [Op.and]: [
                            {
                                leftAmount:
                                {
                                    [Op.gte]: 3.13
                                }
                            },
                            {
                                videoDuration:
                                {
                                    [Op.eq]: 30
                                }
                            },
                        ],


                    }
                ],



            },


            include: {
                model: CampaignChannels,
                where: {
                    channelName: { [Op.iLike]: channelName }
                }
            }
        });
        return adsInfo;
    }

    //returns campaigns with low priority
    CampaignInfo.getInternalCampaignName = async (stateCode, city, channelName, duration, priority, airDate) => {
        const db = require('./index.js');
        const CampaignChannels = db.CampaignChannels;
        let adsInfo = await CampaignInfo.findAll({
            where: {
                stateCode: { [Op.iLike]: stateCode },
                city: { [Op.iLike]: city },
                videoDuration: duration,
                status: 1,
                priority: priority,
                startDate: {
                    [Op.lte]: new Date(),
                },
                endDate: {
                    [Op.gte]: new Date(),
                    [Op.gte]: airDate
                },


                leftAmount: 0


            },
            include: {
                model: CampaignChannels,
                where: {
                    channelName: { [Op.iLike]: channelName }
                }
            }
        });
        return adsInfo;
    }


    // Check if ad is run and cut the charges
    CampaignInfo.checkAdRun = async () => {
        // let query = `update "BookedSlots"
        // set "isActive" = 'false',
        // "updatedAt" = now()
        // where not exists (
        //     select from "ContentVideoUploads" cv
        //     where "BookedSlots"."userId" = cv."userId"
        // )
        // and "BookedSlots"."createdAt" <= now() - interval '15 days'
        // and "BookedSlots"."isActive" = 'true'
        // RETURNING *`

        let query = `with u as (
            update "AdsReporting"
                set "adStatus"  = 'run'
                where "adStatus"  = 'pending'and "airDate" < NOW()
            RETURNING "AdsReporting"."campaignId"
           )
      update "CampaignInfo" ci
          set "leftAmount"= (CASE WHEN "ci"."videoDuration" = '60' THEN "ci"."leftAmount" - "uc"."cnt" * 6.25 ELSE ci."leftAmount" - uc.cnt * 3.13 END)
          from (select "u"."campaignId", count(*) as cnt
                from u
                group by "u"."campaignId"
               ) uc
           where "ci"."id" = "uc"."campaignId";`

        let updatedRecord = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
        return updatedRecord;
    }



    CampaignInfo.getActiveCampaignByID = async (serverUserId) => {
        try {
            const db = require('./index.js');
            const CampaignChannels = db.CampaignChannels;
            const AdsReporting = db.AdsReporting;

            const campaignReqData = await CampaignInfo.findAll({
                where: {
                    serverUserId: serverUserId,
                    // startDate: {
                    //     [Op.lte]: new Date(),
                    // },
                    endDate: {
                        [Op.gte]: new Date(),
                    },

                    [Op.or]: [
                        {
                            // 60
                            [Op.and]: [
                                {
                                    leftAmount:
                                    {
                                        [Op.gte]: 6.25
                                    }
                                },
                                {
                                    videoDuration:
                                    {
                                        [Op.eq]: 60
                                    }
                                },
                            ],
                            //    
                        },

                        {
                            // 30
                            [Op.and]: [
                                {
                                    leftAmount:
                                    {
                                        [Op.gte]: 3.13
                                    }
                                },
                                {
                                    videoDuration:
                                    {
                                        [Op.eq]: 30
                                    }
                                },
                            ],


                        }
                    ],



                },
                include: [
                    {

                        model: CampaignChannels,
                        // as: 'CampaignChannels',
                        // required: false,
                    },

                    {
                        model: AdsReporting,
                        // as: 'CampaignChannels',
                        required: false,
                        where: { adStatus: "run" }
                    }

                ],



            })

            return campaignReqData
        }
        catch (error) {
            console.log(error)
            throw Error(error)
        }
    }


    CampaignInfo.getUnActiveCampaignByID = async (serverUserId) => {
        try {
            const db = require('./index.js');
            const CampaignChannels = db.CampaignChannels;
            const AdsReporting = db.AdsReporting;
            const campaignReqData = await CampaignInfo.findAll({
                where: {
                    serverUserId: serverUserId,


                    [Op.or]: [
                        {
                            endDate:
                            {
                                [Op.lt]: new Date()
                            }
                        },
                        {
                            [Op.or]: [
                                {
                                    // 60
                                    [Op.and]: [
                                        {
                                            leftAmount:
                                            {
                                                [Op.lt]: 6.25
                                            }
                                        },
                                        {
                                            videoDuration:
                                            {
                                                [Op.lt]: 60
                                            }
                                        },
                                    ],
                                    //    
                                },

                                {
                                    // 30
                                    [Op.and]: [
                                        {
                                            leftAmount:
                                            {
                                                [Op.lt]: 3.13
                                            }
                                        },
                                        {
                                            videoDuration:
                                            {
                                                [Op.eq]: 30
                                            }
                                        },
                                    ],


                                }
                            ],

                        }
                    ]

                },
                // include: CampaignChannels,
                include: [
                    {

                        model: CampaignChannels,
                        // as: 'CampaignChannels',
                        // required: false,
                    },

                    {
                        model: AdsReporting,
                        // as: 'CampaignChannels',
                        required: false,
                        where: { adStatus: "run" }
                    }

                ],

                // include: [{
                //     model: AdsReporting,
                //     // as: 'CampaignChannels',
                //     required: false,
                //     where: { adStatus: "run" }
                // }]


            })
            return campaignReqData
        }
        catch (error) {
            console.log(error)
            throw Error(error)
        }
    }



    CampaignInfo.pauseCampaign = async (campaignId) => {
        await CampaignInfo.update(
            { status: 0 },
            { where: { id: campaignId } }
        )
        return true;
    }

    return CampaignInfo;
};