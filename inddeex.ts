// import TrezorConnect from '@onekeyhq/connect';
import { default as TrezorConnect, UI, UI_EVENT } from "@onekeyhq/connect";

(async () => {
    await TrezorConnect.init({
            connectSrc: 'https://localhost:8088/',
            lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
            manifest: {
                email: 'developer@xyz.com',
                appUrl: 'http://your.application.com',
            },
            webusb: false
        });

        // without this listener, the passphrase, if enabled, would be infinitely awaited
    // to be inserted in the browser, see https://github.com/trezor/connect/issues/714
        TrezorConnect.on(UI_EVENT, (event) => {
            console.log(event);
            // if (event.type === UI.REQUEST_PASSPHRASE) {
            if (event.type === UI.REQUEST_PIN) {
            // console.log(event.payload.device.features);
                if (event.payload.device.features.capabilities.includes('Capability_PassphraseEntry')) {
                    TrezorConnect.uiResponse({
                        type: UI.RECEIVE_PASSPHRASE,
                        payload: {
                            passphraseOnDevice: true,
                            save: true,
                            value: '',
                        },
                    })
                } else {
                    throw Error('Trezor passphrase not insertable on the device');
                }
            }
        })

    let res = await TrezorConnect.ethereumGetAddress({
        path: "m/44'/60'/0'/0/0"
    });
    console.log(res);

})();