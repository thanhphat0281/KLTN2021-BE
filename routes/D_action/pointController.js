const express = require('express');
const router = express.Router();
const point = require('../../models/D_action/point');
//point
//get all
router.get('/', function(req, res) {
    console.log('get request for all points');
    point.find({})
        .exec(function(err, points) {
            if (err) {
                console.log("err req points");
            } else {
                res.json(points);
            }
        });
});

// get a person
router.get('/:pointID', function(req, res) {
    point.findById(req.params.pointID)
        .exec(function(err, points) {
            if (err) console.log("Error retrieving point");
            else res.json(points);
        });
})

//post
router.post('/', function(req, res) {
    var newpoint = new point();
    newpoint.userID = req.body.userID;
    newpoint.point = req.body.point;
    newpoint.save(function(err, insertedpoint) {
        if (err) {
            console.log('Err Saving point');
        } else {
            res.json(insertedpoint);
        }
    });
});



//delete
router.delete('/:id', function(req, res) {
    point.findByIdAndRemove(req.params.id, function(err, deletepoint) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});
//Update Point by user ID
router.post('/updatePointByUserID', function(req, res) {
        async function run() {
            const Point = await getPointByUserID(req.body.userID, res);
            point.findByIdAndUpdate(Point[0]._id, {
                    $set: {
                        point: Number(Point[0].point) + Number(req.body.point)
                    }
                }, {
                    new: true
                },
                function(err, updatedPoint) {
                    if (err) {
                        res.send("err Update");
                    } else {
                        res.json(updatedPoint);
                    }
                })
        }
        run();
    })
    //get point by UserID
async function getPointByUserID(req, res) {
    try {
        const pointArray = await point.find({
            userID: req
        });
        return pointArray;
    } catch (err) {
        return res.status(501).json(err);
    }
}
//get point by UserID
router.get('/getPointByUserID/:userID', function(req, res) {
    async function run() {
        const Point = await getPointByUserID(req.params.userID, res);
        res.json(Point);
    }
    run();
})


module.exports = router;