const express = require('express');
const router = express.Router();
const book = require('../../models/A_store/book');
const user = require('../../routes/C_permission/userController')
const promotion = require('../../models/F_event/promotion')

//book
//get all
router.get('/', function(req, res) {
    console.log('get request for all books');
    book.find({})
        .exec(function(err, books) {
            if (err) {
                console.log("err req books");
            } else {
                res.json(books);
            }
        });
});


// get a person
router.get('/:bookID', function(req, res) {
    book.findById(req.params.bookID)
        .exec(function(err, books) {
            if (err) console.log("Error retrieving book");
            else res.json(books);
        });
})


//post
router.post('/',  function(req, res) {
    if (req.body.sale == null || req.body.sale == "") req.body.sale = 0
    var newbook = new book();
    newbook.nameBook = req.body.nameBook;
    newbook.categoryID = req.body.categoryID;
    newbook.authorID = req.body.authorID;
    newbook.priceBook = req.body.priceBook;
    newbook.detailBook = req.body.detailBook;
    newbook.tryRead = req.body.tryRead;
    newbook.imgBook = req.body.imgBook;
    newbook.seriID = req.body.seriID;
    newbook.sale = req.body.sale;
    newbook.quantity = 100;
    newbook.rate = 0;
    newbook.save(function(err, insertedbook) {
        if (err) {
            console.log('Err Saving book');
        } else {
            res.json(insertedbook);
        }
    });
});


//update
router.put('/:id',  function(req, res) {
        if (req.body.sale == null || req.body.sale == "") req.body.sale = 0
        book.findByIdAndUpdate(req.params.id, {

                $set: {
                    nameBook: req.body.nameBook,
                    categoryID: req.body.categoryID,
                    authorID: req.body.authorID,
                    priceBook: req.body.priceBook,
                    detailBook: req.body.detailBook,
                    tryRead: req.body.tryRead,
                    imgBook: req.body.imgBook,
                    seriID: req.body.seriID,
                    sale: req.body.sale,
                    quantity: req.body.quantity,

                }
            }, {
                new: true
            },
            function(err, updatedbook) {
                if (err) {
                    res.send("err Update");
                } else {
                    res.json(updatedbook);
                }
            })
    })
    //delete
