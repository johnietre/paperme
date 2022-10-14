//values sent in the messaging
var cModMsg = "modmsg";
var cModLogin = "modlogin";
var cLogin = "login";
var cCase = "casename";
var cHeaderError = "error";
var cHeaderPopupError = "popuperror";
var cHeaderLoginError = "loginerror";
var cHeaderLoggedIn = "loggedin";
var cHeaderTime = "time";
var cHeaderStartPeriod = "startperiod";
var cHeaderEndPeriod = "endperiod";
var cHeaderPauseMarket = "pausemarket";
var cHeaderResumeMarket = "resumemarket";
var cHeaderQuitMarket = "quitmarket";
var cHeaderNStock = "nstock";
var cHeaderStockName = "secname";
var cHeaderInitTrial = "initializetrial";
var cHeaderBid = "bid";
var cHeaderAsk = "ask";
var cHeaderBuy = "buy"
var cHeaderSell = "sell"
var cHeaderBestBid = "bestbid";
var cHeaderBestAsk = "bestask";
var cHeaderBidBook = "bidbook";
var cHeaderAskBook = "askbook"
var cHeaderChartData = "bidasklast";
var cHeaderClearBids = "clearbids";
var cHeaderClearAsks = "clearasks";
var cHeaderLastTrade = "lasttrade";
var cHeaderCash = "cash";
var cHeaderEndow = "endow";
var cHeaderMktMak = "mktmak";
var cHeaderDiv = "div";
var cHeaderIntRate = "intrate";
var cHeaderCaseList = "caselist";
var cCaseSelected = "caseselect";
var cHeaderInformation = "info";
var cHeaderPerformance = "performance";
var cHeaderDummyMessage = "dummymessage";
var cHeaderMessage = "showmessage";

var cHeaderOptionalMessage = "optmsg";
var cHeaderOptMsgAccepted = "optmsgaccepted";
var cHeaderOptMsgRejected = "optmsgrejected";
var cHeaderOptionalMessageNumAccepted = "optmsgnumaccepted";

var messageDelimiter = "#";
var quoteDelimiter = "%";
var caseName = "";

var nControls = 0;
var lastChartTime = Date.now(); //milliseconds
var iTime = 0;
var nTime = 0;

function validateEmail(inputText) {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailformat)) {
        return true;
    }
    else {
        alert("Invalid email address");
        return false;
    }
}

