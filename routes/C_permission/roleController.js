const express = require('express');
const router = express.Router();
const role = require('../../models/C_permission/role');
//role
//get all
router.get('/', function(req, res) {
    console.log('get request for all roles');
    role.find({})
        .exec(function(err, roles) {
            if (err) {
                console.log("err req roles");
            } else {
                res.json(roles);
            }
        });
});

// get a person
router.get('/:roleID', function(req, res) {
    role.findById(req.params.roleID)
        .exec(function(err, roles) {
            if (err) console.log("Error retrieving role");
            else res.json(roles);
        });
})

//post
router.post('/', function(req, res) {
    var newrole = new role();
    newrole.nameRole = req.body.nameRole;

    newrole.save(function(err, insertedrole) {
        if (err) {
            console.log('Err Saving role');
        } else {
            res.json(insertedrole);
        }
    });
});


//update
router.put('/:id', function(req, res) {
        role.findByIdAndUpdate(req.params.id, {
                $set: {
                    nameRole: req.body.nameRole,

                }
            }, {
                new: true
            },
            function(err, updatedrole) {
                if (err) {
                    res.send("err Update");
                } else {
                    res.json(updatedrole);
                }
            })
    })
    //delete
router.delete('/:id', function(req, res) {
    role.findByIdAndRemove(req.params.id, function(err, deleterole) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});
module.exports = router;