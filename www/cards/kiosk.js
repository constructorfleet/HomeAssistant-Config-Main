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
    '}'];
    style.innerHTML = styles.join('\n');
    document.getElementsByTagName('head')[0].appendChild(style);
    window.dispatchEvent(new Event('resize'));
    setTimeout(function () {
        try {
            // const root = document.querySelector('home-assistant').shadowRoot;
            // const main = root.querySelector('home-assistant-main').shadowRoot;
            // const drawer_layout = main.querySelector('app-drawer-layout').shadowRoot;
            // const sidebar_slot = drawer_layout.querySelector('slot#drawerSlot').shadowRoot;
            // const drawer_content_container = drawer_layout.querySelector('div#contentContainer');
            // const drawer = main.querySelector('app-drawer-layout').querySelector('app-drawer');
            // const drawer_sidebar = drawer.querySelector('ha-sidebar').shadowRoot;
            // const app_toolbar = drawer_sidebar.querySelector('app-toolbar');
            // const app_drawer_layout = main.querySelector('app-drawer-layout');
            // const pages = app_drawer_layout.querySelector('partial-panel-resolver');
            // const lovelace = pages.querySelector('ha-panel-lovelace').shadowRoot;
            // const huiroot = lovelace.querySelector('hui-root').shadowRoot;
            // const app_layout = huiroot.querySelector('ha-app-layout');
            // const header = app_layout.querySelector('app-header');
            // const toolbar = header.querySelector('app-toolbar');
            // const button = toolbar.querySelector('paper-icon-button');
            // const view_content_container = app_layout.shadowRoot.querySelector('div#wrapper').querySelector('div#contentContainer');


            const drawer_sidebar = window.querySelectorDeep('ha-sidebar').shadowRoot;
            const drawer = window.querySelectorDeep('app-drawer-layout > app-drawer')
            const drawer_content_container = window.querySelectorDeep('app-drawer-layout > div#contentContainer');
            const view_content_container = window.querySelectorDeep('div#contentContainer');
            const toolbar = window.querySelectorDeep('app-header > app-toolbar');
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
