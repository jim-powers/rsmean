'use strict';

console.log('>>>>>DEV CONFI>>>>')

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    //uri: 'mongodb://localhost/rsmean-dev'
    uri: 'mongodb://localhost:27017/quantum'
  },

  seedDB: true
};
