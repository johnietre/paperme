$(function () {

    var ws;
    var myName;
    var logintype;
    var packetNumber = 0;

    //$('#tab-3').hide();
    //$('#openmodal').hide();
    readLoginData();
    $("#myTabs").tabs();
    $("#dlgPerformance").dialog({
        autoOpen: false,
        show: {
            effect: "blind",
            duration: 1000
        },
        hide: {
            effect: "explode",
            duration: 1000
        }
    });
    $("#dlgSupport").dialog({
        autoOpen: false,
        show: {
            effect: "blind",
            duration: 1000
        },
        hide: {
            effect: "explode",
            duration: 1000
        }
    });
    $("#dlgMessaging").dialog({
        autoOpen: false,
        show: {
            effect: "blind",
            duration: 1000
        },
        hide: {
            effect: "explode",
            duration: 1000
        }
    });
});

function readLoginData() {
    if (navigator.cookieEnabled) {
        var myname = readCookie("myname");
        if (myname == null) return;
        $('#txtTrdName').val(myname);
        var modname = readCookie("modname");
        if (modname == null) return;
        $('#txtMyModName').val(modname);
    }
}

function saveLoginData(myname, modname) {
    if (navigator.cookieEnabled) {
        createCookie("myname", myname);
        createCookie("modname", modname);
    }
}
function createCookie(name, value) {
    var today = new Date();
    var expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days
    document.cookie = name + "=" + escape(value) + "; path=/; expires=" + expiry.toGMTString();
}

function readCookie(name) {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}
function icoClick(i, img) {
    var divID = "secBottom" + i;
    var divObject = document.getElementById(divID);

    if (divObject.className == "divVisible") {
        divObject.className = "divHidden";
        document.getElementById(img.id).src = "Images/Plus.png";
    }
    else {
        divObject.className = "divVisible";
        document.getElementById(img.id).src = "Images/Minus.png";
    }
}

function hitBid(i) {
    //var cHeaderBuy = "buy"
    //var cHeaderSell = "sell"
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
        var currentQ = "";
        if (document.getElementById("rdTakeAll" + i).checked == true) {
            currentQ = document.getElementById("bestBidQty" + i).innerHTML;
        } else {
            currentQ = $("#txtQtyMkt" + i).val();
        }
        var cQ = parseInt(currentQ);
        if (isNaN(cQ)) return;
        if (cQ == 0) return;
        var msg = window.JSON.stringify({ header: cHeaderSell, isno: i, price: sP, qty: cQ });
        ws.send(msg);
    }
}

function hitAsk(i) {
    //var cHeaderBuy = "buy"
    //var cHeaderSell = "sell"
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
        var currentQ = "";
        if (document.getElementById("rdTakeAll" + i).checked == true) {
            currentQ = document.getElementById("bestAskQty" + i).innerHTML;
        } else {
            currentQ = $("#txtQtyMkt" + i).val();
        }
        var cQ = parseInt(currentQ);
        if (isNaN(cQ)) return;
        if (cQ == 0) return;
        var msg = window.JSON.stringify({ header: cHeaderBuy, isno: i, price: sP, qty: cQ });
        ws.send(msg);
    }
}

function raiseBid(i) {
    var currentStr = document.getElementById("bestBid" + i).innerHTML;
    if (isNaN(parseFloat(currentStr))) {
        alert("There is no existing bid");
        return;
    } else {
        currentStr = currentStr.replace(/,/g, '');  // added on 7/8/2021 for thousands separator in prices
        var sP = parseFloat(currentStr);
        sP = sP + .01;
        var sQ = $('#txtQty' + i).val();
        var newQ = parseInt(sQ);
        if (isNaN(newQ)) newQ = 100;
        var msg = window.JSON.stringify({ header: cHeaderBid, isno: i, price: sP, qty: newQ });
        ws.send(msg);
    }
}

function lowerAsk(i) {
    var currentStr = document.getElementById("bestAsk" + i).innerHTML;
    if (isNaN(parseFloat(currentStr))) {
        alert("There is no existing ask");
        return;
    } else {
        currentStr = currentStr.replace(/,/g, '');  // added on 7/8/2021 for thousands separator in prices
        var sP = parseFloat(currentStr);
        sP = sP - .01;
        if (sP <= 0) { alert("Unable to lower ask, it is too small"); return; }
        var sQ = $('#txtQty' + i).val();
        var newQ = parseInt(sQ);
        if (isNaN(newQ)) newQ = 100;
        var msg = window.JSON.stringify({ header: cHeaderAsk, isno: i, price: sP, qty: newQ });
        ws.send(msg);
    }
}
function submitBid(i) {
    var sP = $('#txtPrice' + i).val();
    var price = parseFloat(sP);
    if (isNaN(price)) {
        alert("Please enter a number for the price");
        return;
    }
    var sQ = $('#txtQty' + i).val();
    var qty = parseInt(sQ);
    if (isNaN(qty)) {
        alert("Please enter a number for the quantity");
        return;
    }
    var msg = window.JSON.stringify({ header: cHeaderBid, isno: i, price: sP, qty: sQ });
    ws.send(msg);
}
function submitAsk(i) {
    var sP = $('#txtPrice' + i).val();
    var price = parseFloat(sP);
    if (isNaN(price)) {
        alert("Please enter a number for the price");
        return;
    }
    var sQ = $('#txtQty' + i).val();
    var qty = parseInt(sQ);
    if (isNaN(qty)) {
        alert("Please enter a number for the quantity");
        return;
    }
    var msg = window.JSON.stringify({ header: cHeaderAsk, isno: i, price: sP, qty: sQ });
    ws.send(msg);
}
function clearBids(i) {
    var msg = window.JSON.stringify({ header: cHeaderClearBids, isno: i });
    ws.send(msg);
}
function clearAsks(i) {
    var msg = window.JSON.stringify({ header: cHeaderClearAsks, isno: i });
    ws.send(msg);
}