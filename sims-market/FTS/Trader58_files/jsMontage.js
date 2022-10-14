var cMontageSecName = 0;
var cMontageBid = 1;
var cMontageAsk = 2;
var cMontageLast = 3;
var cMontagePosition = 4;
var cMontagePayoff = 5;
var montageLabels = ['mSecName', 'mBid', 'mRaiseBid', 'mHitBid', 'mAsk', 'mLowerAsk', 'mHitAsk', 'mLast', 'mPosition', 'mPayoff'];

var iSnoClicked = -1;
var nMontageStocks = 0;

function createTraderMontage(msg) {
    var table = document.getElementById("PositionTable");
    var nStock = parseInt(msg.msg);
    nMontageStocks = nStock;
    $("#PositionTable > thead").html("");
    var nMontageCols = montageLabels.length;
    var strHeader = "<tr><td class='theader'>Security</td>";
    strHeader = strHeader + "<td class='theader'>Bid</td>";
    strHeader = strHeader + "<td class='theader'></td>";
    strHeader = strHeader + "<td class='theader'></td>";
    strHeader = strHeader + "<td class='theader'>Ask</td>";
    strHeader = strHeader + "<td class='theader'></td>";
    strHeader = strHeader + "<td class='theader'></td>";
    strHeader = strHeader + " <td class='theader'>Last</td>";
    strHeader = strHeader + "<td class='theader'>Position</td>";
    strHeader = strHeader + "<td class='theader'>Payoff</td>";
    //strHeader = strHeader + "<td class='theader'>My VWAP</td>";
    //strHeader = strHeader + "<td class='theader'>Mkt VWAP</td></tr> ";
    $("#PositionTable > thead").html(strHeader);

    $("#PositionTable > tbody").html("");
    var tableRef = document.getElementById('PositionTable').getElementsByTagName('tbody')[0];

    for (var i = 1; i <= nStock; i++) {
        var row = tableRef.insertRow(0);
        var iSno = nStock - i + 1;
        for (var j = 0; j < nMontageCols - 1; j++) {
            row.insertCell(0);
            row.cells[0].innerHTML = "<span id=" + montageLabels[nMontageCols - j - 1] + iSno + " class='secQuote'></span>";
        }
        //security name and handler
        row.insertCell(0);
        row.cells[0].innerHTML = "<span class='secQuote' id='mSecName" + iSno + "' onclick='mSnoClicked(" + iSno + ")' </span>";
        //add the images for the trade icons and the handlers
        document.getElementById('mRaiseBid' + iSno).innerHTML = "<img src='Images/Arrow2 Up.ico' class='imgTrade' title='Raise Bid' onclick='mRaiseBid(" + iSno + ")' />";
        document.getElementById('mHitBid' + iSno).innerHTML = "<img src='Images/Target_Magenta.ico' class='imgTrade' title='Hit Bid' onclick='mHitBid(" + iSno + ")' />";
        document.getElementById('mLowerAsk' + iSno).innerHTML = "<img src='Images/Arrow2 Down.ico' class='imgTrade' title='Lower Ask' onclick='mLowerAsk(" + iSno + ")' />";
        document.getElementById('mHitAsk' + iSno).innerHTML = "<img src='Images/Target_blue.ico' class='imgTrade' title='Hit Ask' onclick='mHitAsk(" + iSno + ")' />";
    }
}
function handleMessageMontage(msg) {
    //$('#statusLabel').html(msg.header + " " + msg.msg);
    switch (msg.header) {
        case cHeaderLoginError:
            //already handled
            break;
        case cLogin:
            //already handled
            break;
        case cHeaderTime:
            //already handled
            break;
        case cHeaderMessage:
            //already handled
            break;
        case cHeaderInitTrial:
            //already handled
            break;
        case cHeaderNStock:
            createTraderMontage(msg);
            break;
        case cHeaderStockName:
            var isno = parseInt(msg.isno);
            var headerID = "mSecName" + isno;
            document.getElementById(headerID).innerHTML = msg.msg;
            break;
        case cHeaderIntRate:
            //already handled
            break;
        case cHeaderBestBid:
            var isno = msg.isno;
            if (msg.msg == "") {
                document.getElementById("mBid" + isno).innerHTML = "&nbsp;";
                //$("#bidBook" + isno + "> tbody").html("");
            } else {
                document.getElementById("mBid" + isno).innerHTML = msg.price + "/" + msg.qty;
                if (msg.displayName == myName) document.getElementById("mBid" + isno).innerHTML = msg.price + "/" + msg.qty + "*";
                //$("#bidBook" + isno + "> tbody").html(msg.msg2);
            }
            if (isno == iSnoClicked) {
                document.getElementById("secBottomBook").innerHTML = document.getElementById("secBottomBook" + isno).innerHTML;
            }
            break;
        case cHeaderBestAsk:
            var isno = msg.isno;
            if (msg.msg == "") {
                document.getElementById("mAsk" + isno).innerHTML = "&nbsp;";
                //$("#askBook" + isno + "> tbody").html("");
            } else {
                document.getElementById("mAsk" + isno).innerHTML = msg.price + "/" + msg.qty;
                if (msg.displayName == myName) document.getElementById("mAsk" + isno).innerHTML = msg.price + "/" + msg.qty + "*";
                //$("#askBook" + isno + "> tbody").html(msg.msg2);
            }

            if (isno == iSnoClicked) {
                document.getElementById("secBottomBook").innerHTML = document.getElementById("secBottomBook" + isno).innerHTML;
            }

            break;
        case cHeaderLastTrade:
            var isno = msg.isno;
            var lastPrice = msg.price;
            var clr = '#FEFEFE';
            if (msg.lastTick == 1) { lastPrice = lastPrice + '&#8593;'; clr = 'lime'; };
            if (msg.lastTick == -1) { lastPrice = lastPrice + '&#8595;'; clr = 'red'; };
            document.getElementById("mLast" + isno).innerHTML = lastPrice;
            $('#mLast' + isno).css('color', clr);
            break;
        case cHeaderChartData:
            //plotChart(msg.isno, msg.iTime, msg.msg, msg.msg1, msg.msg2);
            break;
        case cHeaderCash:
            //already handled
            break;
        case cHeaderEndow:
            var isno = msg.isno;
            document.getElementById("mPosition" + isno).innerHTML = msg.msg;
            if (msg.msg1 != null) {//futures obligation
                document.getElementById("mPosition" + isno).innerHTML = msg.msg + "(" + msg.msg1 + ")";
            }
            break;
        case cHeaderMktMak:
            //already handled
            break;
        case cHeaderDiv:
            var isno = msg.isno;
            document.getElementById("mPayoff" + isno).innerHTML = msg.msg;
            break;
        case cHeaderStartPeriod:
            //clearData(false);
            if (iSnoClicked < 0) { mSnoClicked(1); } else { mSnoClicked(iSnoClicked); }
            break;
        case cHeaderPauseMarket:
            //already handled
            break;
        case cHeaderResumeMarket:
            //already handled
            break;
        case cHeaderInformation:
            var isno = msg.isno;
            if (isno == iSnoClicked) document.getElementById("mlblInfo").innerHTML = document.getElementById("lblInfo" + isno).innerHTML;
            //document.getElementById("lblInfo" + isno).innerHTML = msg.msg;
            break;
        case cHeaderError:
            //already handled
            break;
        case cHeaderPopupError:
            //already handled
            break;
        case cHeaderPerformance:
            //already handled
            break;
        case cHeaderOptionalMessage:
            document.getElementById("msg2Label").style.visibility = "hidden";
            document.getElementById("btnMsgYes").disabled = false; 
            document.getElementById("btnMsgNo").disabled = false;
            document.getElementById("msg2Label").innerHTML = msg.msg;
            document.getElementById("msg3Label").innerHTML = "";
            $("#dlgMessaging").dialog("open");

            //if (confirm("You have received a message, click OK to see it")) {
            //    alert(msg.msg);
            //    var msg1 = window.JSON.stringify({ header: cHeaderOptMsgAccepted });
            //    ws.send(msg1);
            //} else {
            //    var msg2 = window.JSON.stringify({ header: cHeaderOptMsgRejected });
            //    ws.send(msg2);
            //}
            break;
        case cHeaderOptionalMessageNumAccepted:
            document.getElementById("msg3Label").innerHTML = msg.msg;
            break;
        default:
        //$('#statusLabel').html(msg.header + " " + msg.msg);
    }
}
function mSnoClicked(iSno) {
    iSnoClicked = iSno;
   // alert("Clicked " + isno);
    //var bidStatus = document.getElementById("imHitBid" + isno).disabled;
    //alert("Clicked " + bidStatus);
    document.getElementById("mSecName").innerHTML = document.getElementById("mSecName" + iSno).innerHTML
    document.getElementById("mlblInfo").innerHTML = document.getElementById("lblInfo" + iSno).innerHTML;
    document.getElementById("secBottomBook").innerHTML = document.getElementById("secBottomBook" + iSno).innerHTML;
    //document.getElementById("chart_div").innerHTML = document.getElementById("chart_div" + iSno).innerHTML;
    drawMontagePlot(iSno - 1);
}
function clearMontageData(boolEndow) {
    for (var isno = 1; isno <= nMontageStocks; isno++) {
        document.getElementById("mBid" + isno).innerHTML = "&nbsp";
        document.getElementById("mAsk" + isno).innerHTML = "&nbsp";
        document.getElementById("mPayoff" + isno).innerHTML = "&nbsp";
        if (boolEndow) { document.getElementById("mPosition" + isno).innerHTML = "&nbsp"; };
        document.getElementById("mlblInfo").innerHTML = "&nbsp";
    }
}

