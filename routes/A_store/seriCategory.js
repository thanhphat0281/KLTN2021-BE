const express = require('express');
const router = express.Router();
const seri = require('../../models/A_store/seri');
//seri
//get all
router.get('/', function(req, res) {
    console.log('get request for all series');
    seri.find({})
        .exec(function(err, series) {
            if (err) {
                console.log("err req series");
            } else {
                res.json(series);
            }
        });
});

// get a person
router.get('/:seriID', function(req, res) {
    seri.findById(req.params.seriID)
        .exec(function(err, series) {
            if (err) console.log("Error retrieving seri");
            else res.json(series);
        });
})

//post
router.post('/',  function(req, res) {
    var newseri = new seri();
    newseri.seriName = req.body.seriName;
    newseri.seriDetail = req.body.seriDetail;
    newseri.seriImg = req.body.seriImg;
    newseri.save(function(err, insertedseri) {
        if (err) {
            console.log('Err Saving seri');
        } else {
            res.json(insertedseri);
        }
    });
});


//update
router.put('/:id', function(req, res) {
        seri.findByIdAndUpdate(req.params.id, {
                $set: {

                    seriName: req.body.seriName,
                    seriDetail: req.body.seriDetail,
                    seriImg: req.body.seriImg,
                }
            }, {
                new: true
            },
            function(err, updatedseri) {
                if (err) {
                    res.send("err Update");
                } else {
                    res.json(updatedseri);
                }
            })
    })
    //delete
router.delete('/:id',  function(req, res) {
    seri.findByIdAndRemove(req.params.id, function(err, deleteseri) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});
module.exports = router;