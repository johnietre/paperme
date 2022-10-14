var nTotalTime = 0;
var nTimeLeft = 0;
var nStocks = 0;
var cname = "";

var endow = [];
var bids = [];
var asks = [];

function initSupport(n, nt, caseName) {
    nTotalTime = parseInt(nt);
    nStocks = parseInt(n);

    endow.length = 0;
    bids.length = 0;
    asks.length = 0;

    for (var isno = 1; isno <= nStocks; isno++) {
        endow.push(0);
        bids.push(0);
        asks.push(0);
    }
    enableSupportButton(caseName);
}

function updateEndow(msg) {
    var isno = parseInt(msg.isno);
    var qty = parseFloat(msg.msg);
    isno = isno - 1; //stocks come in as 1 to n
    endow[isno] = qty;
    //all updateSupport calls are at time message
}

function updateSupportPrices(isno, it, b, a, l) {
    nTimeLeft = nTotalTime - it;
    bids[isno] = b;
    asks[isno] = a;
    // could save last here is needed for some support
    //if (nTimeLeft > 0) {
    //    var t = nTimeLeft / nTotalTime;
    //    if (t) { //checks for undefined and NaN
    //        updateSupport(t);
    //    }
    //}
}

function enableSupportButton(caseName) {
    var cname = caseName.toLowerCase();
    if (cname === "xr1" | cname.startsWith("xr2")) {
        document.getElementById("btnSupport").style.visibility = "visible";
    }
    if (cname === "st1" | cname == "st2") {
        document.getElementById("btnSupport").style.visibility = "visible";
    }
}

function recalcSupport(nTime, iTime) {
    nTotalTime = nTime;
    nTimeLeft = iTime; //nTotalTime - iTime;
    if (nTimeLeft > 0) {
        var t = nTimeLeft / nTotalTime;
        if (t) { //checks for undefined and NaN
            updateSupport(t);
        }
    }
}

function updateSupport(t) {
    var cname = caseName.toLowerCase();
    //$('#statusLabel').html("Support " + nTotalTime + ", " + nTimeLeft + " " + endow.toString());
    if (cname == "xr1" | cname.startsWith("xr2")) {
        try {
            xr1(t);
        } catch (e) {

        }
    }
    if (cname == "st1" | cname == "st2") {
        try {
            st1(t);
        } catch (e) {

        }
    }
}

