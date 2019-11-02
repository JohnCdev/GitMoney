var db = require("../models");
var Sequelize = require("sequelize");
var Op = Sequelize.Op;
require("dotenv").config();
var keys = require("../keys");
var axios = require("axios");

// const apiHeader = {
//   'api_token': keys.appKeys.wt
// };

module.exports = function (app) {

  // Renders a json object to the page with stock information spanning the dates selected
  app.get("/api/:symbol/:start/:end", function (req, res) {
    db.stockEntries
      .findAll({
        where: {
          symbol: req.params.symbol,
          specificDate: {
            [Op.between]: [req.params.start, req.params.end]
          }
        }
      })
      .then(function (data) {
        var stockArray = [];
        for (var i = 0; i < data.length; i++) {
          var singleDay = data[i].dataValues;
          var stockObj = {
            date: singleDay.specificDate,
            high: singleDay.highVal,
            low: singleDay.lowVal,
            open: singleDay.openVal,
            close: singleDay.closeVal,
            volume: singleDay.volume
          };
          stockArray.push(stockObj);
        }
        var returnObj = {
          symbol: data[0].dataValues.symbol,
          startDate: stockArray[0].date,
          endDate: stockArray[stockArray.length - 1].date,
          open: stockArray[0].open,
          close: stockArray[stockArray.length - 1].close,
          change: (
            ((stockArray[stockArray.length - 1].close - stockArray[0].open) /
              stockArray[0].open) *
            100
          ).toPrecision(4)
        };
        res.json(returnObj);
      });
  });

  app.get("/api/stocks", (req, res) => {
    axios
      .get(
        "https://api.worldtradingdata.com/api/v1/stock?symbol=SNAP,TWTR,VOD.L&api_token=" +
        keys.appKeys.wt
      )
      .then(response => {
        const dataArr = response.data.data;
        // console.log(dataArr);
        // const resObj = [];
        const resObj = {
          symbols: [],
          prices: []
        };
        dataArr.forEach(el => {
          // resObj.push({ price: el.price, symbol: el.symbol });
          resObj.symbols.push(el.symbol);
          resObj.prices.push(el.price);
        });
        res.json(resObj);
      })
      .catch(err => {
        if (err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log("Error", err.message);
        }
        console.log(err.config);
      });
  });

  app.post("/api/livesearch", (req, res) => {
    axios
      .get(
        "https://www.alphavantage.co/query?function=" +
        req.body.period + "&symbol=" +
        req.body.symbol +
        "&apikey=" +
        keys.appKeys.alpha
      )
      .then(response => {
        // console.log(response.data);
        if (req.body.period === "TIME_SERIES_DAILY_ADJUSTED") {
          var dataArr = response.data["Time Series (Daily)"];
        } else if (req.body.period === "TIME_SERIES_WEEKLY_ADJUSTED") {
          var dataArr = response.data["Weekly Adjusted Time Series"];
        } else {
          var dataArr = response.data["Monthly Adjusted Time Series"];
        }

        const resObj = {
          keyPair: [],
          dateArr: ["x"],
          closeArr: ["Close"],
          openArr: []
        };
        let count = 0;
        for (var key in dataArr) {
          count ++;
          if (count > 100) {
            break;
          }
          var day = dataArr[key];
          resObj.keyPair.push({ 
            date: key, 
            open: day["1. open"],
            high: day["2. high"],
            low: day["3. low"],
            close: day["4. close"], 
            volume: day["6. volume"]
          });
          resObj.dateArr.push(key);
          resObj.closeArr.push(day["4. close"]);
        }
        res.json(resObj);
      })
      .catch(err => {
        if (err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log("Error", err.message);
        }
        console.log(err.config);
      });
  });

  //favorite sequelize get all
  app.get("/api/favorites", (req, res) => {
    db.Favorite.findAll({}).then(data => {
      res.json(data);
    });
  });

  //favorite sequelize create
  app.post("/api/favorites", (req, res) => {
    db.Favorite.create({
      symbol: req.body.symbol,
      note: req.body.note
    }).then(() => {
      res.status(204).end();
    });
  });

  //favorite sequelize delete
  app.delete("/api/favorites/:id", (req, res) => {
    db.Favorite.destroy({
      where: {
        id: req.params.id
      }
    }).then(() => {
      res.status(204).end();
    });
  });
};
