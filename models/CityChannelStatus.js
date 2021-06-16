module.exports = (sequelize, DataTypes) => {
    const CityChannelStatus = sequelize.define('CityChannelStatus', {
        channelName: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING
        },
        scheduling: {
            type: DataTypes.STRING
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