function handleTrdMessage(msg) {
    //$('#statusLabel').html(msg.header + " " + msg.msg);
    switch (msg.header) {
        case cHeaderLoginError:
            $('#statusLabel').html(msg.msg);
            document.getElementById('cmdTrdConnect').disabled = false;
            $("#myTabs").tabs("option", "active", 0);
            //$('#tab-1').show();
            //$('#tab-3').hide();
            alert(msg.msg);
            break;
        case cLogin:
            $('#statusLabel').html("Connected");
            document.getElementById("traderName").innerHTML = ' Case ' + msg.caseName + ' Trader ' + msg.isno;
            document.title = myName;
            caseName = msg.caseName;
            if (nStocks > 0) enableSupportButton(caseName); // in case the login message comes later, so case name not yet set
            //$('#tab-1').hide();
            //$('#tab-3').show();
            $("#myTabs").tabs("option", "active", 2);
            break;
        case cHeaderTime:
            document.getElementById("lblTime").innerHTML = "Time: " + msg.msg;
            iTime = parseInt(msg.msg);
            var tLeft = parseInt(msg.msg);
            if (isNaN(tLeft) == false) {
                if (tLeft > 0) {
                    $('#lblTime').css('color', 'lime');
                    if (nTime > 0) recalcSupport(nTime, iTime);
                } else {
                    $('#lblTime').css('color', 'red');
                };
            }
            break;
        case cHeaderMessage:
            $('#statusLabel').html(msg.msg);
            break;
        case cHeaderInitTrial:
            document.getElementById("lblTrial").innerHTML = "Trial: " + msg.msg;
            clearData(true);
            break;
        case cHeaderNStock:
            createTraderAccordion(msg);
            break;
        case cHeaderStockName:
            var isno = parseInt(msg.isno);
            var headerID = "secName" + isno;
            document.getElementById(headerID).innerHTML = msg.msg;
            break;
        case cHeaderIntRate:
            document.getElementById("lblIntRate").innerHTML = "Interest Rate: " + msg.msg;
            break;
        case cHeaderBestBid:
            var isno = msg.isno;
            if (msg.msg == "") {
                document.getElementById("bestBid" + isno).innerHTML = "&nbsp;";
                document.getElementById("bestBidQty" + isno).innerHTML = "&nbsp;";
                // clear the book
                //$("#bidBook" + isno + "> thead").html("");
                $("#bidBook" + isno + "> tbody").html("");
            } else {
                document.getElementById("bestBid" + isno).innerHTML = msg.price;
                document.getElementById("bestBidQty" + isno).innerHTML = msg.qty;
                if (msg.displayName == myName) document.getElementById("bestBid" + isno).innerHTML = msg.price + "*";
                //$("#bidBook" + isno + "> thead").html(msg.msg1);
                $("#bidBook" + isno + "> tbody").html(msg.msg2);
                //setBidHTML(isno, msg.msg2);
            }
            break;
        case cHeaderBestAsk:
            var isno = msg.isno;
            if (msg.msg == "") {
                document.getElementById("bestAsk" + isno).innerHTML = "&nbsp;";
                document.getElementById("bestAskQty" + isno).innerHTML = "&nbsp;";
                //clear the book
                //$("#askBook" + isno + "> thead").html("");
                $("#askBook" + isno + "> tbody").html("");

            } else {
                document.getElementById("bestAsk" + isno).innerHTML = msg.price;
                document.getElementById("bestAskQty" + isno).innerHTML = msg.qty;
                if (msg.displayName == myName) document.getElementById("bestAsk" + isno).innerHTML = msg.price + "*";
                //$("#askBook" + isno + "> thead").html(msg.msg1);
                $("#askBook" + isno + "> tbody").html(msg.msg2);
                //setAskHTML(isno, msg.msg2);
            }
            break;
        case cHeaderLastTrade:
            var isno = msg.isno;
            var lastPrice = msg.price;
            var clr = '#FEFEFE';
            if (msg.lastTick == 1) { lastPrice = lastPrice + '&#8593;'; clr = 'lime'; };
            if (msg.lastTick == -1) { lastPrice = lastPrice + '&#8595;'; clr = 'red'; };
            document.getElementById("lastPayoff" + isno).innerHTML = lastPrice;
            $('#lastPayoff' + isno).css('color', clr);
            break;
        case cHeaderChartData:
            //maybe only do this once per second?  This freezes the demo
            //var itime = parseInt(msg.iTime);
            //if (itime == lastChartTime) return;
            plotChart(msg.isno, msg.iTime, msg.msg, msg.msg1, msg.msg2);
            //lastChartTime = itime + 1;
            break;
        case cHeaderCash:
            document.getElementById("lblCash").innerHTML = "Cash: " + msg.msg;
            break;
        case cHeaderEndow:
            var isno = msg.isno;
            document.getElementById("position" + isno).innerHTML = msg.msg;
            if (msg.msg1 != null) {//futures obligation
                document.getElementById("position" + isno).innerHTML = msg.msg + "(" + msg.msg1 + ")";
            }
            updateEndow(msg); //for support
            break;
        case cHeaderMktMak:
            setMktMak(msg);
            break;
        case cHeaderDiv:
            var isno = msg.isno;
            document.getElementById("lblLastPayoff" + isno).innerHTML = "Payoff";
            document.getElementById("lastPayoff" + isno).innerHTML = msg.msg;
            break;
        case cHeaderStartPeriod:
            for (var isno = 1; isno <= nControls; isno++) {
                document.getElementById("lblLastPayoff" + isno).innerHTML = "Last";
                document.getElementById("lastPayoff" + isno).innerHTML = "&nbsp";
                clearBooks();
            }
            initChart(nControls, msg.iTime);
            nTime = parseInt(msg.iTime);
            initSupport(nControls, msg.iTime, caseName); //subsequent calls to support routed through plotChart
            document.getElementById("lblPeriod").innerHTML = "Period: " + msg.msg;
            clearData(false);
            break;
        case cHeaderPauseMarket:
            $('#lblTime').css('color', 'red');
            $('#statusLabel').html("The market is paused");
            break;
        case cHeaderResumeMarket:
            $('#lblTime').css('color', 'lime');
            $('#statusLabel').html("The market is open");
            break;
        case cHeaderInformation:
            var isno = msg.isno;
            document.getElementById("lblInfo" + isno).innerHTML = msg.msg;
            break;
        case cHeaderError:
            $('#statusLabel').html(msg.msg);
            break;
        case cHeaderPopupError:
            $('#statusLabel').html(msg.msg);
            alert(msg.msg);
            break;
        case cHeaderPerformance:
            showPerformance(msg);
            break;
        default:
            //$('#statusLabel').html(msg.header + " " + msg.msg);
    }
    handleMessageMontage(msg);
}

