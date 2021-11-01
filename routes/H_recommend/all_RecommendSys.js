const express = require('express');
const router = express.Router();
const datasetRecommend = require('../../models/D_action/datasetRecommend')
const book = require('../../models/A_store/book')
const rating = require('../../models/D_action/rating');
//#region Get bộ data recommend
async function getAllDataRecommend() {
    try {
        const data = await datasetRecommend.find();
        return data
    } catch (error) {
        return res.status(501).json(err);
    }
}
//get persion by userID
async function getPerson(req) {
    try {
        const P1 = await datasetRecommend.find({
            userID: req
        });
        return P1;
    } catch (err) {
        return res.status(501).json(err);
    }
}
var len = function(obj) {
    var len = 0;
    for (var i in obj) {
        len++
    }
    return len;
}

//lọc user trùng nhau
async function deduplicate(arr) {
    let isExist = (arr, x) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].userID == x.userID) return true;
        }
        return false;
    }
    let ans = [];
    arr.forEach(element => {
        if (!isExist(ans, element)) ans.push(element);
    });
    return ans;
}

//Kiểm tra tồn tại by bookID
async function isExist2(data, element, DataInit) {
    let isExist1 = (data2, x, dataInit) => {
        for (var key in data2) {
            if (data2[key][dataInit] == x[dataInit]) {
                return true;
            }
        }
        return false;
    }
    return isExist1(data, element, DataInit);
}
// lọc các value cần check = 0 ( rate = 0)
async function DeleteCheckZero(data, value) {
    let isExist1 = (data2, x) => {
        const dataNew = []
        for (var key in data2) {
            if ((data2[key])[value] != 0) {
                if (value == "click") {
                    if ((data2[key])[value] > 0) {
                        dataNew.push(data2[key])
                    }
                } else {
                    dataNew.push(data2[key])
                }
            }
        }

        return dataNew;
    }
    return isExist1(data)
}
//Kiểm tra sản phẩm xem người dùng đã mua hay chưa
async function CheckIsBuy(data, element) {
    let isExist1 = (data2, x) => {
        for (var key in data2) {

            if (data2[key].bookID == x) {
                if (data2[key].buy != 0)
                    return true;
                return false;
            }
        }
        return false;
    }
    return isExist1(data, element);
}
//compare 2 person by BookID  ---> value check (rate)

//Tính hệ số tương quan giữa hai người dùng p1 và p2
//dataInit ứng với Book ; value ứng với rate 
async function pearson_correlation(dataset, p1, p2, dataInit, value) {
    try {
        var existp1p2 = {}; //Lưu lại biến khi p1[dataInit]=p2[dataInit]
        const Person1Get = await getPerson(p1); //Lấy data người dùng p1
        const Person2Get = await getPerson(p2); //Lấy data người dùng p2
        const Person1 = await DeleteCheckZero(Person1Get, value) //Loại bỏ những data có rate = 0 (Chưa đánh giá)
        const Person2 = await DeleteCheckZero(Person2Get, value) //Loại bỏ những data có rate = 0 (Chưa đánh giá)

        for (var key1 in Person1) {
            for (var key2 in Person2) {
                if (Person1[key1][dataInit] == Person2[key2][dataInit]) {
                    existp1p2[Person1[key1][dataInit]] = 1 //Lưu lại biến khi p1[dataInit]=p2[dataInit]
                    break;
                }
            }
        }
        var num_existence = len(existp1p2); //số lượng dataInit giống nhau
        if (num_existence == 0) return 0;
        // lưu tổng và tổng bình phương của cả p1 và p2
        // lưu trữ sản phẩm của cả hai
        var p1_sum = 0, //tổng p1
            p2_sum = 0, //tổng p2
            p1_sq_sum = 0, //tổng bình phương p1
            p2_sq_sum = 0, //tổng bình phương p2
            prod_p1p2 = 0, //tổng tích p1 p2
            p1_cur = 0,
            p2_cur = 0;
        // tính tổng và bình phương của mỗi điểm dữ liệu
        // và cũng là sản phẩm của cả hai điểm
        for (var key in existp1p2) {
            for (var key1 in Person1) {
                if (key == Person1[key1][dataInit]) {
                    p1_cur = (Person1[key1])[value];
                    p1_sum += (Person1[key1])[value];
                    p1_sq_sum += Math.pow((Person1[key1])[value], 2);
                    break;
                }
            }
            for (var key2 in Person2) {
                if (key == Person2[key2][dataInit]) {
                    p2_cur = (Person2[key2])[value];
                    p2_sum += (Person2[key2])[value];
                    p2_sq_sum += Math.pow((Person2[key2])[value], 2);
                    break;
                }
            }
            prod_p1p2 += p1_cur * p2_cur;
        }
        var numerator = prod_p1p2 - (p1_sum * p2_sum / num_existence);
        var st1 = p1_sq_sum - Math.pow(p1_sum, 2) / num_existence;
        var st2 = p2_sq_sum - Math.pow(p2_sum, 2) / num_existence;
        var denominator = Math.sqrt(st1 * st2);
        if (denominator == 0) return 0;
        else {
            var val = numerator / denominator;
            return val;
        }
    } catch (err) {
        return res.status(501).json(err);
    }
}

