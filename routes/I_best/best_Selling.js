const express = require('express');
const router = express.Router();
const order = require('../../models/E_payment/order');
const orderDetail = require('../../models/E_payment/orderDetail');
const book = require('../../models/A_store/book');
const acountSocial = require('../../models/C_permission/accountsocials');
const user = require('../../models/C_permission/user');
const customer = require('../../models/B_profile/customer');
const categoryModel = require('../../models/A_store/category');
const category = require('../../models/A_store/category');
const author = require('../../models/A_store/author');
const datasetRecommend = require('../../models/D_action/datasetRecommend')
async function getAllDataRecommendr(req, res) {
    try {
        const DataBook = await datasetRecommend.find({});
        return DataBook;
    } catch (err) {
        return res.status(501).json(err);
    }
}
async function getAllBook(req, res) {
    try {
        const DataBook = await book.find({});
        return DataBook;
    } catch (err) {
        return res.status(501).json(err);
    }
}
async function getAllDataRecommendByUserID(req, res) {
    try {
        const DataBook = await datasetRecommend.find({ userID: req });
        return DataBook;
    } catch (err) {
        return res.status(501).json(err);
    }
}
async function CountDataBuy(DataBook, aData, bookID) {
    let isExist1 = (DataBook2, aData2, bookID2) => {

        for (var key in DataBook2) {
            if (DataBook2[key].bookID == bookID2) {
                DataBook2[key].count += aData2.buy;

                return DataBook2;
            }
        }
        var dataReturn = {}
        dataReturn = { "bookID": bookID2, "count": aData2.buy }
        DataBook2.push(dataReturn);
        return DataBook2;

    }
    return isExist1(DataBook, aData, bookID);
}
//thống kê Danh sách sách mua nhiều
async function getAllOrder(req, res) {
    try {
        const orderArray = await order.find({});
        return orderArray;
    } catch (err) {
        return res.status(501).json(err);
    }
}
async function getOrderDetailByOrderID(req, res) {
    try {
        const orderDetailArray = await orderDetail.find({
            orderID: req
        });
        return orderDetailArray;
    } catch (err) {
        return res.status(501).json(err);
    }
}
//get book by ID
async function getBookByBookID(req, res) {
    try {
        const aBook = await book.findById(req);
        return aBook;
    } catch (err) {
        return res.status(501).json(err);
    }
}
async function getCategoryByID(req, res) {
    try {
        const aCategory = await category.findById(req);

        return aCategory;
    } catch (err) {
        return res.status(501).json(err);
    }
}
async function getAuthorByID(req, res) {
    try {
        const aAuthor = await author.findById(req);
        return aAuthor;
    } catch (err) {
        return res.status(501).json(err);
    }
}
//get book by CategoryID
async function getBookByCategoryID(req, res) {
    try {
        const aBook = await book.find({ categoryID: req });
        return aBook;
    } catch (err) {
        return res.status(501).json(err);
    }
}
//get userID by f ID
async function getUserIDByCusID(req, res) {
    try {
        const aUser = await customer.findById(req);
        return aUser;
    } catch (err) {
        return res.status(501).json(err);
    }
}
//Đếm sách trong từng OrderDetail của User
async function CreateDataBookCount(data, orderDetail, book) {
    let isExist1 = (data2, orderDetailCheck, bookBook) => {
        for (var key in data2) {

            if (data2[key].bookID == bookBook) {
                data2[key].count += orderDetailCheck.count;
                return data2;
            }

        }
        var dataReturn = {}
        dataReturn = { "bookID": bookBook, "count": orderDetailCheck.count }
        data2.push(dataReturn);
        return data2;
    }
    return isExist1(data, orderDetail, book);
}
async function CreateDataBookCountCategory(data) {

    var dataCategory = []

    for (var key in data) {
        let temp = 0;

        let aBook = await book.findById(data[key].bookID);
        // console.log(aBook)
        for (var key2 in dataCategory) {
            if (dataCategory[key2].categoryID == aBook.categoryID) {
                dataCategory[key2].count += data[key].count
                temp = 1;
                break
            }
        }
        if (temp == 1) continue
        var dataReturn = {}
        dataReturn = { "categoryID": aBook.categoryID, "count": data[key].count }
        dataCategory.push(dataReturn);
    }

    return dataCategory;

}
async function CreateDataBookCountCategoryAndAuthor(data, res) {

    var dataCategory = []
    var dataAuthor = []
    for (var key in data) {
        let temp = 0;

        let aBook = await book.findById(data[key].bookID);

        for (var key2 in dataCategory) {
            if (dataCategory[key2].categoryID == aBook.categoryID) {
                dataCategory[key2].count += data[key].count
                temp = temp = +2;
                break
            }
        }
        for (var key2 in dataAuthor) {
            if (dataAuthor[key2].authorID == aBook.authorID) {
                dataAuthor[key2].count += data[key].count
                temp = temp + 1;
                break
            }
        }
        if (temp == 3) continue
        if (temp == 1 || temp == 0) {
            var dataCategoryReturn = {}
            dataCategoryReturn = { "categoryID": aBook.categoryID, "count": data[key].count }
            dataCategory.push(dataCategoryReturn);
        }
        if (temp == 2 || temp == 0) {
            var dataAuthorReturn = {}
            dataAuthorReturn = { "authorID": aBook.authorID, "count": data[key].count }
            dataAuthor.push(dataAuthorReturn);
        }
    }

    //sort
    dataCategory.sort(function(a, b) {
        return b.count - a.count;
    });
    dataAuthor.sort(function(a, b) {
        return b.count - a.count;
    });


    return ({ dataCategory, dataAuthor });
}

