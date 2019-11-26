if (window.location.href.indexOf('kiosk') > 0) {
    var style = document.createElement('style');
    style.type = 'text/css';

    var styles = [
        'div#container {'+
        '   margin: 0!;' +
        '}',
        'app-drawer#drawer {' +
        '   display: none!;'+
        '}',
        'app-header {' +
        '   display: none!;'+
        '}',
        'ha-card > div.flex.info > span#value {' +
        '   font-size: 1.6rem;' +
        '}'
    ];
    style.innerHTML = styles.join('\n');
    document.getElementsByTagName('head')[0].appendChild(style);
    window.dispatchEvent(new Event('resize'));
    setTimeout(function () {
        try {
            const drawer_sidebar = window.querySelectorDeep('ha-sidebar').shadowRoot;
            const drawer = window.querySelectorDeep('app-drawer-layout > app-drawer')
            const drawer_content_container = window.querySelectorDeep('div#contentContainer');
            const view_content_container = window.querySelectorDeep('div#wrapper > div#contentContainer');
            const toolbar = window.querySelectorDeep('app-header > app-toolbar');
            const header = window.querySelectorDeep('ha-app-layout > app-header');
            const mainView = window.querySelectorDeep('div#view');

            drawer_sidebar.style = (drawer_sidebar.style || {});
            drawer.style = (drawer.style || {});
            drawer_content_container.style = (drawer_content_container.style || {});
            view_content_container.style = (view_content_container.style || {});
            toolbar.style = (toolbar.style || {});
            mainView.style = (toolbar.style || {});

            drawer_sidebar.style.display = 'none';
            drawer.style.display = 'none';
            drawer_content_container.style.marginLeft = '0px';
            drawer_content_container.style.paddingTop = '0px';
            view_content_container.style.marginLeft = '0px';
            view_content_container.style.paddingTop = '0px';
            mainView.style.overflowY = 'hidden'

            if (window.location.href.indexOf('show_tabs') > 0) {
                toolbar.style.display = 'none';
            } else {
                header.style.display = 'none';
            }

            if (!(self || {}).hassConnection) {
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
                }
            );
        }
        catch (e) {
            console.log(e);
        }
    }, 200);
}
