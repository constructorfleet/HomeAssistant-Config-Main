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
            const root = document.querySelector('home-assistant').shadowRoot;
            const main = root.querySelector('home-assistant-main').shadowRoot;
            const drawer_layout = main.querySelector('app-drawer-layout').shadowRoot;
            const sidebar_slot = drawer_layout.querySelector('slot#drawerSlot').shadowRoot;
            const content_container = drawer_layout.querySelector('div#contentContainer');
            const drawer = drawer_layout.querySelector('app-drawer');
            const drawer_sidebar = drawer.querySelector('ha-sidebar').shadowRoot;
            const app_toolbar = drawer_sidebar.querySelector('app-toolbar');
            const pages = drawer_layout.querySelector('partial-panel-resolver');
            const lovelace = pages.querySelector('ha-panel-lovelace').shadowRoot;
            const huiroot = lovelace.querySelector('hui-root').shadowRoot;
            const header = huiroot.querySelector('app-header');
            const toolbar = huiroot.querySelector('app-toolbar');
            const button = toolbar.querySelector('paper-icon-button')
            drawer.style.display = 'none';
            content_container.style.marginLeft = '0px';
            // if (button) {
            //     try {
            //         button.click();
            //     } catch (e) {}
            // }
            if (window.location.href.indexOf('show_tabs') > 0) {
                toolbar.style.display = 'none';
            } else {
                header.style.display = 'none';
            }
            const mainView = huiroot.querySelector('div#view');
            mainView.style.overflowY = 'hidden'
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
