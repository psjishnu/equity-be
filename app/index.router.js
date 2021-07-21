const app = require("express");
const axios = require("axios");
const router = app.Router();
const moment = require("moment");
var yahooFinance = require("yahoo-finance");

const roundNumber = (numb) => {
  return Math.round((numb + Number.EPSILON) * 100) / 100;
};
const processData = (data) => {
  const day = moment(data.date).format("dddd");
  if (day !== "Friday") {
    return 1;
  } else return roundNumber(data.close);
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
  const { firm1, firm2 } = req.query;

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
  res.json({ result1, result2 });
});

router.get("/", async (req, res) => {
  return res.render("index");
});
module.exports = router;
