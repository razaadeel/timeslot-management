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

    return CityChannelStatus;
};