const axios = require('axios');
const parseString = require('xml2js').parseString;
const slack = require('../utils/slack_logs');
const mailgun = require('../services/mailgun');

const env = process.env.NODE_ENV || 'development';

const config = env === 'development' ?
    require(__dirname + '/../config/configDev.js')//import in dev 
    : require(__dirname + '/../config/config.js'); // import in prod

exports.createChannel = async (body) => {
    try {

        let successfulChannels = [];
        let errorChannels = [];
        body.channels.forEach(async (channel, index) => {
            let cityName = body.city;
            cityName = cityName.split(' ').join('').toLowerCase();
            let channelName = `test-${(body.stateCode).toLowerCase() + '-' + cityName + '-' + (channel.channelName).toLowerCase()}`
            channelName = channelName.split(' ');
            channelName = channelName[0];

            let HSL_URL = `https://5e1d043cba697.streamlock.net:443/${channelName}/${channelName}/playlist.m3u8`;

            let xml = `<?xml version='1.0'?>
            <methodCall>
                <methodName>admin.service_create</methodName>
                <params><param><value><struct>
                    <member>
                        <name>auth</name>
                        <value><string>${config.mediacp.apiKey}</string></value>
                    </member>
                    <member>
                        <name>username</name>
                        <value><string>${config.mediacp.username}</string></value>
                    </member>
                    <member>
                        <name>plugin</name>
                        <value><string>WowzaMedia</string></value>
                    </member>
                    <member>
                        <name>unique_id</name>
                        <value><string>${channelName}</string></value>
                    </member>
                    <member>
                        <name>slug</name>
                        <value><string>${channelName}</string></value>
                    </member>
                    <member>
                        <name>password</name>
                        <value><string>${config.mediacp.password}</string></value>
                    </member>
                    <member>
                        <name>adminpassword</name>
                        <value><string>${config.mediacp.password}</string></value>
                    </member>
                    <member>
                        <name>maxuser</name>
                        <value><string>10000</string></value>
                    </member>
                    <member>
                        <name>bitrate</name>
                        <value><string>2560</string></value>
                    </member>
                    <member>
                        <name>bandwidth</name>
                        <value><string>0</string></value>
                    </member>
                    <member>
                        <name>quota</name>
                        <value><string>50000</string></value></member>
                    <member>
                        <name>customfields</name>
                        <value>
                            <struct>
                                <member>
                                    <name>servicetype</name>
                                    <value><string>TV Station</string>
                                    </value>
                                </member>
                            </struct>
                        </value>
                    </member>
                </struct></value></param></params>
            </methodCall>`

            let response = await axios.post('https://mediastreamingcp.com:2000/system/rpc.php', xml, { headers: { 'Content-type': 'text/xml' } });

            parseString(response.data, async function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    let status = result.methodResponse.params[0].param[0].value[0].struct[0].member[0].value[0].string[0];
                    if (status === 'failed') {
                        let errMsg = result.methodResponse.params[0].param[0].value[0].struct[0].member[1].value[0].string[0];
                        errorChannels.push({ channelName, HSL_URL });
                        await slack.error({ message: errMsg, stack: 'services/mediacp.js line 98' }, `Error while creating a chanenl ${channelName}`);

                    } else {
                        successfulChannels.push({ channelName, HSL_URL });
                    }

                    if ([...body.channels].length - 1 == index) {
                        //send notifications after 3 sec
                        setTimeout(() => {
                            if (successfulChannels.length > 0) {
                                slack.channelCreationSuccess(body, successfulChannels);
                                mailgun.sendEmail('channelCreationSuccess', successfulChannels);
                            }
                            if (errorChannels.length > 0) {
                                slack.channelCreationRequest(body, errorChannels);
                                mailgun.sendEmail('channelCreationRequest', errorChannels);
                            }
                        }, 3000);
                    }
                }
            });

        });


        return true;

    } catch (error) {
        console.log(error);
        console.error(error, "Error in mediacp.js service")
        return true;
    }
}