function clearData(boolEndow) {
    for (var isno = 1; isno <= nControls; isno++) {
        document.getElementById("bestBid" + isno).innerHTML = "&nbsp";
        document.getElementById("bestAsk" + isno).innerHTML = "&nbsp";
        document.getElementById("bestBidQty" + isno).innerHTML = "&nbsp";
        document.getElementById("bestAskQty" + isno).innerHTML = "&nbsp";
        document.getElementById("lastPayoff" + isno).innerHTML = "&nbsp";
        if (boolEndow) { document.getElementById("position" + isno).innerHTML = "&nbsp"; };
        document.getElementById("lblInfo" + isno).innerHTML = "&nbsp";
    }
    clearMontageData(boolEndow);
}

function createTraderAccordion(msg) {
    $("#accordTRD").empty();
    var baseDiv = document.getElementById('baseString').innerHTML;
    var nStock = parseInt(msg.msg);
    nControls = nStock;
    var newDiv = "";
    $("#accordTRD").empty();
    for (var i = 1; i <= nStock; i++) {
        newDiv = newDiv + replaceAll("FTS", i, baseDiv);
    }
    $("#accordTRD").append(newDiv);
    var newWidth = Math.ceil(100 / (nStock + 1));
    if (newWidth > 25) newWidth = 25;
    if (newWidth < 10) newWidth = 10;
    for (var i = 1; i <= nStock; i++) {
        $("#tradeButton" + i).height($("#tradeInput" + i).height());
        $('#sec' + i).css('width', newWidth + '%');
    }
    clearData(true);
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].onclick = function () {
            this.classList.toggle("active");
            this.nextElementSibling.classList.toggle("show");
        }
    }
}

