'use strict';

angular.module('medicationReminderApp').controller('MainCtrl', function($scope, $http, $window) {

    var start = moment().format('MM/DD/YYYY'),
        end = moment().add(1, 'day').format('MM/DD/YYYY');
    
    var sound = new Howl({
        src: ['../assets/audio/soundNotification3.mp4'],
        loop: true,
        volume: 0.2
    });
    //get the medications based on the start and end date
    getMedication(start, end);

    //get the interval to check if there is a medication which needs to be reminded 
    //or the audio notification needs to be stopped
    $scope.interval = $window.setInterval(function() {
        $scope.currentTime = moment().format('MMMM Do YYYY, h:mm:ss a');
        $scope.$apply();
        remindMedIfNeeded();
        stopAudioNotificationIfNeeded();
    }, 500);

    //execute when a medication is completed
    $scope.completeMedication = function(med) {
        completeMed(med);
        patchMedication(med);
    }

    //execute when the user select a date on the calendar
    $scope.onDateChange = function (date) {
        var selectedDate = $scope.dateValue;
        start = moment(selectedDate).format('MM/DD/YYYY');
        end = moment(selectedDate).add(1, 'day').format('MM/DD/YYYY');
        getMedication(start, end);
    }

    //function to check all the medications if there is one need to be reminded
    function remindMedIfNeeded() {
        $scope.meds.forEach(remindMed);
    }

    //function to play the audio notification
    function playAudioNotification(sound) {
        if (!sound.playing()) {
            sound.play();
        }
    }

    //function to louder the audio notification
    function louderAudioNotification(sound) {
        sound.volume(1);
    }

    //function to stop the audio notification
    function stopAudioNotification(sound) {
        sound.stop();
    }

    //function to check if audio notification needs to be stopped
    function stopAudioNotificationIfNeeded() {
        var shouldNotStop = $scope.meds.reduce(function (prev, cur) {
            return prev || cur.soundNotify;
        }, false);
        shouldNotStop || stopAudioNotification(sound);
    }

    //check for one medication if it meets the conditions to change its status
    // (if the there should be visual or audio notification)
    function remindMed(med) {
        // body...
        var duration = moment(med.time).diff(moment(), 'minutes');

        if (duration <= 5 && !med.completed) {
            med.completedText = "In Process";
            med.showCompleteButton = true;
            med.visualNotify = true;
        }
        if (duration <= 0 && !med.completed) {
            //vioce and visual notification
            med.soundNotify = true;
            playAudioNotification(sound);
        }
        if (duration <= -5 && !med.completed) {
            //turn up voice notification
            louderAudioNotification(sound);
        }

        return med;
    }

    //initialize the medications information
    function initMed(med) {
        med.displayTime = moment(med.time).format('LT');
        med.completedText = (med.completed) ? "Completed" : "Up Coming";
        med.showCompleteButton = false;
        med.visualNotify = false;
        med.soundNotify = false;
        med.louderSoundNotify = false;
        return med;
    }

    //sort function to sort the medications by the medication time
    function sortMeds(a,b) {
        return new Date(a.time) - new Date(b.time);
    }

    //function to complete one medication
    function completeMed(med) {
        med.completedText = "Completed";
        med.showCompleteButton = false;
        med.visualNotify = false;
        med.soundNotify = false;
        med.completed = true;
        return med;
    }

    //process all the medications information
    function processMeds(meds) {
        $scope.meds = meds.data
        .map(initMed).sort(sortMeds);
    }

    //function to get the medications from the server
    function getMedication(start, end) {
        $http.get('/api/medications?start=' + start + '&end=' + end).then(processMeds);
    }

    //function to patch medication update to the server
    function patchMedication(med) {
        $http.patch('/api/medications/' + med._id, {
            completed: true,
            d: med.d
        });
    }
    //function to start the interval and destroy it when user close the web page
    $scope.$on('$destroy', function() {
       $scope.interval && $window.clearInterval($scope.interval);
    });
});