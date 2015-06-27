"use strict";
angular.module("hvvvyApp").factory("gdocs", function() {
  var a = new GDocs;
  return a
}).factory("dataResource", ["$http", function(a) {
  return {
    get: function(b) {
      return a.get("https://spreadsheets.google.com/feeds/list/1VJCLiwvJkYkbHM9k64AouQmf-AOFNGnr0ejgKl1W7lU/od6/public/values?alt=json&sq=id=" + b)
    },
    post: function(b) {
      return a.post("https://script.google.com/macros/s/AKfycbwG4wiT02GyFB4AX15-uSauoG_VfrBPqrims32AqrrOz_zV6hDl/exec?ID=" + b.id + "&Date=" + b.date + "&Type=" + b.type + "&Value=" + b.value + "&Notes=" + b.notes)
    },
    buildSelect: function(a) {
      var b = [];
      return angular.forEach(a, function(a) {
        -1 === b.indexOf(a.type) && b.push(a.type)
      }), b
    },
    oneRepMax: function(a, b) {
      return a / (1.0278 - .0278 * b)
    },
    today: function() {
      return new Date
    },
    parse: function(a) {
      var b, c, d, e, f, g, h, i = [];
      for (d = 0; d < a.entry.length; d += 1) {
        for (f = a.entry[d].content.$t.split(","), h = {}, e = 0; e < f.length; e += 1) g = f[e].split(":"), b = g[0].trim(), c = g[1].trim(), h[b] = "date" === b ? parseInt(c) : c;
        i.push(h)
      }
      return i.sort(function(a, b) {
        return a.date - b.date
      }), i
    },
    parseData: function(a) {
      var b, c = [],
        d = a.split("||"),
        e = {};
      return angular.forEach(d, function(a) {
        b = a.split("|"), e = {}, e.s = parseInt(b[0]), e.r = parseInt(b[1]), e.w = parseInt(b[2]), c.push(e)
      }), c
    }
  }
}]), angular.module("hvvvyApp").controller("MainCtrl", ["$scope", "gdocs", function(a, b) {
  a.toggleAuth = function(a) {
    chrome.identity.getAuthToken({
      interactive: !0
    }, function(a) {})
  }, a.authButtonLabel = function() {
    return b.accessToken ? "Deauthorize" : "Authorize"
  }, a.toggleAuth(!1)
}]), angular.module("hvvvyApp").controller("AboutCtrl", ["$scope", function(a) {
  a.awesomeThings = ["HTML5 Boilerplate", "AngularJS", "Karma"]
}]), angular.module("hvvvyApp").controller("LogCtrl", ["$scope", "dataResource", function(a, b) {
  a.units = "kg", a.id = 2, a.work = [], a.movements = [], a.selectedMovement = void 0, a.notes = "", a.alerts = [], a.init = function() {
    b.get(a.id).then(function(c) {
      a.data = b.parse(c.data.feed), a.movements = b.buildSelect(a.data)
    })
  }, a.init(), a.today = function() {
    a.date = b.today()
  }, a.today(), a.clear = function() {
    a.date = null
  }, a.open = function(b) {
    b.preventDefault(), b.stopPropagation(), a.opened = !0
  }, a.dateOptions = {
    formatYear: "yy",
    startingDay: 1
  }, a.format = "dd MMMM yyyy", a.addWork = function() {
    a.work.push({
      sets: null,
      reps: null,
      weight: null
    })
  }, a.addWork(), a.removeWork = function() {
    a.work.splice(-1, 1)
  }, a.save = function() {
    var c = {},
      d = "";
    c.id = a.id, c.date = a.date.getTime(), c.type = a.selectedMovement, c.notes = a.notes, angular.forEach(a.work, function(a) {
      d += a.sets + "|" + a.reps + "|" + a.weight + "||"
    }), c.value = d.slice(0, -2), b.post(c).then(function() {
      a.alerts.push({
        type: "success",
        msg: "Entry saved"
      }), setTimeout(function() {
        a.alerts.splice(a.alerts.length - 1, 1)
      }, 300), a.init()
    })
  }
}]), angular.module("hvvvyApp").controller("ChartCtrl", ["$scope", "dataResource", function(a, b) {
  function c() {
    a.series = [], a.dates = [], a.averages = [], a.totalPerSession = [], a.repsPerSession = [], a.sessionRepMax = [], a.low = {
      name: "Low",
      yAxis: 1,
      type: "column",
      stacking: "percent",
      tooltip: a.intensity.tooltip,
      data: [],
      color: a.intensity.colors[0]
    }, a.medium = {
      name: "Medium",
      yAxis: 1,
      type: "column",
      stacking: "percent",
      tooltip: a.intensity.tooltip,
      data: [],
      color: a.intensity.colors[1]
    }, a.high = {
      name: "High",
      yAxis: 1,
      type: "column",
      stacking: "percent",
      tooltip: a.intensity.tooltip,
      data: [],
      color: a.intensity.colors[2]
    }, a.ranges = [], a.totalWeight = 0, a.totalReps = 0, a.rmax = 0
  }

  function d() {
    var c, d, e, f, g, h, i;
    angular.forEach(a.chartData, function(j) {
      if (c = 0, h = j.date, i = [], 1 === j.value.length) {
        d = j.value[0].w, f = j.value[0].s, e = j.value[0].r, a.averages.push([h, d]), a.ranges.push([h, d, d]), a.totalReps += f * e, a.totalWeight += f * e * d, a.totalPerSession.push([h, f * e * d]), a.repsPerSession.push([h, f * e]), g = b.oneRepMax(d, e), a.rmax = g > a.rmax ? g : a.rmax, a.sessionRepMax.push([h, Math.round(100 * a.rmax) / 100]);
        var k = d / a.rmax * 100;
        k >= 90 ? a.high.data.push([h, 100]) : k >= 70 ? a.medium.data.push([h, 100]) : a.low.data.push([h, 100])
      } else {
        var l = 0,
          m = 0,
          n = 0;
        angular.forEach(j.value, function(d) {
          c += d.w, i.push(d.w), a.totalReps += d.s * d.r, l += d.s * d.r * d.w, m += d.s * d.r, g = b.oneRepMax(d.w, d.r), n = g > n ? g : n, a.rmax = g > a.rmax ? g : a.rmax
        }), angular.forEach(j.value, function(b) {
          var c = b.w / a.rmax * 100,
            d = [h, b.r * b.s / m * 100];
          c >= 90 ? a.high.data.push(d) : c >= 70 ? a.medium.data.push(d) : a.low.data.push(d)
        }), a.averages.push([h, Math.max.apply(null, i)]), a.ranges.push([h, Math.min.apply(null, i), Math.max.apply(null, i)]), a.totalPerSession.push([h, l]), a.repsPerSession.push([h, m]), a.sessionRepMax.push([h, Math.round(100 * a.rmax) / 100]), a.totalWeight += l
      }
    }), a.rmax = Math.round(100 * a.rmax) / 100
  }

  function e() {
    a.series = [{
      name: "Weight (max)",
      type: "spline",
      data: a.averages,
      zIndex: 1,
      marker: {
        fillColor: "white",
        lineWidth: 2,
        lineColor: "#2196F3"
      },
      color: "#2196f3"
    }, {
      name: "Weight range",
      data: a.ranges,
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
      data: a.sessionRepMax,
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
      data: a.repsPerSession,
      color: "#03A9F4",
      zIndex: 2,
      marker: {
        symbol: "circle",
        fillColor: "white",
        lineWidth: 2,
        lineColor: "#03A9F4"
      }
    }, a.high, a.medium, a.low], a.chartConfig.series = a.series
  }
  a.movements = [], a.selectedMovement = void 0, a.intensity = {
    tooltip: {
      enabled: !1,
      pointFormat: ""
    },
    colors: ["#4CAF50", "#FFC107", "#F44336"]
  }, b.get(2).then(function(c) {
    a.data = b.parse(c.data.feed), a.movements = b.buildSelect(a.data), a.totalMovements = a.movements.length
  }), a.getChartData = function() {
    a.chartData = [], angular.forEach(a.data, function(c) {
      c.type === a.selectedMovement && ("string" == typeof c.value && (c.value = b.parseData(c.value)), a.chartData.push(c))
    }), c(), d(), e()
  }, a.current = -1, a.inc = function(b) {
    1 === b ? a.current++ : a.current--, a.current = -1 == a.current ? a.totalMovements - 1 : a.current % a.totalMovements, a.selectedMovement = a.movements[a.current], a.getChartData()
  }, a.setSelected = function(b) {
    a.selectedMovement = b, a.current = a.movements.indexOf(b), a.getChartData()
  }, a.chartConfig = {
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
}]), angular.module("hvvvyApp").controller("HistoryCtrl", ["$scope", "dataResource", function(a, b) {
  function c() {
    a.groupedData = [], a.days = [], angular.forEach(a.data, function(b) {
      var c = {};
      c.values = [];
      var d = $.grep(a.groupedData, function(a) {
        return new Date(a.date).setHours(0, 0, 0, 0) === new Date(b.date).setHours(0, 0, 0, 0)
      });
      0 === d.length ? (c.date = b.date, c.values.push(b), a.groupedData.push(c)) : d[0].values.push(b)
    }), a.totalItems = a.groupedData.length, a.getPage()
  }
  b.get(2).then(function(d) {
    a.data = b.parse(d.data.feed).reverse(), angular.forEach(a.data, function(a) {
      "string" == typeof a.value && (a.value = b.parseData(a.value))
    }), c()
  }), a.sets = function(a) {
    return 1 === a ? "set" : "sets"
  }, a.reps = function(a) {
    return 1 === a ? "rep" : "reps"
  }, a.currentPage = 1, a.pageSize = 5, a.getPage = function() {
    var b = (a.currentPage - 1) * a.pageSize,
      c = b + a.pageSize;
    a.pagedData = a.groupedData.slice(b, c)
  }, a.pageChanged = function() {
    a.getPage()
  }
}]);
