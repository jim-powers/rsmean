// Simple get/find interface to empower auto-complete using the msds_checmical_ingredient table
'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

// Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.

var csvToArray = function(strData, strDelimiter) {
  var strMatchedValue;
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = (strDelimiter || ",");
  // Create a regular expression to parse the csv values.
  var objPattern = new RegExp((
    // Delimiters.
  "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    // Quoted fields.
  "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
    // Standard fields.
  "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];
  // Create an array to hold our individual pattern
  // matching groups.
  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  var arrMatches = objPattern.exec(strData);
  while (arrMatches) {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];
    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }
    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(
        new RegExp("\"\"", "g"), "\"");
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }
    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
    arrMatches = objPattern.exec(strData);
  }
  // Return the parsed data.
  return (arrData);
};

var csv2JSON = function(csv) {
  var array = csvToArray(csv);
  var objArray = [];
  for (var i = 1; i < array.length; i++) {
    objArray[i - 1] = {};
    for (var k = 0; k < array[0].length && k < array[i].length; k++) {
      var key = array[0][k];
      objArray[i - 1][key] = array[i][k]
    }
  }

  //var json = JSON.stringify(objArray);
  //var str = json.replace(/},/g, "},\r\n");
  //
  //return str;
  return objArray;
};
var casData = null;
function filterCasData(search, limit) {
  var filteredData = [];
  if (search) {
    search = search.toUpperCase();
    for (var i=0; i < casData.length; i++) {
      if (filteredData.length >= limit) {
        break;
      }
      var cas = casData[i];
      for (var prop in cas) {
        if(cas.hasOwnProperty(prop)) {
          if(cas[prop].toUpperCase().indexOf(search) !== -1) {
            var arr = cas.RN.split('/');
            if (arr.length > 1) {
              cas.cas = arr[2] + ((arr[0].length === 1) ? '-0' : '-') + arr[0] + '-' + arr[1];
            } else {
              cas.cas = cas.RN;
            }
            cas.name = cas.IN;
            filteredData.push(cas);
            break;
          }
        }
      }
    }
  } else {
    filteredData = casData;
  }
  return filteredData;
}

router.get('/:id*?', function (req, res) {
  console.log(req.query);
  var search = req.query.q;
  var limit = 100;
  if (casData) {
    var filteredData = filterCasData(search, limit);
    console.log('Filtered: ' + filteredData.length + ' records.');
    res.send({results : filteredData});
  } else {
    var fileName = path.resolve(__dirname + '/../assets/tsca.csv');
    fs.readFile(fileName, 'utf8', function(err, data) {
      if (err) {
        res.status(400);
        res.send(err);
        return;
      }
      casData = csv2JSON(data);
      console.log('Retrieved: ' + casData.length + ' records.');
      var filteredData = filterCasData(search, limit);
      console.log('Filtered: ' + filteredData.length + ' records.');
      res.send({results : filteredData});
    });
  }
});

module.exports = router;
