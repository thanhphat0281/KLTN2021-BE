const express = require('express');
const router = express.Router();
const dataset = require('../../models/dataset');
//dataset
//get all
router.get('/', function(req, res) {
    async function run() {
        console.log('get request for all datasets');
        var datasets = await getALl(req, res);

        // var s = await pearson_correlation(datasets, "Lisa Rose", "Jack Matthews");
        // var s = await similar_user(datasets, 'Jack Matthews', 3, pearson_correlation);
        // console.log(s);
        var s = await recommendation_eng(datasets, 'Toby', pearson_correlation);

        res.json((datasets));
    }
    run();
});

//get all data
async function getALl(req, res) {
    try {
        const data = await dataset.find({

        });

        return data;
    } catch (err) {
        return res.status(501).json(err);
    }
}
//get persion by name
async function getPerson(req) {
    try {
        const P1 = await dataset.find({
            name: req
        });

        return P1;
    } catch (err) {
        return res.status(501).json(err);
    }
}

// async function euclidean_score(dataset, p1, p2) {
//     try {
//         var existp1p2 = {}; //store item existing in both item
//         const Person1 = await getPerson(p1);
//         const Person2 = await getPerson(p2);
//         for (var key1 in Person1) {
//             for (var key2 in Person2) {
//                 if (Person1[key1].book == Person2[key2].book) {
//                     existp1p2[Person1[key1].book] = 1
//                     break;
//                 }
//             }
//         }
//         if (len(existp1p2) == 0) return 0;
//         var sum_of_euclidean_dist = []; //store the  euclidean distance


//         //calculate the euclidean distance
//         for (var key1 in Person1) {
//             for (var key2 in Person2) {
//                 console.log(Person2[key2].book);
//                 if (Person1[key1].book == Person2[key2].book) {
//                     sum_of_euclidean_dist.push(Math.pow(Person1[key1].rate - Person2[key2].rate, 2));
//                     break;
//                 }
//             }
//         }
//         var sum = 0;
//         for (var i = 0; i < sum_of_euclidean_dist.length; i++) {
//             sum += sum_of_euclidean_dist[i]; //calculate the sum of the euclidean
//         }
//         var sum_sqrt = 1 / (1 + Math.sqrt(sum));
//         return sum_sqrt;
//     } catch (err) {
//         return res.status(501).json(err);
//     }
// }

var len = function(obj) {
    var len = 0;
    for (var i in obj) {
        len++
    }
    return len;
}

// var pearson_correlation = async function(dataset, p1, p2) {
async function pearson_correlation(dataset, p1, p2) {
    try {
        var existp1p2 = {};
        const Person1 = await getPerson(p1);
        const Person2 = await getPerson(p2);
        for (var key1 in Person1) {
            for (var key2 in Person2) {
                if (Person1[key1].book == Person2[key2].book) {
                    existp1p2[Person1[key1].book] = 1
                    break;
                }
            }
        }

        var num_existence = len(existp1p2);
        if (num_existence == 0) return 0;
        //store the sum and the square sum of both p1 and p2
        //store the product of both
        var p1_sum = 0,
            p2_sum = 0,
            p1_sq_sum = 0,
            p2_sq_sum = 0,
            prod_p1p2 = 0,
            p1_cur = 0,
            p2_cur = 0;

        //calculate the sum and square sum of each data point
        //and also the product of both point
        for (var key in existp1p2) {
            for (var key1 in Person1) {
                if (key == Person1[key1].book) {
                    p1_cur = Person1[key1].rate;
                    p1_sum += Person1[key1].rate;
                    p1_sq_sum += Math.pow(Person1[key1].rate, 2);
                    break;
                }
            }
            for (var key2 in Person2) {
                if (key == Person2[key2].book) {
                    p2_cur = Person2[key2].rate;
                    p2_sum += Person2[key2].rate;
                    p2_sq_sum += Math.pow(Person2[key2].rate, 2);
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
//tạo danh sách xếp hạng nhà phê bình ứng với person
//với num_user là số lượng hiển thị
//pearson_correlation là function tính hệ số tương quan giữa 2 user
async function similar_user(dataset, person, num_user, pearson_correlation) {
    try {
        var scores = [];
        var datafilter = await deduplicate(dataset); //lọc tên user trùng
        for (var others in datafilter) {
            if (datafilter[others].name != person) {
                //tính hệ số tương quan giữa person và từng user
                var val = await pearson_correlation(datafilter, person, datafilter[others].name)
                var p = datafilter[others].name
                    //danh sách các hệ số tính được
                scores.push({ val: val, p: p });
            }
        }
        scores.sort(function(a, b) { //sắp xếp từ cao đến thấp
            return b.val < a.val ? -1 : b.val > a.val ? 1 : b.val >= a.val ? 0 : NaN;
        });

        var score = [];
        for (var i = 0; i < num_user; i++) {
            score.push(scores[i]);
        }

        return score;
    } catch (err) {
        return res.status(501).json(err);
    }
}
//lọc trùng nhau
async function deduplicate(arr) {
    let isExist = (arr, x) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].name == x.name) return true;
        }
        return false;
    }

    let ans = [];
    arr.forEach(element => {
        if (!isExist(ans, element)) ans.push(element);
    });
    return ans;
}
//Kiểm tra tồn tại by book
async function isExist2(data, element) {
    let isExist1 = (data2, x) => {
        for (var key in data2) {
            if (data2[key].book == x.book) {
                console.log("dung roi day");
                return true;
            }
        } {
            console.log("day la sai");
            return false;
        }
    }
    return isExist1(data, element);
}

//recommend System test
async function recommendation_eng(dataset, person, pearson_correlation) {

    var totals = {
        setDefault: function(props, value) {
            if (!this[props]) {
                this[props] = 0;
            }
            this[props] += value;
        }
    };
    var simsum = {
        setDefault: function(props, value) {
            if (!this[props]) {
                this[props] = 0;
            }

            this[props] += value;
        }
    };
    var rank_lst = [];
    const dataPerson2 = await getPerson(person);
    // Lọc tên trùng
    var datafilter = await deduplicate(dataset);
    for (var other in datafilter) {

        if (datafilter[other].name == person) continue;
        var similar = await pearson_correlation(dataset, person, datafilter[other].name);
        if (similar <= 0) continue;
        const dataPerson1 = await getPerson(datafilter[other].name);
        console.log(other);
        for (var data1 in dataPerson1) {
            if (!(await isExist2(dataPerson2, dataPerson1[data1]))) {
                totals.setDefault(dataPerson1[data1].book, dataPerson1[data1].rate * similar);
                simsum.setDefault(dataPerson1[data1].book, similar);
            }
        }
    }

    for (var item in totals) {
        //this what the setter function does
        //so we have to find a way to avoid the function in the object     
        if (typeof totals[item] != "function") {

            var val = totals[item] / simsum[item];
            rank_lst.push({ val: val, items: item });
        }
    }
    rank_lst.sort(function(a, b) {
        return b.val < a.val ? -1 : b.val > a.val ?
            1 : b.val >= a.val ? 0 : NaN;
    });
    var recommend = [];
    for (var i in rank_lst) {
        recommend.push(rank_lst[i].items);
    }
    console.log([rank_lst, recommend]);
    return [rank_lst, recommend];
}

module.exports = router;