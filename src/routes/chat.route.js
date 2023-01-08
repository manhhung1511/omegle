const express = require('express');
const route = express.Router();
const {homepage} = require('../controllers/chat.controller');

route.get('/', homepage);

module.exports = route;