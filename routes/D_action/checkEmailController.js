var express = require('express');
var router = express.Router();
var verifier = require('email-verify');
var infoCodes = verifier.infoCodes;
router.get('/:email', function(req, res) {
    verifier.verify(req.params.email, function(err, info) {
        if (err) res.status(404).json(err);
        else {
            res.json(info);
        }
    });
});
module.exports = router;