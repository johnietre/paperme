$(document).ready(function () {
    //var url = 'ws://www.ftsMarket1.com/ws.ashx';
    var url = 'ws://95.217.196.212/ftswebmarket/ws.ashx';
    
    var host = window.location.hostname;
    if (host.indexOf("localhost") > -1) {
        url = 'ws://localhost:5707/ws.ashx'; // this must be running for debug; doesn;t matter on main server, starts it
        // alert(url);
    }

    function connect(demo) {
        clearData();
        var name;
        var pwd;
        nControls = 0;

        if (demo == false) {
            name = $('#txtTrdName').val();
            if (name === "") { alert("Please enter an email address"); return; };
            if (validateEmail(name) == false) return;
            pwd = $('#txtMyModName').val();
            if (pwd == undefined) { alert("Please enter the moderator email"); return; };
            if (pwd == null) { alert("Please enter the moderator email"); return; };
            if (pwd == "") { alert("Please enter the moderator email"); return; };
            if (validateEmail(pwd) == false) return;
        } else {
            var max = 100;
            var min = 1;
            var i = Math.floor(Math.random() * (max - min + 1) + min);
            name = "Trader " + i;
            pwd = "ftsDemo@ftsweb.com";
        }

        logintype = cLogin;

        myName = name;
        $('#statusLabel').html('Please wait until you are connected....');
        //document.getElementById('cmdTrdConnect').disabled = true;
        ws = new WebSocket(url);
        ws.onopen = function () {
            $('#statusLabel').html('Connecting, please wait...');
            var msg = window.JSON.stringify({ header: logintype, traderName: name, modPwd: pwd });
            ws.send(msg);
        };

        ws.onmessage = function (e) {
            var msg = JSON.parse(e.data);
            var n = msg.length;
            if (n == undefined) {
                //happens with some
                try {
                    handleModMessage(msg);
                    return;
                }
                catch (err) {
                    return;
                }
            }
            if (n == 0) return;
            //$('#statusLabel').html(' messages ' + n);
            for (var i = 0; i < n; i++) handleTrdMessage(msg[i]);
            if (isPlotting == false & n <= 10) {
                if (Date.now() - lastChartTime >= 1000) {
                    plotAllCharts();
                    lastChartTime = Date.now();
                }
            }
        };
        ws.onclose = function () {
            $('#statusLabel').html('Connection Closed: Please make sure the moderator is running the market');
            $('#statusLabel').css('color', 'yellow')
            document.getElementById('cmdTrdConnect').disabled = false;
            $('#tab-1').show();
            //$('#tab-3').hide();
        };
        ws.onerror = function (e) {
            $('#statusLabel').html('Oops something went wrong <br/> ');
            document.getElementById('cmdTrdConnect').disabled = false;
            alert("Connection lost.  Please reconnect, or refresh the page and login with the same credentials to resume where you left off.")
            $('#tab-1').show();
            //$('#tab-3').hide();
        };
        if (demo == false) saveLoginData(name, pwd);
    }

    $('#cmdTrdConnect').click(function () {
        connect(false);
    });
    $('#cmdTrdConnectDemo').click(function () {
        connect(true);
    });
});

function disconnect() {
    ws.close();
    document.getElementById('cmdTrdConnect').disabled = false;
    $('#statusLabel').html('Not connected....');
};


