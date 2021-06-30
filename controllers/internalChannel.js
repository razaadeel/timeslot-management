const db = require('../models');
const mediacp = require('../services/mediacp');

exports.createChannel = async (req, res) => {
    try {
        let { channels, stateCode, cityId } = req.body;
        let city = await db.City.cityDetails(cityId);

        // creating channnel in mediacp
        // mediacp.createChannelByForm({ channels, stateCode, city });

        //updating status and url of channel
        console.log(cityId)
        channels.forEach(async item => {
            let cityName = city.cityName.split(' ').join('').toLowerCase();
            let channelName = `${stateCode.toLowerCase() + '-' + cityName + '-' + item.toLowerCase()}`
            channelName = channelName.split(' ');
            channelName = channelName[0];

            let HslUrl = `https://5e1d043cba697.streamlock.net:443/${channelName}/${channelName}/playlist.m3u8`;
            await db.CityChannelStatus.updateChannel(cityId, item, HslUrl);
        });

        res.json({ message: 'Successful' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'internal server errro' });
    }
}