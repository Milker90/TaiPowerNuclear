'use strict';
const moment = require('moment')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [{
      username: 'willy',
      email: 'willy@cytech.tw',
      pd: '$2b$10$vxRiQw3Fzbr08r37lfYf3efc6Dj1P6SXRKo3WT.hvMEuUGn3Sc90K', //1111
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }, {
      username: 'cytech',
      email: 'cytechtw@gmail.com',
      pd: '$2b$10$vxRiQw3Fzbr08r37lfYf3efc6Dj1P6SXRKo3WT.hvMEuUGn3Sc90K', //1111
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }, {
        username: 'ntu',
        email:'ntu@ntu.com',
        pd: '$2b$10$O/MYfYFg5GScHsJMMXHws.Dr5hDJdFLEMkF0/KxePq1kP7lI7xBZi', // ntu
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    },{
        username: 'test',
        email:'test@ntu.com',
        pd: '$2b$10$eZhtdegGSSC0EA9yETk9iu77hfL6iFeKYLbhnUHrZAkqr1XYwkSay', //test1234
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    ], {});

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {})
  }
};
