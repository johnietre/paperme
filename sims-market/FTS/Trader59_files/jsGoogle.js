google.load('visualization', '1', { 'packages': ['corechart'] });

var dt = [];
var chartChanged = [];
var options;
var mOptions;
var nTime = 0;
var nCharts = 0;
var bidBookHTML = [];
var askBookHTML = [];
var bidChanged = [];
var askChanged = [];
var isPlotting = false;

function initChart(n, nt) {
    nTime = parseInt(nt);
    nCharts = parseInt(n);
    options = {
        title: '',
        hAxis: {
            title: '', titleTextStyle: { color: 'yellow' }, textStyle: { color: '#FFF' }, viewWindow: { min: 0, max: nTime }, min: 0, max: nTime
        },
        vAxis: {
            title: '', titleTextStyle: { color: 'yellow' }, textStyle: { color: '#FFF' }, format: '0'
        },
        tooltip: { trigger: 'hover' },
        colors: ['red', 'cyan', 'yellow'],
        legend: 'none',
        curveType: 'function',
        backgroundColor: 'transparent',
        chartArea: { left: 20, top: 5, 'width': '80%', 'height': '80%' },
        width: '99%',
        height: 95,
        interpolateNulls: true
    };
    dt.length = 0;
    for (var isno = 1; isno <= nCharts; isno++) {
        var dataTable = new google.visualization.DataTable();
        dataTable = new google.visualization.DataTable();
        dataTable.addColumn('number', 'Time');
        dataTable.addColumn('number', 'Bid');
        dataTable.addColumn('number', 'Ask');
        dataTable.addColumn('number', 'Last');
        dt.push(dataTable);
        var chart = new google.visualization.LineChart(document.getElementById('chart_div' + isno));
        chart.draw(dataTable, options);
        chartChanged.push(false);
        bidBookHTML.push(" ");
        askBookHTML.push(" ");
        bidChanged.push(false);
        askChanged.push(false);
    }
}

function setBidHTML(isno, strHTML) {
    var i = parseInt(isno);
    i = i - 1;
    if (i >= 0) {
        bidBookHTML[i] = strHTML;
        bidChanged[i] = true;
    }
}
function setAskHTML(isno, strHTML) {
    var i = parseInt(isno);
    i = i - 1;
    if (i >= 0) {
        askBookHTML[i] = strHTML;
        askChanged[i] = true;
    }
}

function clearBooks() {
    for (var isno = 1; isno <= nControls; isno++) {
        $("#bidBook" + isno + "> tbody").html("");
        $("#askBook" + isno + "> tbody").html("");
        bidChanged[isno - 1] = false;
        askChanged[isno - 1] = false;
        bidBookHTML[isno - 1] = "";
        askBookHTML[isno - 1] = "";
    }
}

function setAllBooks() {
    if (nCharts == 0) return;
    for (var isno = 0; isno < nCharts; isno++) {
        if (bidChanged[isno] == true) {
            $("#bidBook" + (isno + 1) + "> tbody").html(bidBookHTML[isno]);
            bidChanged[isno] == false;
        }
        if (askChanged[isno] == true) {
            $("#askBook" + (isno + 1) + "> tbody").html(askBookHTML[isno]);
            askChanged[isno] == false;
        }
    }
}

function plotChart(isno, iTime, bid, ask, last) {

    if (isno === undefined) return;
    if (iTime === undefined) return;
    var iT = parseInt(iTime);
    if (iT < 0) return;

    var b = parseFloat(bid);
    var a = parseFloat(ask);
    var l = parseFloat(last);
    if (b <= 0 & a <= 0 & l <= 0) return;
    //var chart = new google.visualization.LineChart(document.getElementById('chart_div' + isno));

    isno = isno - 1; //stocks are 1 to n
    dt[isno].addRow();

    var iRow = dt[isno].getNumberOfRows() - 1;
    dt[isno].setValue(iRow, 0, iT);
    if (b > 0) dt[isno].setValue(iRow, 1, b);
    if (a > 0) dt[isno].setValue(iRow, 2, a);
    if (l > 0) dt[isno].setValue(iRow, 3, l);

    chartChanged[isno] = true;
    updateSupportPrices(isno, iT, b, a, l);

    //chart.draw(dt[isno], options);
}

function plotAllCharts() {
    if (nCharts == 0) return;
    isPlotting = true;
    for (var isno = 0; isno < nCharts; isno++) {
        if (chartChanged[isno] == true) {
            var chart = new google.visualization.LineChart(document.getElementById('chart_div' + (isno + 1)));
            chart.draw(dt[isno], options);
            if (isno == iSnoClicked - 1) drawMontagePlot(isno);
            chartChanged[isno] = false;
        }
    }
    isPlotting = false;
}

function drawMontagePlot(isno) {
    if (nCharts == 0) return;
    // different options for the montage chart
    mOptions = {
        title: '',
        hAxis: {
            title: '', titleTextStyle: { color: 'yellow' }, textStyle: { color: '#FFF' }, viewWindow: { min: 0, max: nTime }, min: 0, max: nTime
        },
        vAxis: {
            title: '', titleTextStyle: { color: 'yellow' }, textStyle: { color: '#FFF' }, format: '0.0'
        },
        tooltip: { trigger: 'hover' },
        colors: ['red', 'cyan', 'yellow'],
        legend: 'none',
        curveType: 'function',
        backgroundColor: 'transparent',
        chartArea: { left: 35, top: 5, 'width': '75%', 'height': '80%' },
        width: '99%',
        height: '100%',
        interpolateNulls: true
    };

    //isno from 0 to nStock-1
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(dt[isno], mOptions);
}