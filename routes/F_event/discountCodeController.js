const express = require('express');
const router = express.Router();
const discountCode = require('../../models/F_event/discountCode');
//discountCode
//get all
router.get('/', function(req, res) {
    console.log('get request for all discountCodes');
    discountCode.find({})
        .exec(function(err, discountCodes) {
            if (err) {
                console.log("err req discountCodes");
            } else {
                res.json(discountCodes);
            }
        });
});

// get a person
router.get('/:discountCodeID', function(req, res) {
    discountCode.findById(req.params.discountCodeID)
        .exec(function(err, discountCodes) {
            if (err) console.log("Error retrieving discountCode");
            else res.json(discountCodes);
        });
})

//post
router.post('/', function(req, res) {
    var newdiscountCode = new discountCode();

    newdiscountCode.userID = req.body.userID;
    newdiscountCode.discountCode = req.body.discountCode;
    newdiscountCode.discountDetail = req.body.discountDetail;
    newdiscountCode.status = req.body.status;
    newdiscountCode.save(function(err, inserteddiscountCode) {
        if (err) {
            console.log('Err Saving discountCode');
        } else {
            res.json(inserteddiscountCode);
        }
    });
});


//update
router.put('/:id', function(req, res) {
        discountCode.findByIdAndUpdate(req.params.id, {
                $set: {
                    status: req.body.status,
                    userID: req.body.userID,
                    discountDetail: req.body.discountDetail,
                    discountCode: req.body.discountCode,
                }
            }, {
                new: true
            },
            function(err, updateddiscountCode) {
                if (err) {
                    res.send("err Update");
                } else {
                    res.json(updateddiscountCode);
                }
            })
    })
    //delete
router.delete('/:id', function(req, res) {
    discountCode.findByIdAndRemove(req.params.id, function(err, deletediscountCode) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});

//get discountCode By UserID
router.get('/findByUserID/:id', function(req, res) {
    discountCode.find({
            userID: req.params.id
        })
        .exec(function(err, discountCodes) {
            if (err) console.log("Error retrieving discountCodes");
            else { res.json(discountCodes); }
        });
})

//get discountCode ByUserID && Status True (code chưa dùng)
router.get('/findByUserIDANDStatus/:id', function(req, res) {
    discountCode.find({
            userID: req.params.id,
            status: 0,
        })
        .exec(function(err, discountCodes) {
            if (err) console.log("Error retrieving discountCodes");
            else { res.json(discountCodes); }
        });
})
module.exports = router;