async function CreateDataCategoryCount(data2, AData2, categoryID2, res) {
    for (var key in data2) {
        if (data2[key].categoryID == (categoryID2)) {
            data2[key].count += AData2.buy;
            return data2;
        }
    }
    var dataReturn = {}
    const aCategory = await getCategoryByID(categoryID2, res)
    dataReturn = { "categoryID": categoryID2, "categoryName": aCategory.nameCategory, "count": AData2.buy }
    data2.push(dataReturn);
    return data2;
}

async function getCategoryBookByBookID(req, res) {
    try {
        const aBook = await book.findById(req);
        const category = await categoryModel.findById(aBook.categoryID);
        return category;
    } catch (err) {
        return res.status(501).json(err);
    }
}
//tính tích của rate trong sách
async function CustomRateOnBook(AllBook) {
    var listData = []
    for (var key of AllBook) {
        var dataReturn = {}
        dataReturn = { "bookID": key._id, "totalRate": key["rate"].average * key["rate"].count }
        listData.push(dataReturn);
    }
    listData.sort(function(a, b) {
        return b.totalRate - a.totalRate;
    });

    return listData;
}


//Show sách bán chạy nhất 2
router.get('/Book', function(req, res) {
        async function run() {
            let BookList = []
            let CategoryList = []
            let DataBook = []
            let DataCategory = []
            const Data = await getAllDataRecommendr(req, res);
            for (var index in Data) {
                DataBook = await CountDataBuy(DataBook, Data[index], Data[index].bookID)
            }
            DataCategory = await CreateDataBookCountCategory(DataBook)
            DataBook.sort(function(a, b) {
                return b.count - a.count;
            });
            DataCategory.sort(function(a, b) {
                return b.count - a.count;
            });
            //get book by Databook
            for (var index in DataBook) {
                if (index > 10) {
                    break;
                }
                // console.log(DataBook[index].bookID)
                const abook = await getBookByBookID(DataBook[index].bookID, res);
                // console.log(abook)
                BookList.push(abook);
            }
            for (var index in DataCategory) {
                if (index > 2) {
                    break;
                }
                // console.log(DataBook[index].bookID)
                const aCategory = await getCategoryByID(DataCategory[index].categoryID, res);
                // console.log(abook)
                CategoryList.push(aCategory);
            }


            // id user
            res.json([CategoryList, BookList]);
        }
        run();
    })
    //lấy 10 thể loại,tác giả nhiều ng mua nhất
router.get('/Top10', function(req, res) {
    async function run() {
        let AuthorList = []
        let CategoryList = []
        let DataBook = []
        let DataCategoryAndAuthor = []
        const Data = await getAllDataRecommendr(req, res);
        for (var index in Data) {
            DataBook = await CountDataBuy(DataBook, Data[index], Data[index].bookID)
        }
        DataCategoryAndAuthor = await CreateDataBookCountCategoryAndAuthor(DataBook, res)
            // id user
            //lấy 10 thể loại

        for (var index in DataCategoryAndAuthor["dataCategory"]) {
            if (index >= 10) {
                break;
            }
            const aCategory = await getCategoryByID(DataCategoryAndAuthor["dataCategory"][index].categoryID, res);
            CategoryList.push(aCategory);
        }

        //lấy 10 tác giả
        for (var index2 in DataCategoryAndAuthor["dataAuthor"]) {
            if (index2 >= 10) {
                break;
            }
            const aAuthor = await getAuthorByID(DataCategoryAndAuthor["dataAuthor"][index2].authorID, res);
            AuthorList.push(aAuthor);
        }
        res.json({ CategoryList, AuthorList });
    }
    run();
})


