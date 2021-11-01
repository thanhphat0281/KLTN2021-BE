const express = require('express');
const router = express.Router();
const rating = require('../../models/D_action/rating');
const userAccount = require('../../models/C_permission/user');
const accountsocials = require('../../models/C_permission/accountsocials');
const book = require('../../models/A_store/book');
//rating
//get all
router.get('/', function(req, res) {
    console.log('get request for all ratings');
    rating.find({})
        .exec(function(err, ratings) {
            if (err) {
                console.log("err req ratings");
            } else {
                res.json(ratings);
            }
        });
});

// get a person
router.get('/:ratingID', function(req, res) {
    rating.findById(req.params.ratingID)
        .exec(function(err, ratings) {
            if (err) console.log("Error retrieving rating");
            else res.json(ratings);
        });
})

//post
router.post('/', function(req, res) {
    async function run() {
        const add = await addRate(req)
        const updateRateBook = await UpdateRatingAverageBook(req.body.bookID)
        res.json(add);

    }
    run()
});
async function addRate(req) {
    var newrating = new rating();
    newrating.bookID = req.body.bookID;
    newrating.userID = req.body.userID;
    newrating.star = req.body.star;
    newrating.review = req.body.review;
    newrating.save()
    return newrating;
}


//update
router.put('/:id', function(req, res) {
        async function run() {
            const update = await putRate(req.params.id, req, res)

            res.json(update);
        }
        run();
    })
    //delete
router.delete('/:id', function(req, res) {
    rating.findByIdAndRemove(req.params.id, function(err, deleterating) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});
//find all rating by bookID
router.get('/findbooks/:book_id', function(req, res) {
    rating.find({
            bookID: req.params.book_id
        })
        .exec(function(err, ratings) {
            if (err) console.log("Error retrieving rating");
            else
                res.json(ratings);
        });
})

router.post('/RatingBookByUserID', function(req, res) {
    async function run() {
        const rateFind = await findRatingByUserIDAndBookID(req, res);

        if (rateFind.length == 0) {
            res.json([{
                _id: "000000000",
                bookID: req.body.userID,
                userID: req.body.bookID,
                star: '0',
                review: ''
            }]);
        } else
            res.json(rateFind);
    }
    run();
})
async function findRatingByUserIDAndBookID(req, res) {

    try {
        const rate = await rating.find({
            userID: req.body.userID,
            bookID: req.body.bookID
        });
        // console.log(customerArray)
        return rate;
    } catch (err) {
        return res.status(501).json(err);
    }
};
async function putRate(idRate, req, res) {
    try {

        const rateUpdate = await rating.findByIdAndUpdate(idRate, {
            $set: {
                bookID: req.body.bookID,
                userID: req.body.userID,
                star: req.body.star,
                review: req.body.review
            }
        }, {
            new: true
        });
        const updateRateBook = await UpdateRatingAverageBook(req.body.bookID)
        return rateUpdate;
    } catch (err) {
        return res.status(501).json(err);
    }
}
//update rating by UserID
router.post('/UpdateRating', function(req, res) {
    async function run() {
        const rateFind = await findRatingByUserIDAndBookID(req, res);
        const update = await putRate(rateFind[0]._id, req, res)

        res.json(update)

    }
    run();
})

//Average Rating By bookID
router.get('/averageRating/:book_id', function(req, res) {
    async function run() {
        const listRate = await getRateByBookID(req, res)
        let total = parseFloat(0)
        for (let index in listRate) {
            total = total + parseFloat(listRate[index].star)
        }
        let average = Math.round(2 * (total / listRate.length)) / 2;
        res.json({ average: average, count: listRate.length })
    }
    run()
})

// async function getRateByBookID(req, res) {
//     try {
//         console.log(req.params.book_id)
//         console.log("------------------------")
//         const listRate = await rating.find({
//             bookID: req.params.book_id
//         })
//         return listRate
//     } catch (error) {
//         return res.status(501).json(err);
//     }
// }


// lấy các bình luận đánh giá theo bookID
async function getSosialAccountByOrUserAccountID(req) {
    try {
        const accountUser = await userAccount.findById(req)
        const accountSosial = await accountsocials.findById(req)
        if (accountUser != null) {
            return accountUser
        }
        return accountSosial
    } catch (error) {

    }
}
router.get('/getListRatingAccount/:book_id', function(req, res) {
    async function run() {

        const listRate = await getRateByBookID(req.params.book_id, res);
        // console.log(listRate)
        const listAccountRate = []
        for (var index in listRate) {
            const user = await getSosialAccountByOrUserAccountID(listRate[index].userID)
            listAccountRate.push({ username: user.username, imageUrl: user.imageUrl, star: listRate[index].star, review: listRate[index].review })
        }
        // console.log(listAccountRate)

        res.json(listAccountRate)
    }
    run();
})




//#region //get average Rating
async function UpdateRatingAverageBook(req) {
    try {
        console.log("!@3")
        const testUpdate = await averageRating(req)
        console.log(testUpdate)
        const update = await book.findByIdAndUpdate(req, {
            $set: {
                rate: testUpdate
            }
        }, {
            new: true
        })
        return update
    } catch (error) {
        console.log(error)
    }
}

async function getRateByBookID(req) {
    try {
        const listRate = await rating.find({
            bookID: req
        })
        return listRate
    } catch (error) {

    }
}
async function averageRating(req) {
    const listRate = await getRateByBookID(req)

    let total = parseFloat(0)
    for (let index in listRate) {
        total = total + parseFloat(listRate[index].star)
    }
    let average = Math.round(2 * (total / listRate.length)) / 2;
    if (listRate.length == 0)
        return { average: 0, count: 0 }
    else
        return { average: average, count: listRate.length }
}

//#endregion
module.exports = router;