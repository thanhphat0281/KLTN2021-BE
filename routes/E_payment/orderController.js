const express = require('express');
const router = express.Router();
const order = require('../../models/E_payment/order');
const customer = require('../../models/B_profile/customer');
//order
//get all
router.get('/', function(req, res) {
    console.log('get request for all orders');
    order.find({})
        .exec(function(err, orders) {
            if (err) {
                console.log("err req orders");
            } else {
                orders.sort(function(a, b) {
                    return (Date.parse((b.orderDate).toString())) - (Date.parse((a.orderDate).toString()));
                });
                res.json(orders);
            }
        });
});

// get a person
router.get('/:orderID', function(req, res) {
    order.findById(req.params.orderID)
        .exec(function(err, orders) {
            if (err) console.log("Error retrieving order");
            else res.json(orders);
        });
})

//post
router.post('/', function(req, res) {
    var neworder = new order();
    neworder.customerID = req.body.customerID;
    neworder.totalPrice = req.body.totalPrice;
    neworder.orderDate = req.body.orderDate;
    neworder.status = "New"
    neworder.paymentOption = req.body.paymentOption;
    neworder.discountCode = req.body.discountCode;
    neworder.feeShip = req.body.feeShip;
    neworder.save(function(err, insertedorder) {
        if (err) {
            console.log('Err Saving order');
        } else {
            res.json(insertedorder);
        }
    });
});


//update
router.put('/:id', function(req, res) {
        order.findByIdAndUpdate(req.params.id, {
                $set: {
                    customerID: req.body.customerID,
                    totalPrice: req.body.totalPrice,
                    orderDate: req.body.orderDate,
                    status: req.body.status,
                    paymentOption: req.body.paymentOption,
                    discountCode: req.body.discountCode,
                    feeShip: req.body.feeShip,
                }
            }, {
                new: true
            },
            function(err, updatedorder) {
                if (err) {
                    res.send("err Update");
                } else {
                    res.json(updatedorder);
                }
            })
    })
    //delete
router.delete('/:id', function(req, res) {
    order.findByIdAndRemove(req.params.id, function(err, deleteorder) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});
//get order by customerID
router.get('/findByCustomerID/:customerID', function(req, res) {
    order.find({

            customerID: req.params.customerID
        })
        .exec(function(err, orders) {
            if (err) console.log("Error retrieving orders");
            else { res.json(orders); }
        });
})

//get order by customerID
router.get('/findByUserID/:userID', function(req, res) {
    async function run() {
        let arrayOrder = []
        const data = await getAllCustomerByUserID(req.params.userID, res);
        for (let index in data) {
            const dataOrder = await getAllOrderByCustomerID(data[index]._id, res);
            for (let index2 in dataOrder) {
                arrayOrder.push(dataOrder[index2]);
            }
        }
        console.log(arrayOrder);
        arrayOrder.sort(function(a, b) {
            return (Date.parse((b.orderDate).toString())) - (Date.parse((a.orderDate).toString()));
        });

        res.json(arrayOrder);

    }
    run();
})

async function getAllCustomerByUserID(userID, res) {

    try {
        const customerArray = await customer.find({
            userID: userID
        });
        // console.log(customerArray)
        return customerArray;
    } catch (err) {
        return res.status(501).json(err);
    }
}

async function getAllOrderByCustomerID(customerID, res) {
    try {
        const orderArray = await order.find({
            customerID: customerID
        });
        return orderArray;
    } catch (err) {
        return res.status(501).json(err);
    }
}



module.exports = router;