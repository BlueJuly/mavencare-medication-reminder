'use strict';

angular.module('medicationReminderApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ngMaterial',
  'scDateTime'
])
.value('scDateTimeConfig', {
        defaultTheme: 'material',
        autosave: true,
        displayMode: 'date',
        defaultOrientation: false,
        compact: false
    })

  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });