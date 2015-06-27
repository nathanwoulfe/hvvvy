'use strict'; 
angular.module("hvvvyApp").controller("LogCtrl", ["$scope", "dataResource", function($scope, dataResource) {
  
  $scope.units = "kg";
  $scope.id = 2;
  $scope.work = [];
  $scope.movements = [];
  $scope.selectedMovement = void 0;
  $scope.notes = "";
  $scope.alerts = [];

  $scope.init = function() {
      dataResource.get($scope.id).then(function(c) {
        $scope.data = dataResource.parse(c.data.feed);
        $scope.movements = dataResource.buildSelect($scope.data);
      })
    },
    $scope.init();

  $scope.today = function() {
    $scope.date = dataResource.today()
  }

  $scope.today(), $scope.clear = function() {
    $scope.date = null
  }
  $scope.open = function(b) {
    b.preventDefault();
    b.stopPropagation();
    $scope.opened = !0;
  }

  $scope.dateOptions = {
    formatYear: "yy",
    startingDay: 1
  }

  $scope.format = "dd MMMM yyyy";

  $scope.addWork = function() {
    $scope.work.push({
      sets: null,
      reps: null,
      weight: null
    })
  }

  $scope.addWork(), $scope.removeWork = function() {
    $scope.work.splice(-1, 1)
  }

  $scope.save = function() {
    var c = {},
      d = "";

    c.id = $scope.id;
    c.date = $scope.date.getTime();
    c.type = $scope.selectedMovement;
    c.notes = $scope.notes;

    angular.forEach($scope.work, function(a) {
      d += $scope.sets + "|" + $scope.reps + "|" + $scope.weight + "||"
    });

    c.value = d.slice(0, -2);

    dataResource.post(c).then(function() {
      $scope.alerts.push({
        type: "success",
        msg: "Entry saved"
      });

      setTimeout(function() {
        $scope.alerts.splice($scope.alerts.length - 1, 1)
      }, 300);

      $scope.init();
    });
  }
}]);
