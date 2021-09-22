'use strict';
const {
  Model
} = require('sequelize');
// const campaign_info = require('./campaign_info');
module.exports = (sequelize, DataTypes) => {
  class userAds extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.hasMany(campaign_info, {
      //   foreignKey: 'UserID',
      // })

      // this.belongsTo(user_ads, { foreignKey: "UserID", onDelete: 'CASCADE' })
    }


    // toJSON() {
    //   return {
    //     ...this.get(),
    //     id: undefined,
    //   }
    // }



  }
  userAds.init({

    // UserID: DataTypes.INTEGER,
    // User_Name: DataTypes.STRING,
    // email: DataTypes.STRING


    adsUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "User must have an ID" },
        notEmpty: { msg: "UserID must not be empty" },
      },
    },

    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "User must have a Name" },
        notEmpty: { msg: "Name must not be empty" },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "User must have an Email" },
        notEmpty: { msg: "Email must not be empty" },
      },
    },



  }, {
    sequelize,
    tableName: "userAds",
    modelName: 'userAds',
  });


  userAds.checkEmail = async (adsUserId, email) => {
    let userid = await userAds.findOne({ where: { adsUserId: adsUserId } });
    let userEmail = await userAds.findOne({ where: { email: email } });
    if (userid || userEmail) {
      // console.log("Data", userid)
      //return true if user email already exists
      return true
    } else {
      //return true if user email does not exists
      return false
    }
  }

  userAds.checkEmailAndId = async (adsUserId, email) => {
    let userid = await userAds.findOne({ where: { adsUserId: adsUserId, email: email } });
    // let userEmail = await User_Ads.findOne({ where: { email: email } });
    if (userid) {
      // console.log("Data", userid)
      //return true if user email already exists
      return true
    } else {
      //return true if user email does not exists
      return false
    }
  }


  return userAds;
};