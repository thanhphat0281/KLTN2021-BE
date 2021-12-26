const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { ObjectID } = require('mongodb');

const modelOrder = require('../../models/E_payment/order');
const modelOrderDetail = require('../../models/E_payment/orderDetail');
const modelBook = require('../../models/A_store/book');
const nodemailer = require('nodemailer');

const partnerCode = "MOMOIYF420211121";
const accessKey = "hU9agyEwyvIf2AjK";
const secretKey = "asIb5x2pjYn2FQYHQXv8PYBNWH4h4C9F";

var returnUrl = "http://localhost:4200/payment/"
router.post('/', function (req, res) {
    const reqOrder = req.body.order
    const redirectUrl = `http://localhost:3000/paymentMoMo/notifyPaymentMoMo`;
    const ipnUrl = "http://localhost:3000/paymentMoMo/notifyUrl";
    const requestType = "captureWallet"
    const orderInfo = "payment for book store";
    const requestId = partnerCode + new Date().getTime();
    const extraData = encodeBase64(JSON.stringify(req.body))
    const orderId = new ObjectID().toHexString();
    const amount = `${Number(reqOrder.totalPrice) * (100 - (Number(reqOrder.discountCode))) / 100 + Number(reqOrder.feeShip)}`;
    const rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType

    const signature = encrypt(rawSignature);
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: 'en'
    });
    const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/v2/gateway/api/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    }
    sendRequestMoMo(options, requestBody).then(MoMoReturn => {
        res.json(MoMoReturn)
    }).catch(err => { return res.status(500).json(err) })

});

router.get('/notifyPaymentMoMo', function (req, res) {
    const resultQuery = req.query
    var rawSignature = `accessKey=${accessKey}&amount=${resultQuery.amount}&extraData=${resultQuery.extraData}` +
        `&message=${resultQuery.message}&orderId=${resultQuery.orderId}&orderInfo=${resultQuery.orderInfo}` +
        `&orderType=${resultQuery.orderType}&partnerCode=${resultQuery.partnerCode}` +
        `&payType=${resultQuery.payType}&requestId=${resultQuery.requestId}` +
        `&responseTime=${resultQuery.responseTime}&resultCode=${resultQuery.resultCode}&transId=${resultQuery.transId}`
    var extraData = JSON.parse(decodeBase64(`${resultQuery.extraData}`))

    if (resultQuery.signature === encrypt(rawSignature)) {
        if (resultQuery.resultCode == 0) {
            // update order and orderDetail
            saveOrder(extraData.order, resultQuery.orderId)
            saveOrderDetail(extraData.orderDetails, resultQuery.orderId)
            sendMail(extraData.order, extraData.sendMail)
            res.redirect(`${returnUrl + extraData.order.customerID}?resultCode=${resultQuery.resultCode}`)

            //send mail 

        } else {
            res.redirect(`${returnUrl + extraData.order.customerID}?resultCode=${resultQuery.resultCode}`)

        }
    } else {
        res.redirect(`${returnUrl + extraData.order.customerID}?resultCode=${resultQuery.resultCode}`)
    }
});

router.post('/test', async function (req, res) {
    const id = new ObjectID().toHexString();
    console.log(id)
    var item = await saveOrderDetail(req.body, id)
    // Print new id to the console
    res.json(item)
    console.log(id)
});

let encrypt = (data) => {
    var encipher = crypto.createHmac('sha256', secretKey)
        .update(data)
        .digest('hex');
    return encipher;
}
let encodeBase64 = (data) => {
    return Buffer.from(data).toString('base64')
}
let decodeBase64 = (data) => {
    return Buffer.from(data, 'base64').toString('utf8')
}

router.post('/updateQuality', async (req, res) => {
    for (let item of req.body) {
        const book = await modelBook.findById(item.bookID)
        const update = await modelBook.findByIdAndUpdate(book._id, {
            $set: {
                quantity: book.quantity + item.count,
            }
        }, (err, book) => {
            if (err) res.json(err)
        })
    }
    res.json(true)
})

let saveOrder = (Order, OrderId) => {
    var newOrder = new modelOrder()
    newOrder.customerID = Order.customerID;
    newOrder.totalPrice = Order.totalPrice;
    newOrder.orderDate = Order.orderDate;
    newOrder.status = Order.status
    newOrder.paymentOption = Order.paymentOption;
    newOrder.discountCode = Order.discountCode;
    newOrder.feeShip = Order.feeShip;
    newOrder._id = new ObjectID(OrderId)
    newOrder.save(function (err, item) {
        if (err) {
            console.log('Err Saving order');
        } else {
        }
    });
}
let saveOrderDetail = (OrderDetails, orderID) => {
    OrderDetails.forEach(element => {
        element.orderID = orderID
    });
    return modelOrderDetail.insertMany(OrderDetails)
}