//show thể loại bán chạy nhất
//1 Sach ban chay
//2 Sach moi 
//3 Sach danh gia cao
router.get('/getSomeNewSomeBuySomeRateBest', function(req, res) {
    async function run() {
        let DataBookBuyMost = []
        let BookListBuyMost = []
        let BookListNew = []
        let DataBookRateMost = []
        let DataListRateMost = []
        const Data = await getAllDataRecommendr(req, res);
        const AllBook = await getAllBook(req, res);
        //1
        for (var index in Data) {
            DataBookBuyMost = await CountDataBuy(DataBookBuyMost, Data[index], Data[index].bookID)
        }
        DataBookBuyMost.sort(function(a, b) {
            return b.count - a.count;
        });
        for (var index in DataBookBuyMost) {
            if (index >= 5) {
                break;
            }
            // console.log(DataBook[index].bookID)
            const abook = await getBookByBookID(DataBookBuyMost[index].bookID, res);
            // console.log(abook)
            BookListBuyMost.push(abook);
        }
        //2,3 //get all book --> rate and new 
        for (let index of[AllBook.length - 1, AllBook.length - 2, AllBook.length - 3, AllBook.length - 4, AllBook.length - 5]) {
            // const abook = await getBookByBookID(AllBook[index].bookID, res);
            console.log(index)
            BookListNew.push(AllBook[index]);
        }
        //rate

        DataBookRateMost = await CustomRateOnBook(AllBook)
        for (var index in DataBookRateMost) {
            if (index >= 5) {
                break;
            }
            const abook = await getBookByBookID(DataBookRateMost[index].bookID, res);
            // console.log(abook)
            DataListRateMost.push(abook);
        }
        res.json({ BookListNew, BookListBuyMost, DataListRateMost })
    }
    run();
})


//show những sách người dùng mua nhiều nhất trong thể loại (theo userID --> phai dang nhap)
router.get('/BookByCategory/:UserID', function(req, res) {
    async function run() {
        let BookList = []
        let DataBook = []
        const dataUser = await getAllDataRecommendByUserID(req.params.UserID)
        for (var index in dataUser) {
            DataBook = await CreateDataCategoryCount(DataBook, dataUser[index], dataUser[index].categoryID, res)
        }
        // console.log(DataBook)
        DataBook.sort(function(a, b) {
            return b.count - a.count;
        });
        //get book by Databook
        for (var index in DataBook) {
            if (index > 1) {
                break;
            }
            const abook = await getBookByCategoryID(DataBook[index].categoryID, res);
            //set key Object
            const categoryName = DataBook[index].categoryName;
            var obj = {};
            obj[categoryName] = abook;
            BookList.push(obj);
            // số lượng category muon
        }
        // id user
        res.json(BookList);
    }
    run();
})







// //Show sách bán chạy nhất
// router.get('/Book', function(req, res) {
//         async function run() {
//             let BookList = []
//             let CategoryList = []
//             let DataBook = []
//             let DataCategory = []
//             const orderArray = await getAllOrder(req, res);
//             // console.log("DataBook")
//             for (var index in orderArray) {
//                 // const userInOrder = await getUserIDByCusID(orderArray[index].customerID, res);
//                 const orderDetailArray = await getOrderDetailByOrderID(orderArray[index]._id, res);
//                 for (var index2 in orderDetailArray) {
//                     // DataBook.push(orderDetailArray[index2]);
//                     //kiểm tra xem id sách có tồn tại trong danh sách
//                     //nếu chưa thì thêm , có rồi thì cộng
//                     // DataBook = await CreateDataBookCount(DataBook, orderDetailArray[index2], userInOrder, orderDetailArray[index2].bookID)
//                     DataBook = await CreateDataBookCount(DataBook, orderDetailArray[index2], orderDetailArray[index2].bookID)

//                 }
//             }
//             DataCategory = await CreateDataBookCountCategory(DataBook)

//             DataBook.sort(function(a, b) {
//                 return b.count - a.count;
//             });
//             DataCategory.sort(function(a, b) {
//                 return b.count - a.count;
//             });
//             //get book by Databook
//             for (var index in DataBook) {
//                 if (index > 10) {
//                     break;
//                 }
//                 // console.log(DataBook[index].bookID)
//                 const abook = await getBookByBookID(DataBook[index].bookID, res);
//                 // console.log(abook)
//                 BookList.push(abook);
//             }
//             for (var index in DataCategory) {
//                 if (index > 2) {
//                     break;
//                 }
//                 // console.log(DataBook[index].bookID)
//                 const aCategory = await getCategoryByID(DataCategory[index].categoryID, res);
//                 // console.log(abook)
//                 CategoryList.push(aCategory);
//             }


//             // id user
//             res.json([CategoryList, BookList]);
//         }
//         run();
//     })    
module.exports = router;