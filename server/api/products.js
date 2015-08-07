'use strict';

// Sample mongodb resource

var express = require('express');
var router = express.Router();
var myMongo = require('../mymongo');

router.post('/:id*?', function (req, res) {
  var query = {};
  if (req.params.id === 'upload') {
    console.log(req.body.filename);
    var filedata = req.body.data;
    console.log(filedata.length);
    var data_index = filedata.indexOf('base64') + 7;
    filedata = filedata.slice(data_index, filedata.length);
    var decoded_image = new Buffer(filedata, 'base64').toString('ascii');
    console.log(decoded_image.length);
    res.status(200).json({ok : true});
  } else {
    myMongo.insert('products', req.body, function(err, result) {
      if (err) {
        res.send('Error:', err);
      } else {
        res.status(200).json(result.ops);
      }
    });
  }
});

router.get('/:id*?', function (req, res) {
  console.log(req.params);
  var query = {};
  if (req.params.id) {
    query._id = myMongo.getMongoDbDriver().ObjectId(req.params.id);
  }
  myMongo.find('products', query, function(err, result) {
    if (err) {
      res.send('Error:' + err);
    } else {
      res.json(result);
    }
  });
});

router.put('/:id*?', function (req, res) {
  console.log('PUT: ' + req.params.id);
  console.log(req.body);
  var data = req.body;
  var query = {};
  if (req.params.id) {
    query._id = myMongo.getMongoDbDriver().ObjectId(req.params.id);
    delete data._id;
    myMongo.update('products', query,
      {$set : data},
      function(err, result) {
        console.log("Updated the document");
        res.json(result);
      });
  } else {
    res.send('Error: update missing id');
  }
});

router.delete('/:id*?', function (req, res) {
  var query = {};
  if (req.params.id) {
    query._id = myMongo.getMongoDbDriver().ObjectId(req.params.id);
  }
  myMongo.remove('products', query, function(err, result) {
    if (err) {
      res.send('Error:' + err);
    } else {
      res.json(result);
    }
  })
});

module.exports = router;
