$(function () {

    let allChannels = { community: 1, faith: 2, electedOfficials: 3, public: 4, candidate: 5, business: 6, entertainment: 7, news: 8, sports: 9 };
    let currentChannel = window.location.href.split('/');
    currentChannel = currentChannel[currentChannel.length - 1];
    let channelId = allChannels[currentChannel];

    const getStates = () => {
        $.ajax({
            type: 'GET',
            url: '/api/data/initial-data',
            // data: JSON.stringify(values),
            success: setDaysAndStates,
            error: () => {
                alert('Something went wrong!');
            },
            contentType: "application/json"
        });
    }

    const setDaysAndStates = (data) => {
        let { days, states } = data;
        days.forEach(item => {
            $('#day').append(new Option(item.day, item.id));
        });
        states.forEach(item => {
            $('#states').append(new Option(item.state, item.code));
        });
    }

    // function will be called on document load 
    getStates();

    $('#states').on('change', function () {
        $('#day').val('');
        $('#timeslot').empty();
        $('#city').empty();
        getCities(this.value);
    });
    $('#city').on('change', function () {
        getTimeSlots();
    });
    $('#day').on('change', function () {
        getTimeSlots();
    });

    //function for getting cities based on state code
    const getCities = (code) => {
        $.ajax({
            type: 'GET',
            url: `/api/data/cities/${code}`,
            // data: JSON.stringify(values),
            success: data => {
                data.forEach(item => {
                    $('#city').append(new Option(item.cityName, item.id));
                });
            },
            error: () => {
                alert('Something went wrong!');
            },
            contentType: "application/json"
        });
    }

    // get available timeslots
    const getTimeSlots = () => {
        let day = $('#day').val();
        let city = $('#city').val();
        if (day && city) {
            $('#timeslot').empty();
            $.ajax({
                type: 'GET',
                url: `/api/data/timeslots?day=${day}&city=${city}&channel=1`,
                // data: JSON.stringify(values),
                success: data => {
                    data.forEach(item => {
                        let startTime = `${item.startTime}`.split(':');
                        let endTime = `${item.endTime}`.split(':');

                        //below if else conditions are for making timeslots in 12hrs format

                        if (Number(startTime[0]) >= 12) {
                            if (startTime[0] != 12) startTime[0] = startTime[0] - 12
                            startTime = `${startTime[0]}:${startTime[1]}pm`
                        } else {
                            startTime = `${startTime[0]}:${startTime[1]}am`
                        }

                        if (Number(endTime[0]) > 11) {
                            if (endTime[0] != 12) endTime[0] = endTime[0] - 12
                            endTime = `${endTime[0]}:${endTime[1]}pm`
                        } else {
                            if (endTime[1] == '00') endTime[1] = '12'
                            endTime = `${endTime[0]}:${endTime[1]}am`
                        }

                        $('#timeslot').append(new Option(`${startTime} - ${endTime}`, item.id));
                    });
                },
                error: () => {
                    alert('Something went wrong!');
                },
                // contentType: "application/json"
            });
        }
    }

    $('#timeslot_form').submit(function (e) {
        e.preventDefault();

        let values = {};
        $.each($(this).serializeArray(), function (i, field) {
            values[field.name] = field.value;
        });


        $('#pageloader').css('display', 'flex');;
        $('.btn').hide();

        //this endipont will create user and save booking details
        $.ajax({
            type: 'POST',
            url: `/api/auth/create-user/${channelId}`,
            data: JSON.stringify(values),
            success: authSuccess,
            error: authError,
            contentType: "application/json"
        });
    });


    const authSuccess = (data) => {
        $('#pageloader').hide();
        $('.btn').show();
        alert('Account Created Successfully.');
        if (currentChannel === 'community') window.location.replace("https://thankyou.yourprogramontv.com/communitystvnetwork-time-slot-claim");
        else if (currentChannel === 'faith') window.location.replace("https://thankyou.yourprogramontv.com/faithstvnetwork-time-slot-claim");
        else if (currentChannel === 'electedOfficials') window.location.replace("https://thankyou.yourprogramontv.com/electedofficialstvnetwork-time-slot-claim");
        else if (currentChannel === 'public') window.location.replace("https://thankyou.yourprogramontv.com/publicstvnetwork-time-slot-claim");
        else if (currentChannel === 'candidate') window.location.replace("https://thankyou.yourprogramontv.com/candidatestvnetwork-time-slot-claim");
        // else if (currentChannel === 'business') window.location.replace("http://stackoverflow.com");
        // else if (currentChannel === 'entertainment') window.location.replace("http://stackoverflow.com");
        // else if (currentChannel === 'news') window.location.replace("http://stackoverflow.com");
        // else if (currentChannel === 'sports') window.location.replace("http://stackoverflow.com");
    }

    const authError = (error) => {
        $('#pageloader').hide();
        $('.btn').show();
        alert(error.responseJSON?.message);
    }


    //END OF MAIN $jquery
});