'use strict';

/**
 * @ngdoc overview
 * @name hvvvyApp
 * @description
 * # hvvvyApp
 *
 * Main module of the application.
 */
angular
  .module('hvvvyApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.sortable',
    'LocalStorageModule',
    'ui.bootstrap',
    'highcharts-ng',
    'slick'
  ])
  .config(['localStorageServiceProvider', function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('ls');
  }])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/contact', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/log', {
        templateUrl: 'views/log.html',
        controller: 'LogCtrl'
      })
      .when('/chart', {
        templateUrl: 'views/chart.html',
        controller: 'ChartCtrl'
      })
      .when('/history', {
        templateUrl: 'views/history.html',
        controller: 'HistoryCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

