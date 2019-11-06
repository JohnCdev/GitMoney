var db = require("../models");
var Sequelize = require("sequelize");
var Op = Sequelize.Op;
var axios = require("axios");
require("dotenv").config();
var keys = require("../keys");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    db.Example.findAll({}).then(function () {
      res.render("index", {});
    });
  });

  //dashboard
  app.get("/dashboard", (req, res) => {
    res.render("dashboard");
  });

  //live-search
  app.get("/search", (req, res) => {
    res.render("search");
  });

  //historical-search
  app.get("/search-historical", (req, res) => {
    db.stockEntries
      .findAll({
        attributes: ["symbol"],
        where: {
          specificDate: "2017-01-03"
        }
      })
      .then(function (data) {
        var symbolArr = []; 
        for (var i = 0; i < data.length;i++){
          var symbolObj = {
            symbol: data[i].dataValues.symbol
          };
          symbolArr.push(symbolObj);
        }
        var returnObj = {
          symbols: symbolArr
        };
        res.render("search-historical",returnObj);
      });
  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });
};
