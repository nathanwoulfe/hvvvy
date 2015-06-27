'use strict';
angular.module('hvvvyApp').factory('dataResource', function($http) {
  return {
    // fetch data from sheet for given id
    get: function(id) {
      return $http.get('https://spreadsheets.google.com/feeds/list/1VJCLiwvJkYkbHM9k64AouQmf-AOFNGnr0ejgKl1W7lU/od6/public/values?alt=json&sq=id=' + id);
    },

    // post data to sheet for given id
    post: function(data) {
      return $http.post('https://script.google.com/macros/s/AKfycbwG4wiT02GyFB4AX15-uSauoG_VfrBPqrims32AqrrOz_zV6hDl/exec?' + 'ID=' + data.id + '&Date=' + data.date + '&Type=' + data.type + '&Value=' + data.value + '&Notes=' + data.notes);
    },

    buildSelect: function(data) {
      var m = [];
      angular.forEach(data, function(d) {
        if (m.indexOf(d.type) === -1) {
          m.push(d.type);
        }
      });
      return m;
    },

    oneRepMax: function(w, r) {
      return w / (1.0278 - (0.0278 * r));
    },

    today: function() {
      return new Date();
    },

    // parse the sheet repsonse into a useful JSON object
    parse: function(data) {
      var resp = [],
        key,
        val,
        i,
        j,
        e,
        f,
        o;

      for (i = 0; i < data.entry.length; i += 1) {
        e = data.entry[i].content.$t.split(',');
        o = {};
        for (j = 0; j < e.length; j += 1) {
          f = e[j].split(':');
          key = f[0].trim();
          val = f[1].trim();
          o[key] = key === 'date' ? parseInt(val) : val;
        }

        resp.push(o);
      }

      resp.sort(function(a, b) {
        return a.date - b.date;
      });

      return resp;
    },

    // parse the pipes out of the value
    // || separates set-rep-weight objects, | separates set from rep from weight
    parseData: function(d) {
      var resp = [],
        o = d.split('||'),
        srw = {},
        v;

      angular.forEach(o, function(oo) {
        v = oo.split('|');
        srw = {};
        srw.s = parseInt(v[0]);
        srw.r = parseInt(v[1]);
        srw.w = parseInt(v[2]);

        resp.push(srw);
      });

      return resp;
    },
  };
});