let sendMail = (Order, mail) => {
    try {
        function formatCurrency(getNumber) {
            var number = (parseInt(getNumber)).toString();
            var n = number.split('').reverse().join("");
            var n2 = n.replace(/\d\d\d(?!$)/g, "$&,");
            return n2.split('').reverse().join('') + 'VNĐ';
        }
        var output = `
    <head>
        <style>
            table {
                font-family: arial, sans-serif;
                border-collapse: collapse;
                width: 100%;
            }
    
            td,
            th {
                border: 1px solid #dddddd;
                text-align: left;
                padding: 8px;
            }
    
            tr:nth-child(even) {
                background-color: #dddddd;
            }
        </style>
    </head>
    
    <body>
    
        <h3>THÔNG TIN ĐƠN HÀNG BOOKSTORE</h3>
        <ul>
            <li>Người Đặt Hàng : ${mail.name}</li>
            <li>Email : ${mail.email}</li>
            <li>Địa Chỉ Giao Hàng : ${mail.address}</li>
            <li>Số Điện Thoại : ${mail.phone}</li>
        </ul>
        <h3></h3>
        <table>
            <thead>
                <tr>
                    <th>Bìa sách</th>
                    <th>Sách</th>
                    <th>Số Lượng</th>
                    <th>Đơn Giá</th>
                    <th>Tổng Giá</th>
                </tr>
            </thead>
            <tbody>
      `;
        var dem_i = 0;
        var dem_j = 0;
        var dem_k = 0;
        var dem_l = 0;
        var dem_m = 0;
        for (let i of (mail.imgBook).split("next")) {
            dem_j = 0;
            for (let j of (mail.nameBook).split("next")) {
                dem_k = 0;
                for (let k of (mail.count).split("next")) {
                    dem_l = 0;
                    for (let l of (mail.price).split("next")) {
                        dem_m = 0;
                        for (let m of (mail.sale).split("next")) {
                            if (dem_i == dem_j && dem_i == dem_k && dem_i == dem_l && dem_i == dem_m) {
                                if (i != "") {
                                    output = output + `
                            <tr>
                            <td><img src = "${i}" style = "width: 70px;text-align: center;"/></td>
                            <td>${j}</td>
                            <td>${k}</td>
                        `
                                    if (m != 0) {
                                        output = output + `
                                    <td>${formatCurrency(l * (100 - m) / 100)}
                                    <br>
                                    <span style="font-size: 12px;">
                                        <span style="text-decoration: line-through;color:darkgrey;">
                                            ${formatCurrency(l)}
                                        </span><b style="color:red;"> | -${m}%</b>
                                    </span></td>
                                    <td>${formatCurrency(k * l * (100 - m) / 100)}</td>
                                    `
                                    } else {
                                        output = output + `
                                    <td>${formatCurrency(l)}</td>
                                    <td>${formatCurrency(k * l)}</td>
                                    `
                                    };
                                }
                            }
                            dem_m = dem_m + 1;
                        }
                        dem_l = dem_l + 1;
                    }
                    dem_k = dem_k + 1;
                }
                dem_j = dem_j + 1;
            }
            dem_i = dem_i + 1;
        }
        var paymentOption = "";
        if (mail.paymentOption == "Online" || mail.paymentOption == "MoMo") {
            paymentOption = "Đã Thanh Toán"
        } else {
            paymentOption = "Chưa Thanh Toán"
        }
        output = output + `
        </tbody>
        </table>
        <h3>THÔNG TIN THANH TOÁN BOOKSTORE</h3>
        <table style="width:50%;">
            <thead>
                <tr>
                    <th>Nội Dung</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Tổng Tiền</td>
        
                    <td> <span style="float:right;
                    padding-right:10px;">${formatCurrency(Order.totalPrice)}
                                                </span></td>
                </tr>
                <tr>
                    <td>Giảm ${Order.discountCode}%</td>
                    <td><span style="float:right;padding-right:10px;">-${formatCurrency(Order.totalPrice * Order.discountCode / 100)}</span>
                    </td>
                </tr>
                <tr>
                    <td>Phí Vận Chuyển</td>
                    <td><b style="float:right;padding-right:10px;">${formatCurrency(Order.feeShip)}</b></td>
                </tr>
                <tr>
                    <td>Số Tiền Phải Trả</td>
                    <td><b style="float:right;padding-right:10px;">${formatCurrency(Order.totalPrice * (100 - Order.discountCode) / 100 + Order.feeShip)}</b>
                    </td>
                </tr>
                <tr>
                    <td>Ngày Đặt Đơn Hàng</td>
                    <td><b style="float:right;padding-right:10px;">${Order.orderDate}</span></td>
                </tr>
                <tr>
                    <td colspan="2" style="text-align:center;"><b style="padding-right:10px;">Đơn Hàng ${paymentOption}</b>
                    </td>
                </tr>
            </tbody>
        </table>
        </body> `;


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
            to: mail.email, // list of receivers
            subject: 'Node Contact Request', // Subject line
            text: 'Hello world?', // plain text body
            html: output // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Please check your email');
            } else {
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                console.log('Email has been sent--Buy Success');
            }
        });
    } catch (error) {
        console.log(error)
    }

}

let sendRequestMoMo = (options, requestBody) => {
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            res.setEncoding('utf8');
            let data;
            res.on('data', (body) => {
                data = JSON.parse(body);
            });
            res.on('end', () => {
                resolve(data);
            });
        })

        req.on('error', (e) => {
            reject(`problem with request: ${e.message}`);
        });
        console.log("Sending....")
        req.write(requestBody);
        req.end();
    })

}
module.exports = router;