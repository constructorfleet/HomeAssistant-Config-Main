if (window.location.href.indexOf('display-panel') > 0) {
    window.pollServer = function () {
        var request = new XMLHttpRequest();  
        request.open('GET', self.location, true);
        request.onreadystatechange = function(){
            if (request.readyState === XMLHttpRequest.DONE){
                if (request.status === 200 
                    || request.status === 401 
                    || request.status === 403) {  
                    window.location.reload();
                    return;
                }
                // Poll 2 minutes
                setTimeout(window.pollServer, 120000);
            }
        };
        request.send();
    }
    window.tryConnection = function () {
        try {
            if (!(self || {}).hassConnection) {
                // Retry connection every 30s
                setTimeout(window.tryConnection, 30000);
                return;
            }

            self.hassConnection.then(
                function (hass) {
                    if (!(hass || {}).conn) { return; }
                    hass.conn.subscribeEvents(
                        function (event) {
                            if  ((event || {}).event_type !== 'lovelace_updated') { return; }
                            self.location.reload();
                        },
                        "lovelace_updated"
                    );
                    hass.conn.socket.addEventListener(
                        "close",
                        function(event) {
                            window.pollServer();
                        }
                    );
                }
            );
        }
        catch (e) {
            console.log(e);
            window.pollServer();
        }
    };
    setTimeout(window.tryConnection, 200);
}
