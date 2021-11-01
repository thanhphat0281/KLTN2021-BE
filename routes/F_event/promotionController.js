const express = require('express');
const router = express.Router();
const promotion = require('../../models/F_event/promotion');
//promotion
//get all
router.get('/', function(req, res) {
    console.log('get request for all promotions');
    promotion.find({})
        .exec(function(err, promotions) {
            if (err) {
                console.log("err req promotions");
            } else {
                res.json(promotions);
            }
        });
});

// get a person
router.get('/:promotionID', function(req, res) {
    promotion.findById(req.params.promotionID)
        .exec(function(err, promotions) {
            if (err) console.log("Error retrieving promotion");
            else res.json(promotions);
        });
})

//post
router.post('/', function(req, res) {
    var newpromotion = new promotion();
    newpromotion.headerPromotion = req.body.headerPromotion;
    newpromotion.imgPromotion = req.body.imgPromotion;
    newpromotion.detailPromotion = req.body.detailPromotion;
    newpromotion.discount = req.body.discount;
    newpromotion.ifDiscount = req.body.ifDiscount;
    newpromotion.startDate = req.body.startDate;
    newpromotion.endDate = req.body.endDate;
    newpromotion.listBookIn = req.body.listBookIn;
    newpromotion.isShow = req.body.isShow;
    newpromotion.StatusUpdateBookSale = "NotUse"
    newpromotion.save(function(err, insertedpromotion) {
        if (err) {
            console.log('Err Saving promotion');
        } else {
            res.json(insertedpromotion);
        }
    });
});


//update
router.put('/:id', function(req, res) {
        promotion.findByIdAndUpdate(req.params.id, {
                $set: {
                    headerPromotion: req.body.headerPromotion,
                    imgPromotion: req.body.imgPromotion,
                    detailPromotion: req.body.detailPromotion,
                    discount: req.body.discount,
                    ifDiscount: req.body.ifDiscount,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    listBookIn: req.body.listBookIn,
                    isShow: req.body.isShow,
                    StatusUpdateBookSale: req.body.StatusUpdateBookSale,

                }
            }, {
                new: true
            },
            function(err, updatedpromotion) {
                if (err) {
                    res.send("err Update");
                } else {
                    res.json(updatedpromotion);
                }
            })
    })
    //delete
router.delete('/:id', function(req, res) {
    promotion.findByIdAndRemove(req.params.id, function(err, deletepromotion) {
        if (err) {
            res.send('err Delete');
        } else {
            res.json({ message: 'Successfully deleted' });
        }
    });
});



router.get('/Top3/3PromotionShow', function(req, res) {
    
    async function run() {

        var Listmonth = { "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12" }
        var now = new Date();
        var nowSplit = now.toString().split(" ") //hiện tại  
        var nowDate=""
        nowDate = nowSplit[3] + "-" + Listmonth[nowSplit[1]] + "-" + nowSplit[2] + " " + nowSplit[4].split(":")[0] + ":" + nowSplit[4].split(":")[1] 

        const AllPromotion = await getAll()
        ThreePromotion = []
        for (let index of AllPromotion) {
            if (index.isShow == "true") {   //duoc phep hien thi
                  //kiểm tra hiện tại so với bắt đầu và kết thúc
                if(Date.parse(index.startDate)<=Date.parse(nowDate) && Date.parse(index.endDate)>=Date.parse(nowDate))
                {
                    ThreePromotion.push(index)
                }
            }
          
        }
        res.json(ThreePromotion)
    }
    run()
});

//get all
async function getAll() {
    const listPromotion = await promotion.find({})
    return listPromotion
}
router.get('/updateIsShow/:id', function(req, res) {
    async function run()
    {
        const promo =await getByID(req.params.id)

        const update = await UpdateIsShow(req.params.id,promo)
        res.json(update)
    }
    run()
})
 async function getByID(id)
 {
    const promo =  await promotion.findById(id)
    console.log(promo)
    if(promo.isShow=="true"){
        console.log("false")
            return "false"
    }
    console.log("true")
    return "true"
 }
 async function UpdateIsShow(id,check)
 {
    const Update = await promotion.findByIdAndUpdate(id, {
        $set: {
            isShow: check,
        }
    }, {
        new: true
    })
    return Update
 }



 //get All manager promotion (check theo day trước sau và hiện tại)
 router.get('/managerPromotionGet/GetAll', function(req, res) {
    async function run()
    {
        const AllPromot= await getAllPromotionExistToDay()
        res.json(AllPromot)
    }
    run()
})
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
 
        const ListPromotion=[]
        for (let APromotion of AllPromotion) {       
            var IsExist = await CheckExistTime(APromotion["startDate"],APromotion["endDate"],nowDate)
            if(IsExist==0) {
                const status = "0"
                APromotion= {APromotion,status}
                ListPromotion.push(APromotion)
            }
            if(IsExist==1) {
                const status = "1"
                APromotion= {APromotion,status}
                ListPromotion.push(APromotion)
            }
            if(IsExist==2) {
                const status = "2"
                APromotion= {APromotion,status}
                ListPromotion.push(APromotion)
            }
        }
        //sort []
        ListPromotion.sort(function(a, b) {
            return a.status - b.status;
        });
        return (ListPromotion)
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
        //now = 1 
        if(Date.parse(Start) <= Date.parse(nowCheckDate)&& Date.parse(End) >= Date.parse(nowCheckDate)) {
            return 1
        }
        //before = 0
        if(Date.parse(Start) > Date.parse(nowCheckDate)) {
            return 0
        }
        //after = 2
        return 2
    }
module.exports = router;