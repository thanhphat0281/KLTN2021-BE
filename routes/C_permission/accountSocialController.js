const express = require('express');
const router = express.Router();
var SocialAccount = require('../../models/C_permission/accountsocials');
var jwt = require('jsonwebtoken');
var superSecret = 'toihocmean';
//user
//get all
router.get('/', function (req, res) {
    console.log('get request for all users');
    SocialAccount.find({})
        .exec(function (err, SocialAccount) {
            if (err) {
                console.log("err req users");
            } else {
                res.json(SocialAccount);
            }
        });
});

// get a person
router.get('/:userID', function (req, res) {
    SocialAccount.findById(req.params.userID)
        .exec(function (err, SocialAccount) {
            if (err) console.log("Error retrieving user");
            else res.json(SocialAccount);
        });
})
router.get('/findByGoogleId/:googleID', function (req, res) {
    SocialAccount.find({
        google_id: req.params.googleID
    })
        .exec(function (err, SocialAccount) {
            if (err) console.log("Error retrieving user");
            else res.json(SocialAccount);
        });
})

router.post('/google', (req, res) => {
    SocialAccount.findOne({ google_id: req.body.google_id }).exec((err, doc) => {
        if (err) {
            res.send({
                    status: false,
                    message: "Error in retriving Account: " +
                    JSON.stringify(err, undefined, 2)
            });
        } else if (!doc) {
            res.send({
                status: false,
                message:"Loi roi"
            });
        } else {
            var socialAccount = doc;
            var token = jwt.sign({
                email: socialAccount.email,
                role: socialAccount.role
            }, superSecret, {
                expiresIn: '24h' // expires in 24 hours
            });
            res.status(200).json({
                status: true,
                message:"Login thanh cong",
                obj: socialAccount,
                token: token
            });
        }
    });
});
router.post('/facebook', (req, res) => {
    SocialAccount.findOne({ facebook_id: req.body.facebook_id }).exec((err, doc) => {
        if (err) {
            res.send({
                status: false,
                message: "Error in retriving Account: " +
                    JSON.stringify(err, undefined, 2)
            });
        } else if (!doc) {
            res.send({
                status: false,
                message: "Loi roi"
            });
        } else {
            var SocialAccount = doc;
            var token = jwt.sign({
                email: SocialAccount.email,
                role: SocialAccount.role
            }, superSecret, {
                expiresIn: '24h' // expires in 24 hours
            });
            res.status(200).json({     
                status: true,
                message:"Login thanh cong",          
                obj: SocialAccount,
                token: token
            });
        }
    });
});

router.post('/addAccount', (req, res) => {
    var socialAccount = new SocialAccount({
        email: req.body.email,
        username: req.body.username,
        imageUrl: req.body.imageUrl,
        facebook_id: req.body.facebook_id,
        google_id: req.body.google_id,
        role: "CUSTOMER"
    });
    SocialAccount.collection.insertOne(socialAccount, (err, data) => {
        if (err) {
            res.json({
                status: false,
                message: "Thêm tài khoản xảy ra lỗi!"
            });
        } else {
            var token = jwt.sign({
                email: socialAccount.email,
                role: socialAccount.role
            }, superSecret, {
                expiresIn: '24h' // expires in 24 hours
            });
            res.status(200).json({
                obj: socialAccount,
                token: token
            });
        }
    });
});
module.exports = router;