// check by 

// dataset : bộ dữ liệu
// person : user đăng nhập 
// pearson_correlation : function work
//validRecommend : thuộc tính dùng để set Recommend ( rate, category,author)
async function recommendation_eng(dataset, person, pearson_correlation, dataInit, value) {
    var totals = {
        setDefault: function(props, aValue) {
            if (!this[props]) {
                this[props] = 0;
            }
            this[props] += aValue;
        }
    };
    var simsum = {
        setDefault: function(props, aValue) {
            if (!this[props]) {
                this[props] = 0;
            }
            this[props] += aValue;
        }
    };
    var rank_lst = []; //danh sách xếp hạng kết quả tương thích của item
    const Person2Get = await getPerson(person);
    const dataPerson2 = await DeleteCheckZero(Person2Get, value)

    // Lọc tên trùng
    var datafilter = await deduplicate(dataset);
    for (var other in datafilter) {
        if (datafilter[other].userID == person) continue;
        var similar = await pearson_correlation(dataset, person, datafilter[other].userID, dataInit, value);
        if (similar <= 0) continue; //kiểm tra hệ số tương quan <=0 tức là không liên hệ gì với nhau
        const Person1Get = await getPerson(datafilter[other].userID);
        const dataPerson1 = await DeleteCheckZero(Person1Get, value)
        for (var data1 in dataPerson1) {
            //Kiểm tra dataInit trong dataPerson1[data1] có tồn tại trong dataPerson2 không
            if (!(await isExist2(dataPerson2, dataPerson1[data1], dataInit))) {
                //nếu không tồn tại thì dự đoán hệ số tương quan sản phẩm
                //tính trung bình theo hệ số tương quan
                totals.setDefault(dataPerson1[data1][dataInit], dataPerson1[data1][value] * similar);
                simsum.setDefault(dataPerson1[data1][dataInit], similar);
            }
        }
    }
    for (var item in totals) {
        if (typeof totals[item] != "function") {
            //tính trung bình theo hệ số tương quan
            var val = totals[item] / simsum[item];
            rank_lst.push({ val: val, items: item });
        }
    }
    rank_lst.sort(function(a, b) { //sắp xếp theo thứ tự giảm dần
        return b.val < a.val ? -1 : b.val > a.val ?
            1 : b.val >= a.val ? 0 : NaN;
    });
    var recommend = []
    for (var i in rank_lst) {
        //nếu đã mua rồi thì không hiện nữa
        if (!(await CheckIsBuy(Person2Get, rank_lst[i].items))) {
            recommend.push(rank_lst[i].items);
        }
    }
    return recommend; //danh sách id book
}

