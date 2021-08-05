const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserStatus extends Model {
        static associate(models) {
            UserStatus.belongsTo(models.User, {
                foreignKey: 'userStatus'
            });
        }
    }

    UserStatus.init({
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: "Status cannot be empty" },
                notEmpty: { msg: "Status cannot be empty" },
            },
        }
    }, {
        sequelize,
        modelName: 'UserStatus',
        tableName: 'UserStatus',

    });

    return UserStatus;
}