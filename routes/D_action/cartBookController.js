const express = require('express');
const router = express.Router();
const cartBook = require('../../models/D_action/cartBook');
const book = require('../../models/A_store/book');
//cartBook
//get all
router.get('/', function(req, res) {
    console.log('get request for all cartBooks');
    cartBook.find({})
        .exec(function(err, cartBooks) {
            if (err) {
                console.log("err req cartBooks");
            } else {
                res.json(cartBooks);
            }
        });
});

// get a person
router.get('/:cartBookID', function(req, res) {
    cartBook.findById(req.params.cartBookID)
        .exec(function(err, cartBooks) {
            if (err) console.log("Error retrieving cartBook");
            else res.json(cartBooks);
        });
})

//post
router.post('/', function(req, res) {
    var newcartBook = new cartBook();
    newcartBook.userID = req.body.userID;
    newcartBook.bookID = req.body.bookID;
    newcartBook.count = req.body.count;
    newcartBook.save(function(err, insertedcartBook) {
        if (err) {
            console.log('Err Saving cartBook');
        } else {
            res.json(insertedcartBook);
        }
    });
});




//delete all by userID
router.delete('/deleteByUserID/:userID', function(req, res) {
    var myquery = { userID: req.params.userID };
    cartBook.deleteMany(myquery, function(err, deletecartBook) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }

    });
});


//Update CartBook
router.post('/updateCartBook', function(req, res) {
    async function run() {
        const CartBook = await getCartBookByUserIDBookID(req, res);
        cartBook.findByIdAndUpdate(CartBook[0]._id, {
                $set: {
                    count: req.body.count
                }
            }, {
                new: true
            },
            function(err, updatedcartBook) {
                if (err) {
                    res.send("err Update");
                } else {
                    res.json(updatedcartBook);
                }
            })
    }
    run();
})

//delete one 
router.post('/deleteOneCartBook', function(req, res) {
    async function run() {
        const CartBook = await getCartBookByUserIDBookID(req, res);
        cartBook.findByIdAndRemove(CartBook[0]._id, function(err, deletecartBook) {
            if (err) {
                res.send('err Delete');
            } else {
                res.json({ message: 'Successfully deleted' });
            }
        });
    }
    run();
});
async function getCartBookByUserIDBookID(req, res) {
    try {
        const cartBookArray = await cartBook.find({
            userID: req.body.userID,
            bookID: req.body.bookID
        });
        return cartBookArray;
    } catch (err) {
        return res.status(501).json(err);
    }
}
// get all cartbook by userID
router.get('/getAllCartBookByUserID/:userID', function(req, res) {
    async function run() {

        const CartBook = await getAllCartBookByUserID(req.params.userID, res);

        let cartBookArray = []
        for (let index = 0; index < CartBook.length; index++) {
            const book = await getBookByBooID(CartBook[index].bookID, res);
            //console.log(cartBookArray);
            // book["count"] = CartBook[index].count;    
            var book_add = {
                _id: book._id,
                nameBook: book.nameBook,
                categoryID: book.categoryID,
                authorID: book.authorID,
                priceBook: book.priceBook,
                detailBook: book.detailBook,
                imgBook: book.imgBook,
                seriID: book.seriID,
                sale: book.sale,
                count: CartBook[index].count,
                quantity: book.quantity,
                rate: book.rate
            };
            cartBookArray.push(book_add);
        }
        res.json(cartBookArray);
        //console.log(cartBookArray);
    }
    run();
})
async function getAllCartBookByUserID(req, res) {
    try {
        const cartBookArray = await cartBook.find({
            userID: req
        });
        return cartBookArray;
    } catch (err) {
        return res.status(501).json(err);
    }
}
async function getBookByBooID(req, res) {
    try {
        const bookArray = await book.findById(req);
        return bookArray;
    } catch (err) {
        return res.status(501).json(err);
    }
}

module.exports = router;