function xr1(t) {
    // i=2: Call/290, 3:Put 290; 4:Call 310, 5:Put 310, 6:future
    //sigma=0.25, r=0.03.  Fut delta=exp(.03*tLeft)
    var tbody = $("#tblSupport > tbody").html("");

    var xDelta = 0;
    var xGamma = 0;
    var xVega = 0;
    var pDelta = 0;
    var pGamma = 0;
    var pVega = 0;
    var secName = "";  //secNames ID's are 1 to nStocks
    var htmlString = "";
    // have to do individually since all characteristrics are different

    var sigma = 0.14;
    var r = .07;
    var rf = .04;
    var ss = bids[0];

    var i = 2;
    var xk = 290;
    var id = 1;
    secName = document.getElementById("secName" + (i + 1)).innerHTML;
    htmlString = htmlString + "<tr><td>" + secName + "</td>";
    xDelta = delta(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xDelta.toFixed(4) + "</td>";
    pDelta = pDelta + endow[i] * xDelta;
    xGamma = gamma(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xGamma.toFixed(4) + "</td>";
    pGamma = pGamma + endow[i] * xGamma;
    xVega = vega(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xVega.toFixed(4) + "</td>";
    pVega = pVega + endow[i] * xVega;
    htmlString = htmlString + "</tr>";

    i = 3;
    xk = 290;
    id = 2;
    secName = document.getElementById("secName" + (i + 1)).innerHTML;
    htmlString = htmlString + "<tr><td>" + secName + "</td>";
    xDelta = delta(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xDelta.toFixed(4) + "</td>";
    pDelta = pDelta + endow[i] * xDelta;
    xGamma = gamma(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xGamma.toFixed(4) + "</td>";
    pGamma = pGamma + endow[i] * xGamma;
    xVega = vega(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xVega.toFixed(4) + "</td>";
    pVega = pVega + endow[i] * xVega;
    htmlString = htmlString + "</tr>";

    i = 4;
    xk = 310;
    id = 1;
    secName = document.getElementById("secName" + (i + 1)).innerHTML;
    htmlString = htmlString + "<tr><td>" + secName + "</td>";
    xDelta = delta(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xDelta.toFixed(4) + "</td>";
    pDelta = pDelta + endow[i] * xDelta;
    xGamma = gamma(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xGamma.toFixed(4) + "</td>";
    pGamma = pGamma + endow[i] * xGamma;
    xVega = vega(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xVega.toFixed(4) + "</td>";
    pVega = pVega + endow[i] * xVega;
    htmlString = htmlString + "</tr>";

    i = 5;
    xk = 310;
    id = 2;
    secName = document.getElementById("secName" + (i + 1)).innerHTML;
    htmlString = htmlString + "<tr><td>" + secName + "</td>";
    xDelta = delta(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xDelta.toFixed(4) + "</td>";
    pDelta = pDelta + endow[i] * xDelta;
    xGamma = gamma(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xGamma.toFixed(4) + "</td>";
    pGamma = pGamma + endow[i] * xGamma;
    xVega = vega(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xVega.toFixed(4) + "</td>";
    pVega = pVega + endow[i] * xVega;
    htmlString = htmlString + "</tr>";

    //now the futures
    i = 6;
    secName = document.getElementById("secName" + (i + 1)).innerHTML;
    htmlString = htmlString + "<tr><td>" + secName + "</td>";
    xDelta = Math.exp(.03 * t);
    htmlString = htmlString + "<td>" + xDelta.toFixed(4) + "</td>";
    pDelta = pDelta + endow[i] * xDelta;
    xGamma = 0;
    htmlString = htmlString + "<td>" + xGamma.toFixed(4) + "</td>";
    //pGamma = pGamma + endow[i] * xGamma;
    xVega = 0;
    htmlString = htmlString + "<td>" + xVega.toFixed(4) + "</td>";
    //pVega = pVega + endow[i] * xVega;
    htmlString = htmlString + "</tr>";

    htmlString = htmlString + "<tr><td>Portfolio</td>";
    htmlString = htmlString + "<td>" + pDelta.toFixed(4) + "</td>";
    htmlString = htmlString + "<td>" + pGamma.toFixed(4) + "</td>";
    htmlString = htmlString + "<td>" + pVega.toFixed(4) + "</td>";
    htmlString = htmlString + "</tr>";

    $(htmlString).appendTo(tbody);

}
function st1(t) {
    // i=2: Call/320, 3:Put 320; 4:Call 360, 5:Put 360
    //sigma=0.3, r=0.0325
    var tbody = $("#tblSupport > tbody").html("");

    var xDelta = 0;
    var xGamma = 0;
    var xVega = 0;
    var pDelta = 0;
    var pGamma = 0;
    var pVega = 0;
    var secName = "";  //secNames ID's are 1 to nStocks
    var htmlString = "";
    // have to do individually since all characteristrics are different

    var sigma = 0.3;
    var r = .0325;
    var rf = 0;;
    var ss = bids[0];

    var i = 2;
    var xk = 320;
    var id = 1;
    secName = document.getElementById("secName" + (i + 1)).innerHTML;
    htmlString = htmlString + "<tr><td>" + secName + "</td>";
    xDelta = delta(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xDelta.toFixed(4) + "</td>";
    pDelta = pDelta + endow[i] * xDelta;
    xGamma = gamma(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xGamma.toFixed(4) + "</td>";
    pGamma = pGamma + endow[i] * xGamma;
    xVega = vega(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xVega.toFixed(4) + "</td>";
    pVega = pVega + endow[i] * xVega;
    htmlString = htmlString + "</tr>";

    i = 3;
    xk = 320;
    id = 2;
    secName = document.getElementById("secName" + (i + 1)).innerHTML;
    htmlString = htmlString + "<tr><td>" + secName + "</td>";
    xDelta = delta(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xDelta.toFixed(4) + "</td>";
    pDelta = pDelta + endow[i] * xDelta;
    xGamma = gamma(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xGamma.toFixed(4) + "</td>";
    pGamma = pGamma + endow[i] * xGamma;
    xVega = vega(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xVega.toFixed(4) + "</td>";
    pVega = pVega + endow[i] * xVega;
    htmlString = htmlString + "</tr>";

    i = 4;
    xk = 360;
    id = 1;
    secName = document.getElementById("secName" + (i + 1)).innerHTML;
    htmlString = htmlString + "<tr><td>" + secName + "</td>";
    xDelta = delta(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xDelta.toFixed(4) + "</td>";
    pDelta = pDelta + endow[i] * xDelta;
    xGamma = gamma(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xGamma.toFixed(4) + "</td>";
    pGamma = pGamma + endow[i] * xGamma;
    xVega = vega(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xVega.toFixed(4) + "</td>";
    pVega = pVega + endow[i] * xVega;
    htmlString = htmlString + "</tr>";

    i = 5;
    xk = 360;
    id = 2;
    secName = document.getElementById("secName" + (i + 1)).innerHTML;
    htmlString = htmlString + "<tr><td>" + secName + "</td>";
    xDelta = delta(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xDelta.toFixed(4) + "</td>";
    pDelta = pDelta + endow[i] * xDelta;
    xGamma = gamma(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xGamma.toFixed(4) + "</td>";
    pGamma = pGamma + endow[i] * xGamma;
    xVega = vega(id, r, t, xk, ss, sigma, rf);
    htmlString = htmlString + "<td>" + xVega.toFixed(4) + "</td>";
    pVega = pVega + endow[i] * xVega;
    htmlString = htmlString + "</tr>";

    htmlString = htmlString + "<tr><td>Portfolio</td>";
    htmlString = htmlString + "<td>" + pDelta.toFixed(4) + "</td>";
    htmlString = htmlString + "<td>" + pGamma.toFixed(4) + "</td>";
    htmlString = htmlString + "<td>" + pVega.toFixed(4) + "</td>";
    htmlString = htmlString + "</tr>";

    $(htmlString).appendTo(tbody);

}

function dialogPerformance() {
    $("#dlgPerformance").dialog("open");
}

function dialogSupport() {
    $("#dlgSupport").dialog("open");
}

function dialogAcceptMessage(truefalse) {
    if (truefalse === true) {
        document.getElementById("msg2Label").style.visibility = "visible";
        var msg1 = window.JSON.stringify({ header: cHeaderOptMsgAccepted });
        ws.send(msg1)
        document.getElementById("btnMsgNo").disabled = true; 
        document.getElementById("btnMsgYes").disabled = true; 
    } else {
        document.getElementById("msg2Label").style.visibility = "hidden";
        var msg2 = window.JSON.stringify({ header: cHeaderOptMsgRejected });
        ws.send(msg2);
        $("#dlgMessaging").dialog("close");
    }
}