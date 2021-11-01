const express = require('express');
const router = express.Router();
const user = require('../../models/C_permission/user');
var passport = require('passport');
// var SocialAccount = require('../../models/C_permission/accountsocials');
var jwt = require('jsonwebtoken');
var superSecret = 'toihocmean';
const nodemailer = require('nodemailer');
//user
//register
router.post('/signup', function(req, res) {
    var newuser = new user();
    newuser.email = String(req.body.email).trim()
    newuser.password = req.body.password;
    newuser.username = String(req.body.username).trim()
    newuser.imageUrl = "https://nulm.gov.in/images/user.png";
    newuser.role = req.body.role;
    newuser.status = false;
    try {
        user.findOne({ email: String(req.body.email).trim() }, function(err, existingUser) {
            if (existingUser == null) {
                newuser.save(function(err, inserteduser) {
                    if (err) {
                        res.send('Err Saving user');
                    } else {
                        // res.send({
                        //     status: true,
                        //     message: "Register Successfully!",
                        //     obj: inserteduser,
                        //     token: null
                        // });
                        var token = jwt.sign({
                            email: inserteduser.email,
                            username: inserteduser.username
                        }, superSecret, {
                            expiresIn: '24h' // expires in 24 hours
                        });
                      
                        var output = `
                        To confirm your account, please click here : http://localhost:4200/confirm-account/${token}
                        `
                        console.log(output)
                       
                        // create reusable transporter object using the default SMTP transport
                        var transporter = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 587,
                            secure: false,
                    
                            // true for 465, false for other ports
                            auth: {
                                user: 'bookstoreute@gmail.com', // generated ethereal user
                                pass: 'mjzailslagceutte' // generated ethereal password
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });
                    
                        // setup email data with unicode symbols
                        var mailOptions = {
                            from: 'bookstoreute@gmail.com', // sender address
                            to: inserteduser.email, // list of receivers
                            subject: 'Confirm Your Email', // Subject line
                            text: 'Hello world?', // plain text body
                            html: output // html body
                        };
                    
                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                res.json('Please check your email');
                            } else {
                                console.log('Message sent: %s', info.messageId);
                                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                                res.json({"token":token,
                                "message": 'Email has been sent--Please confirm'});
                            }
                        });
                    }
                });
            } else {
                res.send({
                    status: false,
                    message: "Email is already exist!",
                    obj: null,
                    token: null
                });
            }
        })

    } catch (err) {
        console.log(err);
    }

});
//login
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return res.status(501).json(err); }
        if (!user) {
          return res.send({
              status: false,
              message: "Tài khoản email hoặc mật khẩu không chính xác!"
          });
      }
      if(!user.status){
          return res.send({
              status: false,
              message: "Tài khoản chưa được xác nhận! Vui lòng xác nhận!"
          });
      }
        req.logIn(user, function(err) {
          if (err) { return res.status(501).json(err); }
          var account = user;
          var token = jwt.sign({
              email: account.email,
              role: account.role
          }, superSecret, {
              expiresIn: '24h' // expires in 24 hours
          });
          res.status(200).json({
              obj: account,
              token: token
            });
        });
      })(req, res, next);
});
//get all
router.get('/',  function(req, res) {
    console.log('get request for all users');
    user.find({})
        .exec(function(err, users) {
            if (err) {
                console.log("err req users");
            } else {
                res.json(users);
            }
        });
});

// get a person
router.get('/:userID', function(req, res) {
    user.findById(req.params.userID)
        .exec(function(err, users) {
            if (err) console.log("Error retrieving user");
            else res.json(users);
        });
})

// get a person by email
router.get('/email/:email', function(req, res) {
    user.find({
            email: req.params.email
        })
        .exec(function(err, users) {
            if (err) console.log("Error retrieving user");
            else res.json(users);
        });
})

//update
router.put('/:id',  function(req, res) {
    user.findByIdAndUpdate(req.params.id, {
            $set: {
                email: req.body.email,
                password: req.body.password,
                username: req.body.username,
                imageUrl: req.body.imageUrl,
                role: req.body.role,
                status: req.body.status
            }
        }, {
            new: true
        },
        function(err, updateduser) {
            if (err) {
                res.send("err Update");
            } else {
                res.json(updateduser);
            }
        })
})

//changePassword
router.put('/changePassword/:email', function(req, res) {
    user.findOne({ email: req.body.email }).select('email username password').exec(function(err, user) {
        if (err) return res.send(err);
        // set the new user information if it exists in the request 
        if (req.body.email) user.email = req.body.email;
        if (req.body.username) user.username = req.body.username;
        if (req.body.imageUrl) user.imageUrl = req.body.imageUrl;
        if (req.body.role) user.role = req.body.role;
        if (!user.comparePassword(req.body.currentPassword)) {
            res.send({
                status: false,
                message: "Password was wrong!",
                obj: null,
                token: null
            });
        } else {
            if (req.body.newPassword) user.password = req.body.newPassword;
            // save the user
            user.save(function(err, user) {
                if (err) return res.send(err);
                // return a message
                res.send({
                    status: true,
                    message: "Change Password Successfully!",
                    obj: user,
                    token: null
                });
            });
        }
    });
});


//delete
router.delete('/:id',  function(req, res) {
    user.findByIdAndRemove(req.params.id, function(err, deleteuser) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});
router.get('/auth/logout', function(req,res,next){
    req.logout();
    return res.status(200).json({message:'Logout Success'});
})

module.exports = router