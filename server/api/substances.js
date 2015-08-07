// Simple get/find interface to empower auto-complete using the msds_checmical_ingredient table
'use strict';

var express = require('express');
var router = express.Router();
var mysql = require('mysql');

router.get('/:id*?', function (req, res) {
  var search = req.query.q;
  console.log(req.query);
  var data = [];
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 's44_eden_localhost'
  });

  connection.connect();

  connection.query('SELECT * from msds_chemical_ingredient where name like ? or cas like ? group by cas,name limit 50',
    ['%'+search+'%', '%'+search+'%'],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.status(500).json({error:err});
      } else {
        console.log(rows.length);
        res.json({count: rows.length, results: rows});
      }
  });

  connection.end();

});

module.exports = router;
