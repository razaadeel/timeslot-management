module.exports = (sequelize, DataTypes) => {
    // Timeslots table schema
    const Timeslot = sequelize.define('Timeslot', {
        startTime: {
            type: DataTypes.STRING
        },
        endTime: {
            type: DataTypes.STRING
        },
    }, {
        timestamps: false
    });

    Timeslot.associate = models => {
        Timeslot.hasMany(models.BookedSlot, {
            foreignKey: "timeslotId"
        });
    }

    // db query func for getting available slots according to channelId, cityId, dayId, timeslotId
    Timeslot.getAvailableSlots = async (dayId, cityId, channelId) => {
        let query = `
        select * from "Timeslots" tm
        where NOT EXISTS (
            select * from "BookedSlots" b
            where b."timeslotId" = tm.id
            and b."dayId" = ${dayId}
            and b."channelId" = ${channelId}
            and b."cityId" = ${cityId}
            and b."isActive" = 'true' 
        )
        order by tm.id asc`

        let availableTimeslots = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
        return availableTimeslots;
    }

    // db query func for getting available slots according to channelId, cityId, dayId, timeslotId
    Timeslot.getAvailableSlotsByCity = async (cityId, channelId) => {
        let query = `
        select * from "Timeslots" tm
        where NOT EXISTS (
            select * from "BookedSlots" b
            where b."timeslotId" = tm.id
            and b."channelId" = ${channelId}
            and b."cityId" = ${cityId}
            and b."isActive" = 'true' 
        )
        order by tm.id asc`

        let availableTimeslots = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
        return availableTimeslots;
    }

    return Timeslot;
};