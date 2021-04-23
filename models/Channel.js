module.exports = (sequelize, DataTypes) => {
    const Channel = sequelize.define('Channel', {
        name: {
            type: DataTypes.STRING
        },
    }, {
        timestamps: false
    });

    Channel.associate = models => {
        Channel.hasMany(models.BookedSlot,{
            foreignKey: "channelId"
        });
    }

    return Channel;
};