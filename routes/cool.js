var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('so cool');
});

module.exports = router;