'use strict';

angular.module("hvvvyApp").controller("HistoryCtrl", ["$scope", "dataResource", function($scope, dataResource) {
  
  function init() {
    $scope.groupedData = [];
    $scope.days = [];
    
    angular.forEach($scope.data, function(b) {
      var c = {};
      c.values = [];
      
      var d = $.grep($scope.groupedData, function(a) {
        return new Date(a.date).setHours(0, 0, 0, 0) === new Date(b.date).setHours(0, 0, 0, 0);
      });
      
      if (0 === d.length) {
        c.date = b.date;
        c.values.push(b);
        $scope.groupedData.push(c);
      }
      else {
        d[0].values.push(b);
      }
    });
    
    $scope.totalItems = $scope.groupedData.length;
    $scope.getPage();
  }
  
  dataResource.get(2).then(function(d) {
    $scope.data = dataResource.parse(d.data.feed).reverse();
    
    angular.forEach($scope.data, function(a) {
      if (typeof a.value === 'string') {
        a.value = dataResource.parseData(a.value);
      }
    });
    
    init();
  })
  
  $scope.sets = function(a) {
    return 1 === a ? "set" : "sets";
  }
  
  $scope.reps = function(a) {
    return 1 === a ? "rep" : "reps";
  }
  
  $scope.currentPage = 1;
  $scope.pageSize = 5; 
  
  $scope.getPage = function() {
    var begin = ($scope.currentPage - 1) * $scope.pageSize,
      end = begin + $scope.pageSize;
    $scope.pagedData = $scope.groupedData.slice(begin, end);    
  }
    
  $scope.pageChanged = function() {
    $scope.getPage();
  }
}]);