router.delete('/:id',  function(req, res) {
    book.findByIdAndRemove(req.params.id, function(err, deletebook) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});
//get book by category
router.get('/findbycategory/:category_id', function(req, res) {
        book.find({
                categoryID: req.params.category_id
            })
            .exec(function(err, books) {
                if (err) console.log("Error retrieving books");
                else { res.json(books); }
            });
    })
    //get book by category
router.get('/findbyauthor/:author_id', function(req, res) {
        book.find({
                authorID: req.params.author_id
            })
            .exec(function(err, books) {
                if (err) console.log("Error retrieving books");
                else { res.json(books); }
            });
    })
    //get book by price
router.post('/price', function(req, res) {
    book.find({
            priceBook: { $gte: req.body.price1, $lte: req.body.price2 }
        })
        .exec(function(err, books) {
            if (err) console.log("Error retrieving books");
            else { res.json(books); }
        });
})
router.post('/filter', function(req, res) {

    book.find({})
        .exec(function(err, books) {
            // let booksList = []
            // booksList.push(books)
            // console.log
            if (err) {
                console.log("err req books");
            } else {
                if (req.body.category_id != null) {
                    books = books.filter(book => book.categoryID == req.body.category_id);

                }
                if (req.body.price1 != null && req.body.price2 != null) {
                    books = books.filter(book => (book.priceBook >= req.body.price1 && book.priceBook <= req.body.price2));
                }
                if (req.body.nameBook != null) {
                    books = books.filter(book => (book.nameBook.toLowerCase().indexOf(req.body.nameBook) != -1));
                    console.log(books)
                }
                if (req.body.sortByPrice == "sortAscending") {
                    books.sort(function(a, b) {
                        return (a.priceBook) - (b.priceBook);
                    });
                    // books = books.filter((element, index) => {
                    //     return index === 0 || element.priceBook !== books[index - 1].priceBook;
                    // });
                    // console.log(books)
                }
                if (req.body.sortByPrice == "sortDescending") {
                    books.sort(function(a, b) {
                        return (b.priceBook) - (a.priceBook);
                    });
                    // books = books.filter((element, index) => {
                    //     return index === 0 || element.priceBook !== books[index - 1].priceBook;
                    // });
                    console.log(books)
                }
                res.json(books);
            }
        });
});


// Xử lý thanh toán
//Update QuantityBoook by BookID & Quantity
async function UpdateQuantityByBookID(abook, bookQuantityUpdate, res) {

    const Updatebook = await book.findByIdAndUpdate(abook._id, {
        $set: {
            quantity: abook.quantity + bookQuantityUpdate,
        }
    }, {
        new: true
    })

    return Updatebook
}
async function getBookByID(req, res) {
    const abook = await book.findById(req)

    return abook
}

router.post('/UpdateQuantity', function(req, res) {
    async function run() {
        const abook = await getBookByID(req.body._id, res)
        const update = await UpdateQuantityByBookID(abook, req.body.quantity, res)
        console.log(update)
        res.json(update)
    }
    run()
})


//check Giỏ hàng thanh toán bất đồng bộ
router.post('/CheckBillBeforePay', function(req, res) {
    async function run() {
        let temp = -1;
        for (let index in req.body) {
            const abook = await getBookByID(req.body[index]._id, res)
                //kiểm số lượng oke thì trừ
            if (abook.quantity >= req.body[index].count) {

                const update = await UpdateQuantityByBookID(abook, -req.body[index].count, res)
            } else {
                temp = index
                break
            }
        }
        if (temp == -1) {
            res.json(true)
        } else { //roll back dữ liệu
            for (let index in req.body) {
                if (temp == index) {
                    break
                }
                const abook = await getBookByID(req.body[index]._id, res)
                const update = await UpdateQuantityByBookID(abook, req.body[index].count, res)
            }
            res.json(false)
        }
    }
    run()
})

router.get('/getBookSale/get', function(req, res) {
    console.log('get request for all books');
    book.find({})
        .exec(function(err, books) {
            if (err) {
                console.log("err req books");
            } else {
                books = books.filter(book => (book.sale > 0));
                res.json(books);
            }
        });
});




//#region //Update by bookID and sale
//update

router.get('/UpdateByBookIDAndSale/Update', function(req, res) {
    async function run() {
        //get all promotion phù hợp với ngày hiện tại
        const listUpdate = []

        const listPromotion = await getAllPromotionExistToDay()
        //xóa sale
        for (let promotion of listPromotion[1]) {
                if(promotion.StatusUpdateBookSale=="used"){
                for(let id of promotion.listBookIn){
                    const update = await UpdateByBookIDAndSaleNOTTRUE(id, promotion, res)
                    // thay đổi trạng thái của promotion
                }
                const UpdatePromotion= await UpdatePromotionOut(promotion._id,"NotUse",res)
            }
        }
        //tạo sale
            for (let promotion of listPromotion[0]) {
                    if(promotion.StatusUpdateBookSale=="NotUse"){
                    for(let id of promotion.listBookIn){
                        const update = await UpdateByBookIDAndSale(id, promotion, res)
                        // thay đổi trạng thái của promotion
                    }
        
                    const UpdatePromotion= await UpdatePromotionOut(promotion._id,"used",res)
                }
            }
        res.json(listPromotion)
    }
    run()

})
async function UpdateByBookIDAndSale(id, req, res) {
    const Updatebook = await book.findByIdAndUpdate(id, {
        $set: {
            sale: req.discount,
        }
    }, {
        new: true
    })
    return Updatebook
}
async function UpdateByBookIDAndSaleNOTTRUE(id, req, res) {
    const Updatebook = await book.findByIdAndUpdate(id, {
        $set: {
            sale: 0,
        }
    }, {
        new: true
    })
    return Updatebook
}
async function UpdatePromotionOut(id,status,res){
    const update = await promotion.findByIdAndUpdate(id, {
        $set: {
            StatusUpdateBookSale: status,
        }
    }, {
        new: true
    })
    return update
}

//get all promotion check by date now
async function getAllPromotionExistToDay() {
    try {
        //get time now
        var Listmonth = { "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12" }
        var now = new Date();
        var nowSplit = now.toString().split(" ") //hiện tại  
        var nowDate=""
        nowDate = nowSplit[3] + "-" + Listmonth[nowSplit[1]] + "-" + nowSplit[2] + " " + nowSplit[4].split(":")[0] + ":" + nowSplit[4].split(":")[1] //year,month,day: //year,month,day
        const AllPromotion = await getAllPromotion()
 
        const ListPromotionTrue = []
        const ListPromotionFalse = []
        for (let APromotion of AllPromotion) {
   
              if(APromotion.listBookIn[0]=="")continue
       
            var IsExist = await CheckExistTime(APromotion["startDate"],APromotion["endDate"],nowDate)
            if(IsExist) ListPromotionTrue.push(APromotion)
            else ListPromotionFalse.push(APromotion)
        }
        return [ListPromotionTrue,ListPromotionFalse]
        }
        catch (error) {
            console.log(error)
        }
    }
    async function getAllPromotion() {
        const ArrayPromotion = await promotion.find({})
        return ArrayPromotion
    }
    async function CheckExistTime(Start, End, nowCheckDate) {
        if(Date.parse(Start) <= Date.parse(nowCheckDate))
        {
            if(Date.parse(End) >= Date.parse(nowCheckDate))
            {
            }
        }
        return false
    }

    //#endregion



    //#region //kiểm tra sách tồn tại trong list  --->trả về 2 phần đúng và sai

    router.post('/CheckExistListBookID', function(req, res) {
        async function run() {
            const trueData = []
            const falseData = []
            const array = []
                //lọc trùng nhau

            for (let index of req.body) {
                const check = await CheckBookID(index, res)
                array.push(check)
                if (check == null) {
                    falseData.push(index)
                } else {
                    trueData.push(index)
                }
            }
            console.log({ trueData, falseData, array })
            res.json({ trueData, falseData, array })
        }
        run()
    })
    async function CheckBookID(req, res) {
        try {
            const abook = await book.findById(req)

            return abook
        } catch (error) {
            return null
        }
    }
    //#endregion
    module.exports = router;