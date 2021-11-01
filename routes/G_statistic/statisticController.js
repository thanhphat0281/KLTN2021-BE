const express = require('express');
const router = express.Router();
const order = require('../../models/E_payment/order');
const orderDetail = require('../../models/E_payment/orderDetail');
const book = require('../../models/A_store/book');
const customer = require('../../models/B_profile/customer')
const userAccount = require('../../models/C_permission/user');
const accountsocials = require('../../models/C_permission/accountsocials');
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

async function getAllOrder(req, res) {
    try {
        const aOrder = await order.find({});
        return aOrder;
    } catch (err) {
        return res.status(501).json(err);
    }
}

//get book by ID
async function getBookByID(req, res) {
    try {
        const aBook = await book.findById(req);
        return aBook;
    } catch (err) {
        return res.status(501).json(err);
    }
}

//check theo week
async function checkWeek(dateNow, dateCheck) { //theo tuần
    let run = (now, check) => {
        date = { "Mon": 2, "Tue": 3, "Wed": 4, "Thu": 5, "Fri": 6, "Sat": 7, "Sun": 8 } //thứ 2 là đầu tuần
        month = { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 }
        var nowSplit = now.split(" ");
        var checkSplit = check.split(" ");
        if (nowSplit[3] == checkSplit[3]) { //năm =
            if (month[nowSplit[1]] == month[checkSplit[1]]) { //tháng =
                if (nowSplit[2] - 7 <= checkSplit[2] && nowSplit[2] >= checkSplit[2]) { //không cách quá 7 ngày
                    if (date[nowSplit[0]] >= date[checkSplit[0]]) //set ngày trong tuần không được lớn hơn now
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    return run(dateNow, dateCheck);
}

//check theo month
async function checkMonth(yearCheck, monthCheck, dateOrder) {
    let run = (yearCheck, monthCheck, dateOrder) => {
        month = {
            "Jan": 1,
            "Feb": 2,
            "Mar": 3,
            "Apr": 4,
            "May": 5,
            "Jun": 6,
            "Jul": 7,
            "Aug": 8,
            "Sep": 9,
            "Oct": 10,
            "Nov": 11,
            "Dec": 12
        }
        var checkSplit = dateOrder.split(" ");
        if (yearCheck == checkSplit[3]) { //năm =

            if (month[monthCheck] == month[checkSplit[1]]) { //tháng =

                return true;
            }
        }
        return false;
    }
    return run(yearCheck, monthCheck, dateOrder);
}
//check theo year
async function checkYear(yearCheck, dateOrder) { //theo tuần
    let run = (yearCheck, dateOrder) => {
        var checkSplit = dateOrder.split(" ");
        if (yearCheck == checkSplit[3]) { //năm =
            return true;
        }
        return false;
    }
    return run(yearCheck, dateOrder);
}
//Đếm sách trong từng OrderDetail
async function CreateListBookBuyMost(data, element) {
    let isExist1 = (data2, x) => {

        for (var key in data2) {
            if (data2[key].bookID == x.bookID) {
                data2[key].count += x.count;
                return data2;
            }
        } {
            var book = {}
            book = { "bookID": x.bookID, "count": x.count }
            data2.push(book);
            return data2;
        }
    }
    return isExist1(data, element);
}

async function ShowPriceTotal(data) {
    var totalPrice = 0.0
    totalPrice += (data.totalPrice - ((data.totalPrice * data.discountCode) / 100));
    return totalPrice;
}

router.get('/TotalPriceOnWeek', function(req, res) {
    async function run() {
        var totalPriceOnWeek = 0.0
        var today = new Date();
        today = today.toString().substring(0, 24);
        const orderArray = await getAllOrder(req, res);
        for (var index in orderArray) {
            if (await checkWeek(today, orderArray[index].orderDate) == true) {

                totalPriceOnWeek = await ShowPriceTotal(orderArray[index])
            }
        }
        res.json(totalPriceOnWeek);
    }
    run();
})

router.post('/TotalPriceOnMonth', function(req, res) {
    async function run() {
        var totalPriceOnMonth = 0.0
        var yearCheck = req.body.yearCheck
        var monthCheck = req.body.monthCheck
        var CountBoodBuy = 0
        // today = today.toString().substring(0, 24);
        const orderArray = await getAllOrder(req, res);
        for (var index in orderArray) {
            if (orderArray[index].status == 'Done' || orderArray[index].paymentOption == 'Online') {
                if (await checkMonth(yearCheck, monthCheck, orderArray[index].orderDate) == true) {
                    totalPriceOnMonth += orderArray[index].totalPrice;
                    const orderDetailArray = await getOrderDetailByOrderID(orderArray[index]._id)
                    for(let aOrderArray of orderDetailArray)
                    {
                        CountBoodBuy += aOrderArray["count"]
                    }
                }
               
            }
        }
        const CountUser = await getSosialAccountByOrUserAccountID()
        res.json({totalPriceOnMonth,CountBoodBuy,CountUser});
    }
    run();
})
router.get('/TotalPriceOnYear/:year', function(req, res) {
    async function run() {
        var totalPriceOnYear = 0.0
        var yearCheck = req.params.year
        var CountBoodBuy = 0
        const orderArray = await getAllOrder(req, res);
        for (var index in orderArray) {
            if (orderArray[index].status == 'Done' || orderArray[index].paymentOption == 'Online') {
                if (await checkYear(yearCheck, orderArray[index].orderDate) == true) {
                    totalPriceOnYear += orderArray[index].totalPrice
                    const orderDetailArray = await getOrderDetailByOrderID(orderArray[index]._id)
                    for(let aOrderArray of orderDetailArray)
                    {
                        CountBoodBuy += aOrderArray["count"]
                    }
                }
            }
        }
        const CountUser = await getSosialAccountByOrUserAccountID()

        res.json({totalPriceOnYear,CountBoodBuy,CountUser});
    }
    run();
})
async function CustomPriceByMonth(Data, month, price, arrayOrderDetails) {
    let sum = 0
    for (var key of arrayOrderDetails) {
        sum += key.count
    }
    for (var key in Data) {
        if (Data[key].month == month) {
            Data[key].totalPrice += price;
            Data[key].count += sum
            return Data;
        }
    }
    var dataReturn = {}
    dataReturn = { "month": month, "totalPrice": price, "count": sum }
    Data.push(dataReturn);
    return Data;
}

router.post('/TotalPriceOnEachMonth', function(req, res) {
    async function run() {
        var totalPriceOnMonth = 0.0
        var yearCheck = req.body.yearCheck
        const orderArray = await getAllOrder(req, res);
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        let TotalPriceByEachMonth = []
        for (let i in months) {
            for (var index in orderArray) {
                const orderDetailArray = await getOrderDetailByOrderID(orderArray[index]._id, res);
                if (orderArray[index].status == 'Done' ||orderArray[index].paymentOption == 'Online') {
                    if (await checkMonth(yearCheck, months[i], orderArray[index].orderDate) == true) {
                        TotalPriceByEachMonth = await CustomPriceByMonth(TotalPriceByEachMonth, months[i], orderArray[index].totalPrice, orderDetailArray)
                    }
                }
            }
        }
        res.json(TotalPriceByEachMonth);
    }
    run();
})




router.get('/BuyTheMost', function(req, res) {
    async function run() {
        let arrayBookBuyTheMost = []
        let temp = 0
        const orderArray = await getAllOrder(req, res);
        for (var index in orderArray) {
            const orderDetailArray = await getOrderDetailByOrderID(orderArray[index]._id, res);
            for (var index2 in orderDetailArray) {
                // arrayBookBuyTheMost.push(orderDetailArray[index2]);
                //kiểm tra xem id sách có tồn tại trong danh sách
                //nếu chưa thì thêm , có rồi thì cộng
                arrayBookBuyTheMost = await CreateListBookBuyMost(arrayBookBuyTheMost, orderDetailArray[index2])
            }
        }
        arrayBookBuyTheMost.sort(function(a, b) {
            return b.count - a.count;
        });
        //show 10 book most 
        let arrayBookMost = []

        for (var index in arrayBookBuyTheMost) {
            let aBook = await getBookByID(arrayBookBuyTheMost[index].bookID, res)
            arrayBookMost.push(aBook);
            if (index >= 10) break;
        }
        res.json(arrayBookBuyTheMost);
    }
    run();
})

router.get('/FourBookBuyTheMost', function(req, res) {
        async function run() {
            let arrayBookBuyTheMost = []
            let temp = 0
            const orderArray = await getAllOrder(req, res);
            for (var index in orderArray) {
                const orderDetailArray = await getOrderDetailByOrderID(orderArray[index]._id, res);
                for (var index2 in orderDetailArray) {
                    // arrayBookBuyTheMost.push(orderDetailArray[index2]);
                    //kiểm tra xem id sách có tồn tại trong danh sách
                    //nếu chưa thì thêm , có rồi thì cộng
                    arrayBookBuyTheMost = await CreateListBookBuyMost(arrayBookBuyTheMost, orderDetailArray[index2])
                }
            }
            arrayBookBuyTheMost.sort(function(a, b) {
                return b.count - a.count;
            });
            let arrayFourBookMost = []
            for (let i in arrayBookBuyTheMost) {
                let bookByID = await getBookByID(arrayBookBuyTheMost[i].bookID, res)

                let BookBuyMost = {}
                BookBuyMost = { "nameBook": bookByID.nameBook, "count": arrayBookBuyTheMost[i].count }
                arrayFourBookMost.push(BookBuyMost)
                if (i >= 3) break;
            }
            res.json(arrayFourBookMost);
        }
        run();
    })
    //Buy the most By week
router.get('/BookBuyTheMostOnWeek', function(req, res) {
        async function run() {
            let arrayBookBuyTheMost = []
            let temp = 0
            var today = new Date();
            today = today.toString().substring(0, 24);
            const orderArray = await getAllOrder(req, res);
            for (var index in orderArray) {
                if (await checkWeek(today, orderArray[index].orderDate) == true) {
                    const orderDetailArray = await getOrderDetailByOrderID(orderArray[index]._id, res);
                    for (var index2 in orderDetailArray) {
                        // arrayBookBuyTheMost.push(orderDetailArray[index2]);
                        //kiểm tra xem id sách có tồn tại trong danh sách
                        //nếu chưa thì thêm , có rồi thì cộng
                        arrayBookBuyTheMost = await CreateListBookBuyMost(arrayBookBuyTheMost, orderDetailArray[index2])
                    }
                }
            }
            arrayBookBuyTheMost.sort(function(a, b) {
                return b.count - a.count;
            });
            //show 10 book most 
            let arrayBookMost = []

            for (var index in arrayBookBuyTheMost) {
                let aBook = await getBookByID(arrayBookBuyTheMost[index].bookID, res)
                arrayBookMost.push(aBook);
                if (index >= 10) break;
            }
            res.json(arrayBookBuyTheMost);
        }
        run();
    })
    //Buy the most By month
router.get('/BookBuyTheMostOnMonth', function(req, res) {
        async function run() {
            let arrayBookBuyTheMost = []
            let temp = 0
            var today = new Date();
            today = today.toString().substring(0, 24);
            const orderArray = await getAllOrder(req, res);
            for (var index in orderArray) {
                if (await checkMonth(today, orderArray[index].orderDate) == true) {
                    const orderDetailArray = await getOrderDetailByOrderID(orderArray[index]._id, res);
                    for (var index2 in orderDetailArray) {
                        // arrayBookBuyTheMost.push(orderDetailArray[index2]);
                        //kiểm tra xem id sách có tồn tại trong danh sách
                        //nếu chưa thì thêm , có rồi thì cộng
                        arrayBookBuyTheMost = await CreateListBookBuyMost(arrayBookBuyTheMost, orderDetailArray[index2])
                    }
                }
            }
            arrayBookBuyTheMost.sort(function(a, b) {
                return b.count - a.count;
            });
            //show 10 book most 
            let arrayBookMost = []

            for (var index in arrayBookBuyTheMost) {
                let aBook = await getBookByID(arrayBookBuyTheMost[index].bookID, res)
                arrayBookMost.push(aBook);
                if (index >= 10) break;
            }
            res.json(arrayBookBuyTheMost);
        }
        run();
    })
    //Buy the most By Year
router.get('/BookBuyTheMostOnYear', function(req, res) {
    async function run() {
        let arrayBookBuyTheMost = []
        let temp = 0
        var today = new Date();
        today = today.toString().substring(0, 24);
        const orderArray = await getAllOrder(req, res);
        for (var index in orderArray) {
            if (await checkYear(today, orderArray[index].orderDate) == true) {
                const orderDetailArray = await getOrderDetailByOrderID(orderArray[index]._id, res);
                for (var index2 in orderDetailArray) {
                    // arrayBookBuyTheMost.push(orderDetailArray[index2]);
                    //kiểm tra xem id sách có tồn tại trong danh sách
                    //nếu chưa thì thêm , có rồi thì cộng
                    arrayBookBuyTheMost = await CreateListBookBuyMost(arrayBookBuyTheMost, orderDetailArray[index2])
                }
            }
        }
        arrayBookBuyTheMost.sort(function(a, b) {
            return b.count - a.count;
        });
        //show 10 book most 
        let arrayBookMost = []

        for (var index in arrayBookBuyTheMost) {
            let aBook = await getBookByID(arrayBookBuyTheMost[index].bookID, res)
            arrayBookMost.push(aBook);
            if (index >= 10) break;
        }
        res.json(arrayBookBuyTheMost);

    }
    run();
})


// Khách hàng tiềm năng
async function getUserIDByCusID(req, res) {
    try {
        const aUser = await customer.findById(req);
        return aUser;
    } catch (err) {
        return res.status(501).json(err);
    }
}
//
async function BestUser(data, order, userInOrder) {
    let isExist1 = (data2, orderCheck, userInOrderCheck) => {
        for (var key in data2) {
            if (data2[key].userID == userInOrderCheck.userID) {
                data2[key].totalPrice += orderCheck.totalPrice;
                return data2;
            }
        } {
            var book = {}
            book = { "userID": userInOrderCheck.userID, "totalPrice": orderCheck.totalPrice }
            data2.push(book);
            return data2;
        }
    }
    return isExist1(data, order, userInOrder);
}
//khách hàng tiềm năng theo năm
router.get('/BestUser/:year', function(req, res) {
    async function run() {
        let arrayUserBuyBest = []
        let temp = 0
        const orderArray = await getAllOrder(req, res);
        var yearCheck = req.params.year
        for (var index in orderArray) {
            if (await checkYear(yearCheck, orderArray[index].orderDate) == true) {
                if (orderArray[index].status == 'Done'||orderArray[index].paymentOption == 'Online') {
                    const userInOrder = await getUserIDByCusID(orderArray[index].customerID, res);
                    arrayUserBuyBest = await BestUser(arrayUserBuyBest, orderArray[index], userInOrder)
                }
            } else {
                var book = {}
                book = { "userID": "not found", "totalPrice": 0.0 }
                arrayUserBuyBest.push(book);
            }
        }
        arrayUserBuyBest.sort(function(a, b) {
            return b.totalPrice - a.totalPrice;
        });
        //show khách hàng tiềm năng
        res.json(arrayUserBuyBest[0]);
        return
    }
    run();
});
//Month Example: Jul Jun ....
router.post('/BestUserOnMonth', function(req, res) {
    async function run() {
        let arrayUserBuyBest = []
        var yearCheck = req.body.yearCheck
        var monthCheck = req.body.monthCheck

        const orderArray = await getAllOrder(req, res);
        for (var index in orderArray) {
            if (await checkMonth(yearCheck, monthCheck, orderArray[index].orderDate) == true) {
                if (orderArray[index].status == 'Done'||orderArray[index].paymentOption == 'Online') {
                    const userInOrder = await getUserIDByCusID(orderArray[index].customerID, res);
                    arrayUserBuyBest = await BestUser(arrayUserBuyBest, orderArray[index], userInOrder)
                }
            } else {
                var book = {}
                book = { "userID": "not found", "totalPrice": 0.0 }
                arrayUserBuyBest.push(book);
            }
        }
        arrayUserBuyBest.sort(function(a, b) {
            return b.totalPrice - a.totalPrice;
        });
        //show khách hàng tiềm năng
        res.json(arrayUserBuyBest[0]);
        return
    }
    run();
})


//layas all usser
async function getSosialAccountByOrUserAccountID() {
    try {

        const accountUser = await userAccount.find()
        const accountSosial = await accountsocials.find()
        const total = parseInt(accountUser.length) + parseInt(accountSosial.length)
        console.log( total)
        return total
    } catch (error) {

    }
}
module.exports = router;