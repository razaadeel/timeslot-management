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

    CityChannelStatus.getChannelStatus = (cityId, channelName) => {
        let channel = CityChannelStatus.findOne({
            where: { cityId: cityId, channelName: channelName }
        });

        return channel;
    }

    return CityChannelStatus;
};