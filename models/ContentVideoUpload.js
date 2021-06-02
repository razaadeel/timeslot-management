module.exports = (sequelize, DataTypes) => {
    const ContentVideoUpload = sequelize.define('ContentVideoUpload', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        inputName: DataTypes.STRING,
        outputName: DataTypes.STRING,
        destination: DataTypes.STRING,
    }, {
        timestamps: true
    });

    //Relating Day with BookedSlot table
    ContentVideoUpload.associate = models => {
        ContentVideoUpload.belongsTo(models.User, { foreignKey: "userId" });
    }

    ContentVideoUpload.saveVideoDetails = async (data) => {
        let video = await ContentVideoUpload.create({
            inputName: data.inputName,
            outputName: data.outputName,
            destination: data.destination,
            userId: data.userId
        });
        return video
    }

    return ContentVideoUpload;
}