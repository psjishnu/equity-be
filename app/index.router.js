const app = require("express");
const axios = require("axios");
const router = app.Router();
const moment = require("moment");
var yahooFinance = require("yahoo-finance");
const Data = require("./data.model");
const roundNumber = (numb) => {
  return Math.round((numb + Number.EPSILON) * 100) / 100;
};
const processData = (data) => {
  const day = moment(data.date).format("dddd");
  if (day !== "Friday") {
    return 1;
  } else
    return {
      date: moment(data.date).format("DD-MM-YYYY"),
      data: roundNumber(data.close),
    };
};
const processFirm = (quotes) => {
  const arr = [];
  for (let i = 0; i < quotes.length; i++) {
    if (arr.length == 2) break;
    const res = processData(quotes[i]);
    if (res !== 1) arr.push(res);
  }
  return arr;
};
router.get("/getdata", async (req, res) => {
  const today = moment(new Date()).format("YYYY-MM-DD");
  const prevDay = moment(new Date()).subtract(1, "month").format("YYYY-MM-DD");
  let { firm1, firm2 } = req.query;
  firm1 = firm1.toUpperCase();
  firm2 = firm2.toUpperCase();
  const firm1Data = await yahooFinance.historical({
    symbol: firm1 || "_NULL_",
    from: prevDay,
    to: today,
    // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
  });
  const firm2Data = await yahooFinance.historical({
    symbol: firm2 || "_NULL_",
    from: prevDay,
    to: today,
  });
  const result1 = processFirm(firm1Data);
  const result2 = processFirm(firm2Data);
  let long1 = "",
    long2 = "",
    short1 = "",
    short2 = "",
    spread1 = "",
    spread2 = "",
    avg = "";
  var1 = "";
  const varianceArr = [];
  if (result1.length > 0) {
    long1 = result1[0].data;
    long2 = result1[1].data;
  }
  if (result2.length > 0) {
    short1 = result2[0].data;
    short2 = result2[1].data;
  }
  if (long1 && short1) {
    spread1 = roundNumber(long1 / short1);
  }
  if (long2 && short2) {
    spread2 = roundNumber(long2 / short2);
  }
  if (spread1 && spread2) {
    var1 = roundNumber(100 * (spread2 - spread1));

    const firmData = await Data.findOne({ firm1, firm2 });
    const dateNow = result1[0].date;

    if (!firmData) {
      const newData = [
        { variance: var1, date: dateNow },
        { variance: var1, date: dateNow },
        { variance: var1, date: dateNow },
        { variance: var1, date: dateNow },
        { variance: var1, date: dateNow },
        { variance: var1, date: dateNow },
        { variance: var1, date: dateNow },
        { variance: var1, date: dateNow },
        { variance: var1, date: dateNow },
        { variance: var1, date: dateNow },
      ];
      const datanew = new Data({ firm1, firm2, varianceList: newData });
      await datanew.save();
    } else {
      let { varianceList } = firmData;
      if (varianceList[9].date !== dateNow) {
        for (let i = 1; i < 10; i++) {
          varianceList[i - 1] = varianceList[i];
        }
        varianceList[9] = { variance: var1, date: dateNow };
        avg = 0;
        for (let i = 0; i < 10; i++) {
          avg += varianceList[i].variance;
          varianceArr.push(varianceList[i].variance);
        }
        avg /= 10;
        firmData.varianceList = varianceList;
        await firmData.save();
      } else {
        avg = 0;
        for (let i = 0; i < 10; i++) {
          avg += Number(varianceList[i].variance);
          varianceArr.push(varianceList[i].variance);
        }
        avg /= 10;
      }
    }
  }

  res.json({
    long1,
    long2,
    spread1,
    spread2,
    short1,
    short2,
    var1,
    avg,
    varianceArr,
  });
});

router.get("/", async (req, res) => {
  return res.render("index");
});
module.exports = router;
