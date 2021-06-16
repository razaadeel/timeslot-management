module.exports = (sequelize, DataTypes) => {
    const City = sequelize.define('City', {
        stateName: {
            type: DataTypes.STRING
        },
        stateCode: {
            type: DataTypes.STRING
        },
        cityName: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: false
    });

    City.associate = models => {
        City.hasMany(models.BookedSlot, {
            foreignKey: "cityId"
        });

        City.hasMany(models.CityChannelStatus, {
            foreignKey: "cityId"
        });
    }

    City.allStates = async () => {
        const query = 'select DISTINCT on( "stateName") "stateName" state, "stateCode" code from "Cities"'
        let states = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
        return states;
    }

    City.cityByStateCode = async (stateCode) => {
        let cities = await City.findAll({
            where: { stateCode },
            order: [['cityName', 'ASC']]
        });
        return cities;
    }

    return City;
}