const express = require('express');
const router = express.Router();
const comment = require('../../models/D_action/comment');
//comment
//get all
router.get('/', function(req, res) {
    console.log('get request for all comments');
    comment.find({})
        .exec(function(err, comments) {
            if (err) {
                console.log("err req comments");
            } else {
                res.json(comments);
            }
        });
});

// get a person
router.get('/:commentID', function(req, res) {
    comment.findById(req.params.commentID)
        .exec(function(err, comments) {
            if (err) console.log("Error retrieving comment");
            else res.json(comments);
        });
})

//post
router.post('/', function(req, res) {
    var newcomment = new comment();
    newcomment.bookID = req.body.bookID;
    newcomment.userID = req.body.userID;
    newcomment.commentDate = req.body.commentDate;
    newcomment.time = req.body.time;
    newcomment.content = req.body.content;

    newcomment.save(function(err, insertedcomment) {
        if (err) {
            console.log('Err Saving comment');
        } else {
            res.json(insertedcomment);
        }
    });
});


//update
router.put('/:id', function(req, res) {
        comment.findByIdAndUpdate(req.params.id, {
                $set: {
                    bookID: req.body.bookID,
                    userID: req.body.userID,
                    commentDate: req.body.commentDate,
                    time: req.body.time,
                    content: req.body.content,

                }
            }, {
                new: true
            },
            function(err, updatedcomment) {
                if (err) {
                    res.send("err Update");
                } else {
                    res.json(updatedcomment);
                }
            })
    })
    //delete
router.delete('/:id', function(req, res) {
    comment.findByIdAndRemove(req.params.id, function(err, deletecomment) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});
module.exports = router;