//#endregion
//các value cột trong datasets
// 0: _id
// 1: bookID
// 2: userID
// 3: rate
// 4: buy
// 5: click
// 6: categoryID
// 7: authorID
// 8: seriID
// 9: priceBook
// 10: sale
// (1,6,7,8,9,10) ---> dataInit
// (3,4,5) ---> value
router.get('/Data/:userID', function(req, res) {
    async function run() {

        const datasets = await getAllDataRecommend();
        //recommend Book
        var book_rate = await recommendation_eng(datasets, req.params.userID, pearson_correlation, 'bookID', 'rate');
        var book_click = await recommendation_eng(datasets, req.params.userID, pearson_correlation, 'bookID', 'click');
        var book_buy = await recommendation_eng(datasets, req.params.userID, pearson_correlation, 'bookID', 'buy');
        //recommend category
        // var category_rate = await recommendation_eng(datasets, req.body.userID, pearson_correlation, 'categoryID', 'rate');
        // var category_click = await recommendation_eng(datasets, req.body.userID, pearson_correlation, 'categoryID', 'click');
        // var category_buy = await recommendation_eng(datasets, req.body.userID, pearson_correlation, 'categoryID', 'buy');
        //recommend author
        // var author_rate = await recommendation_eng(datasets, req.body.userID, pearson_correlation, 'atuhorID', 'rate');
        // var author_click = await recommendation_eng(datasets, req.body.userID, pearson_correlation, 'authorID', 'click');
        // var author_buy = await recommendation_eng(datasets, req.body.userID, pearson_correlation, 'authorID', 'buy');
        //recommend seri
        //recommend sale
        //recommend priceBook
        // const test = await getPerson(req.body.userID)
        // const test = await getAllBook();
        // for (var index in test) {

        //     const testUpdate = await UpdateBookSaleByBookID(test[index]._id)
        //         // console.log(testUpdate)
        // }

        //test data
        // const a = await getPerson(req.body.userID)
        // console.log(DeleteCheckZero(a, "click"))
        const listbook_click = await getBookByListID(book_click)
        const listbook_rate = await getBookByListID(book_rate)
        const listbook_buy = await getBookByListID(book_buy)
        res.json({
            click: listbook_click,
            rate: listbook_rate,
            buy: listbook_buy
                // ,
                // category: { click: category_click, rate: category_rate, buy: category_buy },
                // author: { click: author_click, rate: author_rate, buy: author_buy }
        });
    }
    run();
})
async function getBookByListID(req) {
    try {
        var listBook = []
        for (let index in req) {
            const aBook = await book.findById(req[index])
            listBook.push(aBook)
        }
        return listBook
    } catch (error) {

    }
}

// async function getAllBook(req, res) {
//     try {
//         const getall = book.find({})

//         return getall
//     } catch (error) {

//     }
// }
// async function UpdateBookSaleByBookID(req) {
//     try {
//         const testUpdate = await averageRating(req)
//         console.log(testUpdate)
//         const update = await book.findByIdAndUpdate(req, {
//             $set: {
//                 rate: testUpdate
//             }
//         }, {
//             new: true
//         })
//         return update
//     } catch (error) {
//         console.log(error)
//     }
// }

// async function getRateByBookID(req) {
//     try {
//         const listRate = await rating.find({
//             bookID: req
//         })
//         return listRate
//     } catch (error) {

//     }
// }
// async function averageRating(req) {
//     const listRate = await getRateByBookID(req)

//     let total = parseFloat(0)
//     for (let index in listRate) {
//         total = total + parseFloat(listRate[index].star)
//     }
//     let average = Math.round(2 * (total / listRate.length)) / 2;
//     if (listRate.length == 0)
//         return { average: 0, count: 0 }
//     else
//         return { average: average, count: listRate.length }
// }

module.exports = router;