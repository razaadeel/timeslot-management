module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
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

    User.associate = models => {
        User.hasMany(models.BookedSlot, {
            foreignKey: "userId"
        });
    }

    User.checkEmail = async (email) => {
        let user = await User.findOne({ where: { email: email } });
        if (user) {
            console.log(user)
            //return true if user email already exists
            return true
        } else {
            //return true if user email does not exists
            return false
        }
    }

    User.createUser = async (data) => {
        let user = await User.create({
            name: data.firstName + ' ' + data.lastName,
            email: data.email
        });
        return user
    }

    //getting user by email
    User.userByEmail = async (email) => {
        let user = await User.findOne({
            where: { email: email }
        });
        if (!user) {
            throw new Error("Email not found");
        }
        return user
    }

    User.userById = async (id) => {
        let user = await User.findOne({
            where: { id: id },
        });
        return user;
    }

    return User;
}