function mHitBid(i) {
    //var cHeaderBuy = "buy"
    //var cHeaderSell = "sell"

    if (document.getElementById("imHitBid" + i).disabled) {
        $('#statusLabel').html("You cannot hit this bid");
        return;
    }
    $('#statusLabel').html("");
    var currentStr = document.getElementById("bestBid" + i).innerHTML;
    if (currentStr.indexOf("*") > -1) {
        alert("You cannot hit your own bid.  The '*' at the end of the price indicates that this is your bid"); return;
    }
    if (isNaN(parseFloat(currentStr))) {
        alert("There is no existing bid");
        return;
    } else {

        currentStr = currentStr.replace(/,/g, '');  // added on 7/8/2021 for thousands separator in prices
        var sP = parseFloat(currentStr);
        var currentQ = $('#mQty').val();
        if (currentQ === "") currentQ = document.getElementById("bestBidQty" + i).innerHTML;
        var cQ = parseInt(currentQ);
        if (isNaN(cQ)) return;
        if (cQ == 0) return;
        var msg = window.JSON.stringify({ header: cHeaderSell, isno: i, price: sP, qty: cQ });
        ws.send(msg);
    }
}

function mHitAsk(i) {
    //var cHeaderBuy = "buy"
    //var cHeaderSell = "sell"
    if (document.getElementById("imHitAsk" + i).disabled) {
        $('#statusLabel').html("You cannot hit this ask");
        return;
    }
    $('#statusLabel').html("");
    var currentStr = document.getElementById("bestAsk" + i).innerHTML;
    if (currentStr.indexOf("*") > -1) {
        alert("You cannot hit your own ask.  The '*' at the end of the price indicates that this is your ask"); return;
    }
    if (isNaN(parseFloat(currentStr))) {
        alert("There is no existing ask");
        return;
    } else {
        currentStr = currentStr.replace(/,/g, '');  // added on 7/8/2021 for thousands separator in prices
        var sP = parseFloat(currentStr);
        var currentQ = $('#mQty').val();
        if (currentQ === "") currentQ = document.getElementById("bestAskQty" + i).innerHTML;
        var cQ = parseInt(currentQ);
        if (isNaN(cQ)) return;
        if (cQ == 0) return;
        var msg = window.JSON.stringify({ header: cHeaderBuy, isno: i, price: sP, qty: cQ });
        ws.send(msg);
    }
}

