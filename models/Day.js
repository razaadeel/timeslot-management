module.exports = (sequelize, DataTypes) => {
    const Day = sequelize.define('Day', {
        day: {
            type: DataTypes.STRING
        },
    }, {
        timestamps: false
    });

    //Relating Day with BookedSlot table
    Day.associate = models => {
        Day.hasMany(models.BookedSlot, {
            foreignKey: "dayId"
        });
    }

    Day.allDays = async (req, res) => {
        let days = await Day.findAll();
        return days;
    }

    return Day;
}