function setMktMak(msg) {
    var isno = msg.isno;
    var mktMak = parseInt(msg.msg);
    switch (mktMak) {
        case 0:
            setButtonDisable("btnBid" + isno, false);
            setButtonDisable("btnAsk" + isno, false);
            setButtonDisable("btnClrBid" + isno, false);
            setButtonDisable("btnClrAsk" + isno, false);
            setImageDisable("imBidUp" + isno, false, "imgTradeOff", "imgTrade");
            setImageDisable("imAskDown" + isno, false, "imgTradeOff", "imgTrade");
            setImageDisable("imHitBid" + isno, false, "imgTradeOff", "imgTrade");
            setImageDisable("imHitAsk" + isno, false, "imgTradeOff", "imgTrade");
            break;
        case 1:
            setButtonDisable("btnBid" + isno, false);
            setButtonDisable("btnAsk" + isno, false);
            setButtonDisable("btnClrBid" + isno, false);
            setButtonDisable("btnClrAsk" + isno, false);
            setImageDisable("imBidUp" + isno, false, "imgTradeOff", "imgTrade");
            setImageDisable("imAskDown" + isno, false, "imgTradeOff", "imgTrade");
            setImageDisable("imHitBid" + isno, true, "imgTradeOff", "imgTrade");
            setImageDisable("imHitAsk" + isno, true, "imgTradeOff", "imgTrade");
            break;
        case 2:
            setButtonDisable("btnBid" + isno, true);
            setButtonDisable("btnAsk" + isno, true);
            setButtonDisable("btnClrBid" + isno, true);
            setButtonDisable("btnClrAsk" + isno, true);
            setImageDisable("imBidUp" + isno, true, "imgTradeOff", "imgTrade");
            setImageDisable("imAskDown" + isno, true, "imgTradeOff", "imgTrade");
            setImageDisable("imHitBid" + isno, false, "imgTradeOff", "imgTrade");
            setImageDisable("imHitAsk" + isno, false, "imgTradeOff", "imgTrade");
            break;
        case 3:
            setButtonDisable("btnBid" + isno, true);
            setButtonDisable("btnAsk" + isno, true);
            setButtonDisable("btnClrBid" + isno, true);
            setButtonDisable("btnClrAsk" + isno, true);
            setImageDisable("imBidUp" + isno, true, "imgTradeOff", "imgTrade");
            setImageDisable("imAskDown" + isno, true, "imgTradeOff", "imgTrade");
            setImageDisable("imHitBid" + isno, true, "imgTradeOff", "imgTrade");
            setImageDisable("imHitAsk" + isno, true, "imgTradeOff", "imgTrade");
            break;
        default:
            setButtonDisable("btnBid" + isno, false);
            setButtonDisable("btnAsk" + isno, false);
            setButtonDisable("btnClrBid" + isno, false);
            setButtonDisable("btnClrAsk" + isno, false);
            setImageDisable("imBidUp" + isno, false, "imgTradeOff", "imgTrade");
            setImageDisable("imAskDown" + isno, false, "imgTradeOff", "imgTrade");
            setImageDisable("imHitBid" + isno, false, "imgTradeOff", "imgTrade");
            setImageDisable("imHitAsk" + isno, false, "imgTradeOff", "imgTrade");
            break;
    }

}
function setButtonDisable(id, state) {
    $('#' + id).prop('disabled', state);
    //if (state) { $('#' + id).css('background-color', 'gray') } else { $('#' + id).css('background-color', '#2e466e') };
    if (state) { document.getElementById(id).className = "grayTradeButton"; } else { document.getElementById(id).className = "myTradeButton"; };
}
//
function setImageDisable(id, state, classOff, classOn) {
    $('#' + id).prop('disabled', state);
    if (state) { document.getElementById(id).className = classOff; } else { document.getElementById(id).className = classOn; };
}

function showPerformance(msg) {
    var lines = msg.msg.split(messageDelimiter);
    var n = lines.length;
    var tbody = $("#tblPerformance > tbody").html("");
    var sPerformance = "";
    for (i = 0; i < n; i++) {
        var data = lines[i].split(quoteDelimiter);
        var m = data.length;
        sPerformance = sPerformance + "<tr>";
        for (var j = 0; j < m; j++) {
            sPerformance = sPerformance + "<td>" + data[j] + "</td>";
        }
        sPerformance = sPerformance + "</tr>"
    }
    $(sPerformance).appendTo(tbody);
    document.getElementById("btnPerformance").style.visibility = "visible";
    $("#dlgPerformance").dialog({ title: 'Performance Summary Trial ' + msg.isno });
    //document.getElementById("divperformance").innerHTML = sPerformance;
    //document.getElementById("modal-label").innerHTML = 'Performance Summary Trial ' + msg.isno;
    //$('#openmodal').show();
}