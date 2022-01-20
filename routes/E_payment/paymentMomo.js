const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');

const env = require('../../env')

const partnerCode = env.partnerCode;
const accessKey = env.accessKey;
const secretKey = env.secretKey;

var returnUrl = env.hostFE + "/payment/"
router.post('/', function (req, res) {
    const reqOrder = req.body.order
    const redirectUrl = env.hostBE + `/paymentMoMo/notifyPaymentMoMo`;
    const ipnUrl = env.hostBE + "/paymentMoMo/notifyUrl";
    const requestType = "captureWallet"
    const orderInfo = "payment for book store";
    const requestId = partnerCode + new Date().getTime();
    const extraData = encodeBase64(JSON.stringify(req.body))
    const orderId = requestId
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
        res.redirect(`${returnUrl + extraData.order.customerID}?resultCode=${resultQuery.resultCode}`)

    } else {
        res.redirect(`${returnUrl + extraData.order.customerID}?resultCode=${resultQuery.resultCode}`)
    }
});

router.post('/test', async function (req, res) {
    deleteCartBook(req.body.id)
    res.json({ ok: "ok" })
    console.log("ok")
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