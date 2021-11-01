const express = require('express');
const router = express.Router();
const category = require('../../models/A_store/category');
//category
//get all
router.get('/', function(req, res) {
    console.log('get request for all categories');
    category.find({})
        .exec(function(err, categories) {
            if (err) {
                console.log("err req categories");
            } else {
                res.json(categories);
            }
        });
});

// get a person
router.get('/:categoryID', function(req, res) {
    category.findById(req.params.categoryID)
        .exec(function(err, categories) {
            if (err) console.log("Error retrieving category");
            else res.json(categories);
        });
})

//post
router.post('/',function(req, res) {
    var newcategory = new category();
    newcategory.nameCategory = req.body.nameCategory;
    newcategory.imgCategory = req.body.imgCategory;
    newcategory.detailCategory = req.body.detailCategory;

    newcategory.save(function(err, insertedcategory) {
        if (err) {
            console.log('Err Saving category');
        } else {
            res.json(insertedcategory);
        }
    });
});


//update
router.put('/:id',function(req, res) {
        category.findByIdAndUpdate(req.params.id, {
                $set: {
                    nameCategory: req.body.nameCategory,
                    imgCategory: req.body.imgCategory,
                    detailCategory: req.body.detailCategory,

                }
            }, {
                new: true
            },
            function(err, updatedcategory) {
                if (err) {
                    res.send("err Update");
                } else {
                    res.json(updatedcategory);
                }
            })
    })
    //delete
router.delete('/:id',  function(req, res) {
    category.findByIdAndRemove(req.params.id, function(err, deletecategory) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});
module.exports = router;