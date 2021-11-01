const express = require('express');
const router = express.Router();
const segment = require('../../models/D_action/segment');
//wheel
//get all
router.get('/', function(req, res) {
    console.log('get request for all segmnets');
    segment.find({})
        .exec(function(err, segments) {
            if (err) {
                console.log("err req segments");
            } else {
                res.json(segments);
            }
        });
});
 function getListSegments(data2, datax) {
    var segment = {}
    for (var x of datax) {
        var temp = 0;
        for (var key in data2) {
            if (data2[key].fillStyle == x.fillStyle && data2[key].text == x.text) {
                temp = 1;
                break;
            }
        } 
        if(temp == 0){
            segment = { "fillStyle": x.fillStyle, "text": x.text }
            data2.push(segment);
        }
    }
    return data2
}

// get a wheel
router.get('/:wheelID', function(req, res) {
        let segmentsList = []
        let segmentIndex = {}
        segment.findById(req.params.wheelID)
            .exec(function(err, segment) {
                if (err) console.log("Error retrieving rating");
                else 
                {
                    segmentsList = getListSegments(segmentsList, segment.segments)
                    segmentIndex = {"_id": segment._id, "nameWheel": segment.nameWheel, "segments": segmentsList, "isActive": segment.isActive }  
                }
                res.json(segmentIndex)
            });
})
// get a wheel
router.get('/getSegment/:wheelID', function(req, res) {
    segment.findById(req.params.wheelID)
        .exec(function(err, segment) {
            if (err) console.log("Error retrieving rating");
            else res.json(segment)
        });
})

//post
router.post('/', function(req, res) {
    async function run() {
        const add = await addSegment(req)
        res.json(add);
    }
    run()
});
async function addSegment(req) {
    var newSegment = new segment();
    newSegment.nameWheel = req.body.nameWheel
    newSegment.segments = [
        {
            "fillStyle": "#99ddff",
            "text": req.body.option3
        },
        {
            "fillStyle": "#eae56f",
            "text": req.body.option0
        },
        {
            "fillStyle": "#4dff4d",
            "text": req.body.option2
        },
        {
            "fillStyle": "#ff80ff",
            "text": req.body.option4
        },
        {
            "fillStyle": "#eae56f",
            "text": req.body.option0
        },
        {
            "fillStyle": "#99ddff",
            "text": req.body.option3
        },
        {
            "fillStyle": "#809fff",
            "text": req.body.option1
        },
        {
            "fillStyle": "#eae56f",
            "text": req.body.option0
        },
        {
            "fillStyle": "#99ddff",
            "text": req.body.option3
        },
        {
            "fillStyle": "#4dff4d",
            "text": req.body.option2
        },
        {
            "fillStyle": "#eae56f",
            "text": req.body.option0
        },
        {
            "fillStyle": "#ffc299",
            "text": req.body.option5
        },
    ]
    newSegment.isActive = req.body.isActive
    newSegment.save()
    return newSegment;
}

 //delete
 router.delete('/:wheelID', function(req, res) {
    segment.findByIdAndRemove(req.params.wheelID, function(err, deleterating) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json('Successfully deleted');
        }
    });
});
// //update
router.put('/:id', function(req, res) {
        async function run() {
            const update = await UpdateByID(req.params.id)

            res.json(update);
        }
        run();
    })
    async function UpdateByID(id){
        const seg = await segment.findByIdAndUpdate(id, {
            $set: {
                segments:  [
                    {
                        "fillStyle": "#99ddff",
                        "text": req.body.option3
                    },
                    {
                        "fillStyle": "#eae56f",
                        "text": req.body.option0
                    },
                    {
                        "fillStyle": "#4dff4d",
                        "text": req.body.option2
                    },
                    {
                        "fillStyle": "#ff80ff",
                        "text": req.body.option4
                    },
                    {
                        "fillStyle": "#eae56f",
                        "text": req.body.option0
                    },
                    {
                        "fillStyle": "#99ddff",
                        "text": req.body.option3
                    },
                    {
                        "fillStyle": "#809fff",
                        "text": req.body.option1
                    },
                    {
                        "fillStyle": "#eae56f",
                        "text": req.body.option0
                    },
                    {
                        "fillStyle": "#99ddff",
                        "text": req.body.option3
                    },
                    {
                        "fillStyle": "#4dff4d",
                        "text": req.body.option2
                    },
                    {
                        "fillStyle": "#eae56f",
                        "text": req.body.option0
                    },
                    {
                        "fillStyle": "#ffc299",
                        "text": req.body.option5
                    },
                ]
            }
        }, {
            new: true
        })
        
        return seg
    }
    //delete

router.get('/getAll/FindActive',function(req,res){
    segment.find({})
    .exec(function(err, segments) {
        if (err) {
            console.log("err req segments");
        } else {
            var check =false
            for(let index of segments)
            {
                if(index["isActive"]==true){
                    check=true
                    break
                }
            }
            res.json(check);
        }
    });
})

//update toàn bộ active về false
router.get('/getAll/UpdateALL/ActiveFalse',function(req,res){
    async function run()
    {
        const AllSeg = await getAll()
        for(let index of AllSeg)
        {
            const update = await updateSegFalse(index._id)
        }
        res.json("UpdateSuccess")
    }
    run()
})
//get all
async function getAll(){
    try {
        const all = await segment.find()
        return all
    } catch (error) {
        console.log(error)
    }
   
}
async function updateSegFalse(id){
    const seg = await segment.findByIdAndUpdate(id, {
        $set: {
            isActive: false
        }
    }, {
        new: true
    })
    console.log(seg)
    return seg
}
async function updateSegTrue(id){
    const seg = await segment.findByIdAndUpdate(id, {
        $set: {
            isActive: true
        }
    }, {
        new: true
    })
    console.log(seg)
    return seg
}
router.get('/getAll/UpdateFalse/:id',function(req,res){
    async function run()
    {
     
            const update = await updateSegFalse(id)

        res.json("UpdateSuccess")
    }
    run()
})
router.get('/getAll/UpdateTrue/:id',function(req,res){
    async function run()
    {
        const AllSeg = await getAll()
        for(let index of AllSeg)
        {
            const update = await updateSegFalse(index._id)
        }
        const update2 = await updateSegTrue(req.params.id)
        console.log(update2)
        res.json("UpdateSuccess2")
    }
    run()
})
module.exports = router