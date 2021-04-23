// const { QueryTypes } = require('sequelize')
// QueryTypes.
module.exports = (sequelize, DataTypes) => {
    const BookedSlot = sequelize.define('BookedSlot', {
        isActive: {
            type: DataTypes.BOOLEAN,
            default: true
        },
        createdAt: {
            allowNull: false,
            defaultValue: sequelize.fn('now'),
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            defaultValue: sequelize.fn('now'),
            type: DataTypes.DATE
        }
    });

    BookedSlot.saveBooking = async (data) => {
        let booking = await BookedSlot.create({
            channelId: data.channelId,
            cityId: data.cityId,
            dayId: data.dayId,
            timeslotId: data.timeslotId,
            userId: data.userId,
            isActive: true
        });
        return booking;
    }

    BookedSlot.getBookingDetails = async (id) => {
        let query = `select u."name" as "userName", ch."name" as "channelName", ct."cityName", ct."stateName", ts."startTime",ts."endTime", d."day"
        from "BookedSlots" bs
        join "Users" u on bs."userId" = u.id
        join "Channels" ch on bs."channelId" = ch.id
        join "Timeslots" ts on bs."timeslotId" = ts.id
        join "Days" d on bs."dayId" = d.id
        join "Cities" ct on bs."cityId" = ct.id
        where bs.id = ${id}`;

        let bookingDetails = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

        return bookingDetails[0];
    }


    //saving customer info into respective channel tables eg: FaithChannel
    BookedSlot.saveCustomerInfo = async (data) => {
        let query = `insert into "${data.channelName}Channel"(
            "firstName", "lastName","email","companyName",
            "assignChannel","state","city","day","timeslot",
            "showName", "contactTitle","showDescription"
        )
        values (
            '${data.firstName}', '${data.lastName}', '${data.email}',
            '${data.companyName}', '${data.channelName}', '${data.stateName}',
            '${data.cityName}', '${data.day}', '${data.timeslot}',
            '${data.showName}', '${data.userName}', '${data.showDescription}'
        )`;

        let customerInfo = await sequelize.query(query, { type: sequelize.QueryTypes.INSERT });

        return customerInfo;
    }

    return BookedSlot;
}