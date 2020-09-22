var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.send('Wiki home!');
});

router.get('/about', function (req, res) {
    res.send('About this Wiki!');
});

module.exports = router;