// to test these, also fix the chart, also check the information by running RE1
// then test on a cell phone

function mRaiseBid(i) {

    if (document.getElementById("imBidUp" + i).disabled) {
        $('#statusLabel').html("You cannot raise this bid");
        return;
    }
    $('#statusLabel').html("");
    var currentStr = document.getElementById("bestBid" + i).innerHTML;
    if (isNaN(parseFloat(currentStr))) {
        alert("There is no existing bid");
        return;
    } else {
        currentStr = currentStr.replace(/,/g, '');  // added on 7/8/2021 for thousands separator in prices
        var sP = parseFloat(currentStr);
        sP = sP + .01;
        var sQ = $('#mQty').val();
        var newQ = parseInt(sQ);
        if (isNaN(newQ)) newQ = 100;
        var msg = window.JSON.stringify({ header: cHeaderBid, isno: i, price: sP, qty: newQ });
        ws.send(msg);
    }
}

function mLowerAsk(i) {

    if (document.getElementById("imAskDown" + i).disabled) {
        $('#statusLabel').html("You cannot lower this ask");
        return;
    }
    $('#statusLabel').html("");
    var currentStr = document.getElementById("bestAsk" + i).innerHTML;
    if (isNaN(parseFloat(currentStr))) {
        alert("There is no existing ask");
        return;
    } else {
        currentStr = currentStr.replace(/,/g, '');  // added on 7/8/2021 for thousands separator in prices
        var sP = parseFloat(currentStr);
        sP = sP - .01;
        if (sP <= 0) { alert("Unable to lower ask, it is too small"); return; }
        var sQ = $('#mQty').val();
        var newQ = parseInt(sQ);
        if (isNaN(newQ)) newQ = 100;
        var msg = window.JSON.stringify({ header: cHeaderAsk, isno: i, price: sP, qty: newQ });
        ws.send(msg);
    }
}
function mSubmitBid() {
    if (iSnoClicked <= 0) return;
    var i = iSnoClicked;
    var sP = $('#mPrice').val();
    var price = parseFloat(sP);
    if (isNaN(price)) {
        alert("Please enter a number for the price");
        return;
    }
    var sQ = $('#mQty').val();
    var qty = parseInt(sQ);
    if (isNaN(qty)) {
        alert("Please enter a number for the quantity");
        return;
    }
    var msg = window.JSON.stringify({ header: cHeaderBid, isno: i, price: sP, qty: sQ });
    ws.send(msg);
}
function mSubmitAsk() {
    if (iSnoClicked <= 0) return;
    var i = iSnoClicked;
    var sP = $('#mPrice').val();
    var price = parseFloat(sP);
    if (isNaN(price)) {
        alert("Please enter a number for the price");
        return;
    }
    var sQ = $('#mQty').val();
    var qty = parseInt(sQ);
    if (isNaN(qty)) {
        alert("Please enter a number for the quantity");
        return;
    }
    var msg = window.JSON.stringify({ header: cHeaderAsk, isno: i, price: sP, qty: sQ });
    ws.send(msg);
}
function mClearBids() {
    if (iSnoClicked <= 0) return;
    var i = iSnoClicked;
    var msg = window.JSON.stringify({ header: cHeaderClearBids, isno: i });
    ws.send(msg);
}
function mClearAsks() {
    if (iSnoClicked <= 0) return;
    var i = iSnoClicked;
    var msg = window.JSON.stringify({ header: cHeaderClearAsks, isno: i });
    ws.send(msg);
}