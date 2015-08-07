'use strict';

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var defaultUrl = 'mongodb://localhost:27017/mydb';
var _db ;

module.exports = {
  getMongoDbDriver : function() {
    return mongodb;
  },
  getMongoDbClient : function() {
    return MongoClient;
  },
  connect: function(options) {
    var url = (options && options.url) ? options.url : defaultUrl;
    MongoClient.connect(url, function(err, db){
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);
        //console.log(db);
        _db = db;
      }
    })
  },
  getDb: function() {
    return _db;
  },
  close: function() {
    if (_db) {
      _db.close();
    }
  },
  find: function(collectionName, data, cb) {
    var collection = _db.collection(collectionName);
    console.log(data);
    collection.find(data).toArray(function(err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
        console.log('Found:', result.length);
      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }
      cb(err, result);
    })
  },
  insert: function(collectionName, data, cb) {
    var collection = _db.collection(collectionName);
    collection.insert([data], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
        if (cb) {
          cb(err, result);
        }
      }
    });
  },
  update: function(collectionName, query, data, cb) {
    var collection = _db.collection(collectionName);
    collection.update(query, data, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
        if (cb) {
          cb(err, result);
        }
      }
    });
  },
  remove: function(collectionName, data, cb) {
    var collection = _db.collection(collectionName);
    console.log('Remove:');
    console.log(data);
    collection.remove(data, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log('Removed the doucment '+result.result.n);
        if (cb) {
          cb(err, result);
        }
      }
    });
  }
};
