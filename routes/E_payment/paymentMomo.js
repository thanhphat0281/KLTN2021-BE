const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');
const orderDetail = require('../../models/E_payment/orderDetail');
const puppeteer = require('puppeteer');
const order = require('../../models/E_payment/order');
const open = require('open');
const { url } = require('inspector');


const partnerCode = "MOMOIYF420211121";
const accessKey = "hU9agyEwyvIf2AjK";
const secretKey = "asIb5x2pjYn2FQYHQXv8PYBNWH4h4C9F";
const redirectUrl = "http://localhost:3000/paymentMomo/returnUrl";
const ipnUrl = "http://localhost:3000/paymentMomo/notifyUrl";
const requestType = "captureWallet"
const orderInfo = "payment for book store";
var responsePage = {};

var returnUrl = "http://localhost:4200"
router.post('/', function (request, response) {

    const requestId = partnerCode + new Date().getTime();
    responsePage[requestId] = { res: response, time: new Date().getTime() }
    const extraData = encodeBase64(JSON.stringify(request.body))
    const orderId = requestId;
    const amount = request.body.totalPrice;
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
    sendCreate(options, requestBody).then(MomoReturn => {
        openUrl(MomoReturn.payUrl);
    }).catch(err => { return response.status(500).json(err) })

});

router.get('/test', function (req, res) {
    
});
router.get('/returnUrl', function (req, res) {
    const resultQuery = req.query
    var rawSignature = `accessKey=${accessKey}&amount=${resultQuery.amount}&extraData=${resultQuery.extraData}` +
        `&message=${resultQuery.message}&orderId=${resultQuery.orderId}&orderInfo=${resultQuery.orderInfo}` +
        `&orderType=${resultQuery.orderType}&partnerCode=${resultQuery.partnerCode}` +
        `&payType=${resultQuery.payType}&requestId=${resultQuery.requestId}` +
        `&responseTime=${resultQuery.responseTime}&resultCode=${resultQuery.resultCode}&transId=${resultQuery.transId}`
        
    if (resultQuery.signature === encrypt(rawSignature)) {
        if (req.query.resultCode == 0) {
            res.status(200).json({ "result": "success" })
            if (responsePage.hasOwnProperty(resultQuery.requestId)) {
                responsePage[`${resultQuery.requestId}`].res.status(200).json({ "result": "success" })
                clearRes(resultQuery.requestId)

            }
        } else {
            res.status(200).json({ "result": "failure" })
            if (responsePage.hasOwnProperty(resultQuery.requestId)) {
                responsePage[`${resultQuery.requestId}`].res.status(200).json({ "result": "failure" })
                clearRes(resultQuery.requestId)
            }
        }
    } else {
        res.status(500).json({ "result": "data invalid" })
    }
});

router.get('/notifyUrl', function (req, res) {
    
});

function encrypt(data) {
    var encipher = crypto.createHmac('sha256', secretKey)
        .update(data)
        .digest('hex');
    return encipher;
}
function encodeBase64(data) {
    return Buffer.from(data).toString('base64')
}
function decodeBase64(data) {
    return Buffer.from(data, 'base64').toString('ascii')
}
function getQrCode(url) {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(url)

        const results = await page.evaluate(() => {
            let items = document.querySelectorAll('.image-qr-code')
            let links = []
            items.forEach((item) => {
                links.push({
                    title: item.getAttribute('alt'),
                    url: item.getAttribute('src'),
                })
            })
            return links;
        });

        console.log(results)
        resolve(results)
        // Do what you want with the `results`
        await browser.close()
    })

}
async function openUrl(url) {
    console.log(url)
    open(url);
}
function clearRes(reqId) {
    var date = new Date().getTime()
    for (let i in responsePage) {
        // time expire 10 min
        if (date - responsePage[i].time >= 10*60*1000) {
            delete responsePage[i]
        }
    }
    if(responsePage.hasOwnProperty(reqId)){
        delete responsePage[reqId]
    }
}

function sendCreate(options, requestBody) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            res.setEncoding('utf8');
            let data;
            res.on('data', (body) => {
                data = JSON.parse(body);
            });
            res.on('end', () => {
                console.log(data)
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