var $submit = $("#submit");

console.log("loaded");

$(document).ready(function() {
  $("#submit").click(function() {
    $("#c3-display").show();
  });
});

var searchSubmit = () => {
  event.preventDefault();

  var searchObj = {
    symbol: $("#symbolInput").val().trim().toUpperCase(),
    from: $("#fromYearSelect :selected").val() + "-" + $("#fromMonthSelect :selected").val() + "-" +$("#fromDaySelect :selected").val(),
    to: $("#toYearSelect :selected").val() + "-" + $("#toMonthSelect :selected").val() + "-" +$("#toDaySelect :selected").val(),
  };

  if (moment(searchObj.from) > moment(searchObj.to)){
    return $("#invalidDate").modal("show");
  }
  if (searchObj.symbol === "") {
    return $("#emptyInput").modal("show");
  }

  $.ajax({
    type: "POST",
    url: "/api/historicalsearch",
    data: searchObj
  }).then(response => {

    const dateArr = []; dateArr.push("x");
    const closeArr = []; closeArr.push("Close");
    const openArr = []; openArr.push("Open");
    const highArr = []; highArr.push("High");
    const lowArr = []; lowArr.push("Low");

    for (var i=0;i<response.dataArr.length;i++){
      dateArr.push(response.dataArr[i].date);
      closeArr.push(response.dataArr[i].close);
      openArr.push(response.dataArr[i].open);
      highArr.push(response.dataArr[i].high);
      lowArr.push(response.dataArr[i].low);
    }
    //removing previous search
    $("#chart").empty();
    $("#stockNameHeader").empty();
    $("#stockNameHeader2").empty();
    $("#main-head").empty();
    $("#meta-head").empty();
    $("#meta-body").empty();

    $("#stockNameHeader").append("<h4>Meta Results for Stock: " + searchObj.symbol.toUpperCase() + "<h4>");

    $("#meta-head")
      .append("<th scope='col'>Initial Open($)</th>")
      .append("<th scope='col'>Final Close($)</th>")
      .append("<th scope='col'>Change(%)</th>")
      .append("<th scope='col'>Overall High($)</th>")
      .append("<th scope='col'>Overall Low($)</th>")
      .append("<th scope='col'>Highest Volume</th>");

    $("#meta-body").append("<tr><td>" + response.open + "</td><td>" + response.close + "</td><td>" +
     response.change + "</td><td>" + response.high + "</td><td>" + response.low + "</td><td>" + response.volume + "</td></tr>");

    //printing table
    $("#stockNameHeader2").append("<h4>All Results<h4>");
    $("#main-head")
      .append("<th scope='col'>Date</th>")
      .append("<th scope='col'>Open($)</th>")
      .append("<th scope='col'>High($)</th>")
      .append("<th scope='col'>Low($)</th>")
      .append("<th scope='col'>Close($)</th>")
      .append("<th scope='col'>Volume</th>");
    $("#main-body").empty();
    response.dataArr.forEach(el => {
      let dateTd = $("<td>").text(el.date);
      let openTd = $("<td>").text(el.open);
      let highTd = $("<td>").text(el.high);
      let lowTd = $("<td>").text(el.low);
      let closeTd = $("<td>").text(el.close);
      let volumeTd = $("<td>").text(el.volume);
      let newRow = $("<tr>")
        .append(dateTd)
        .append(openTd)
        .append(highTd)
        .append(lowTd)
        .append(closeTd)
        .append(volumeTd);
      $("#main-body").append(newRow);
    });
    //generating chart
    var chart = c3.generate({
      bindto: "#chart",
      data: {
        x: "x",
        columns: [dateArr, closeArr, openArr, highArr, lowArr]
      },
      axis: {
        x: {
          type: "timeseries",
          label: {
            position: "middle"
          },
          tick: {
            format: "%Y-%m-%d"
          }
        },
        y: {
          label: {
            text: "Value($)",
            position: "middle"
          },
          tick: {
            format: d3.format("$,")
          }
        }
      }
    });
  });
};

$("#emptyInput").on("shown.bs.modal", () => {
  $("#emptyInput").trigger("focus");
});

$submit.on("click", searchSubmit);