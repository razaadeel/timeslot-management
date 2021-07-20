module.exports = (sequelize, DataTypes) => {
    const CityChannelStatus = sequelize.define('CityChannelStatus', {
        cityId: {
            type: DataTypes.INTEGER
        },
        channelName: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'offline'
        },
        scheduling: {
            type: DataTypes.STRING,
            defaultValue: 'manual'
        },
        HslUrl: {
            type: DataTypes.STRING,
            defaultValue: ''
        }
    }, {
        timestamps: true,
        tableName: 'CityChannelStatus'
    });

    CityChannelStatus.getChannelStatus = async (cityId, channelName) => {
        let channel = await CityChannelStatus.findOne({
            where: { cityId: cityId, channelName: channelName }
        });

        return channel;
    }

    CityChannelStatus.getCityChannels = async (cityId) => {
        let channels = await CityChannelStatus.findAll({
            where: { cityId: cityId, status: 'offline' }
        });
        return channels;
    }

    CityChannelStatus.updateChannelStatus = async (cityId) => {
        await CityChannelStatus.update(
            { status: 'active' },
            { where: { cityId: cityId } }
        );
    }

    CityChannelStatus.updateChannelHslUrl = async (cityId, channel, url) => {
        await CityChannelStatus.update(
            { HslUrl: url },
            { where: { cityId: cityId, channelName: channel } }
        );
    }

    CityChannelStatus.activeStates = async () => {
        let query = `select DISTINCT on (ct."stateName") * from "CityChannelStatus" ccs
        join "Cities" ct on ct.id = ccs."cityId"
        where ccs."status" = 'active';`
        let states = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
        return states;
    }

    CityChannelStatus.activeCitiesOfState = async (stateCode) => {
        let query = `select DISTINCT on ("cityId") * from "CityChannelStatus" ccs
                    join "Cities" ct on ct.id = ccs."cityId"
                    where ct."stateCode" = '${stateCode}' and ccs.status = 'active';`
        let cities = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
        return cities;
    }

    CityChannelStatus.allActiveChannels = async () => {
        let channels = await CityChannelStatus.findAll({
            where: { status: 'active' },
            attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('channelName')), 'channelName'],
            ]
        })
        return channels;
    }

    CityChannelStatus.activeChannelsOfCity = async (cityId) => {
        let query = `select * from "CityChannelStatus" ccs
                    where ccs."cityId" = ${cityId} and ccs.status = 'active';`
        let channels = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
        return channels;
    }

    CityChannelStatus.offlineChannelsOfCity = async (cityId) => {
        let query = `select * from "CityChannelStatus" ccs
                    where ccs."cityId" = ${cityId} and ccs.status = 'offline';`
        let channels = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
        return channels;
    }

    CityChannelStatus.updateChannel = async (cityId, channelName, HslUrl) => {
        CityChannelStatus.update(
            { status: 'active', HslUrl: HslUrl },
            { where: { cityId: cityId, channelName: channelName } }
        );
    }

    return CityChannelStatus;
};