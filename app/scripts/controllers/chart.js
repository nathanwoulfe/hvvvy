angular.module("hvvvyApp").controller("ChartCtrl", ["$scope", "dataResource", function($scope, dataResource) {

  function c() {
    $scope.series = [];
    $scope.dates = [];
    $scope.averages = [];
    $scope.totalPerSession = [];
    $scope.repsPerSession = [];
    $scope.sessionRepMax = [];

    $scope.low = {
      name: "Low",
      yAxis: 1,
      type: "column",
      stacking: "percent",
      tooltip: $scope.intensity.tooltip,
      data: [],
      color: $scope.intensity.colors[0]
    };

    $scope.medium = {
      name: "Medium",
      yAxis: 1,
      type: "column",
      stacking: "percent",
      tooltip: $scope.intensity.tooltip,
      data: [],
      color: $scope.intensity.colors[1]
    };

    $scope.high = {
      name: "High",
      yAxis: 1,
      type: "column",
      stacking: "percent",
      tooltip: $scope.intensity.tooltip,
      data: [],
      color: $scope.intensity.colors[2]
    };

    $scope.ranges = [];
    $scope.totalWeight = 0;
    $scope.totalReps = 0;
    $scope.rmax = 0;
  }

  function d() {
    var c,
      weight,
      reps,
      sets,
      rmax,
      date,
      i;

    angular.forEach($scope.chartData, function(j) {

      if (c = 0, date = j.date, i = [], 1 === j.value.length) {
        weight = j.value[0].w;
        sets = j.value[0].s;
        reps = j.value[0].r;

        $scope.averages.push([date, weight]);
        $scope.ranges.push([date, weight, weight]);
        $scope.totalReps += sets * reps;

        $scope.totalWeight += sets * reps * weight;
        $scope.totalPerSession.push([date, sets * reps * weight]);
        $scope.repsPerSession.push([date, sets * reps]);
        rmax = dataResource.oneRepMax(weight, reps);
        $scope.rmax = rmax > $scope.rmax ? rmax : $scope.rmax;
        $scope.sessionRepMax.push([date, Math.round(100 * $scope.rmax) / 100]);

        var intensity = weight / $scope.rmax * 100;
        intensity >= 90 ? $scope.high.data.push([date, 100]) : intensity >= 70 ? $scope.medium.data.push([date, 100]) : $scope.low.data.push([date, 100]);

      } else {
        var l = 0,
          m = 0,
          n = 0;
        angular.forEach(j.value, function(d) {
          c += d.w;
          i.push(d.w);
          $scope.totalReps += d.s * d.r;
          l += d.s * d.r * d.w;
          m += d.s * d.r;

          rmax = dataResource.oneRepMax(d.w, d.r);
          n = rmax > n ? rmax : n;
          $scope.rmax = rmax > $scope.rmax ? rmax : $scope.rmax
        });

        angular.forEach(j.value, function(b) {
          var intensity = b.w / $scope.rmax * 100,
            data = [date, b.r * b.s / m * 100];

          intensity >= 90 ? $scope.high.data.push(data) : intensity >= 70 ? $scope.medium.data.push(data) : $scope.low.data.push(data);
        });

        $scope.averages.push([date, Math.max.apply(null, i)]);
        $scope.ranges.push([date, Math.min.apply(null, i), Math.max.apply(null, i)]);
        $scope.totalPerSession.push([date, l]);
        $scope.repsPerSession.push([date, m]);
        $scope.sessionRepMax.push([date, Math.round(100 * $scope.rmax) / 100]);
        $scope.totalWeight += l;
      }
    });

    $scope.rmax = Math.round(100 * $scope.rmax) / 100;
  }

  function e() {
    $scope.series = [{
        name: "Weight (max)",
        type: "spline",
        data: $scope.averages,
        zIndex: 1,
        marker: {
          fillColor: "white",
          lineWidth: 2,
          lineColor: "#2196F3"
        },
        color: "#2196f3"
      }, {
        name: "Weight range",
        data: $scope.ranges,
        type: "arearange",
        lineWidth: 0,
        linkedTo: ":previous",
        color: "#2196F3",
        fillOpacity: .3,
        zIndex: 1,
        tooltip: {
          pointFormatter: function() {
            return this.low !== this.high ? '<span style="color:' + this.color + '">●</span> ' + this.series.name + ": <b>" + this.low + " - " + this.high + "</b><br/>" : ""
          }
        }
      }, {
        name: "Calculated 1RM",
        type: "spline",
        data: $scope.sessionRepMax,
        zIndex: 2,
        color: "#3F51B5",
        marker: {
          symbol: "circle",
          fillColor: "white",
          lineWidth: 2,
          lineColor: "#3F51B5"
        }
      }, {
        name: "Session reps",
        type: "spline",
        data: $scope.repsPerSession,
        color: "#03A9F4",
        zIndex: 2,
        marker: {
          symbol: "circle",
          fillColor: "white",
          lineWidth: 2,
          lineColor: "#03A9F4"
        }
      },
      $scope.high,
      $scope.medium,
      $scope.low
    ];

    $scope.chartConfig.series = $scope.series;
  }

  $scope.movements = [];
  $scope.selectedMovement = void 0;
  $scope.intensity = {
    tooltip: {
      enabled: !1,
      pointFormat: ""
    },
    colors: ["#4CAF50", "#FFC107", "#F44336"]
  };

  dataResource.get(2).then(function(c) {
    $scope.data = dataResource.parse(c.data.feed);
    $scope.movements = dataResource.buildSelect($scope.data);
    $scope.totalMovements = $scope.movements.length;
  });

  $scope.getChartData = function() {
    $scope.chartData = [];

    angular.forEach($scope.data, function(c) {
      if (c.type === $scope.selectedMovement && "string" == typeof c.value) {
        c.value = dataResource.parseData(c.value);
        $scope.chartData.push(c);
      }
    });
      
    c();
    d();
    e();
  };

  $scope.current = -1;

  $scope.inc = function(b) {
    1 === b ? $scope.current++ : $scope.current--;
    $scope.current = -1 == $scope.current ? $scope.totalMovements - 1 : $scope.current % $scope.totalMovements;
    $scope.selectedMovement = $scope.movements[$scope.current];
    $scope.getChartData();
  };

  $scope.setSelected = function(b) {
    $scope.selectedMovement = b, $scope.current = $scope.movements.indexOf(b), $scope.getChartData()
  }

  $scope.chartConfig = {
    options: {
      chart: {
        alignTicks: !1
      },
      plotOptions: {
        column: {
          stacking: "percent",
          borderWidth: 1,
          pointPadding: .1,
          groupPadding: 0
        }
      },
      title: {
        text: null
      },
      navigation: {
        buttonOptions: {
          enabled: !1
        }
      },
      xAxis: {
        type: "datetime",
        labels: {
          enabled: !1
        },
        dateTimeLabelFormats: {
          day: '<span class="date">%e %b</span>'
        },
        tickWidth: 0,
        lineWidth: 0
      },
      yAxis: [{
        title: {
          text: null
        },
        labels: {
          enabled: !1
        },
        min: 0,
        gridLineWidth: 0
      }, {
        gridLineWidth: 0,
        title: {
          text: null,
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        min: 0,
        max: 100,
        labels: {
          enabled: !1
        },
        opposite: !0
      }],
      legend: {
        enabled: !1
      },
      tooltip: {
        crosshairs: !0,
        shared: !0,
        xDateFormat: "%e %B",
        headerFormat: "<b>{point.key}</b><br />"
      }
    }
  }
}]);
