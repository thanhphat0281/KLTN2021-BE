const express = require('express');
const router = express.Router();
const author = require('../../models/A_store/author');

//author
//get all
router.get('/', function(req, res) {
    console.log('get request for all authors');
    author.find({})
        .exec(function(err, authors) {
            if (err) {
                console.log("err req authors");
            } else {
                res.json(authors);
            }
        });
});

// get a person
router.get('/:authorID', function(req, res) {
    author.findById(req.params.authorID)
        .exec(function(err, authors) {
            if (err) console.log("Error retrieving author");
            else res.json(authors);
        });
})

//post
router.post('/' , function(req, res) {
    var newauthor = new author();
    newauthor.nameAuthor = req.body.nameAuthor;
    newauthor.imgAuthor = req.body.imgAuthor;
    newauthor.detailAuthor = req.body.detailAuthor;
    newauthor.save(function(err, insertedauthor) {
        if (err) {
            console.log('Err Saving author');
        } else {
            res.json(insertedauthor);
        }
    });
});


//update
router.put('/:id',function(req, res) {
        author.findByIdAndUpdate(req.params.id, {
                $set: {
                    nameAuthor: req.body.nameAuthor,
                    imgAuthor: req.body.imgAuthor,
                    detailAuthor: req.body.detailAuthor,

                }
            }, {
                new: true
            },
            function(err, updatedauthor) {
                if (err) {
                    res.send("err Update");
                } else {
                    res.json(updatedauthor);
                }
            })
    })
    //delete
router.delete('/:id',function(req, res) {
    author.findByIdAndRemove(req.params.id, function(err, deleteauthor) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});
module.exports = router;