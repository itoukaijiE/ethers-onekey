import { ethers } from "ethers";
import { default as TrezorConnect, UI, UI_EVENT } from "@onekeyhq/connect";
// import  TrezorConnect  from "@onekeyhq/connect";

const defaultPath = "m/44'/60'/0'/0/1";

export class OnekeySigner extends ethers.Signer {
    readonly path: string

    static async create(provider?: ethers.providers.Provider, path?: string): Promise<OnekeySigner> {
        await TrezorConnect.init({
            connectSrc: 'https://localhost:8088/',
            lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
            manifest: {
                email: 'itoukaiji@tutanota.com',
                appUrl: 'https://github.com/itoukaiji@/ethers-onekey',
            },
            webusb: false
        });

    // without this listener, the passphrase, if enabled, would be infinitely awaited
    // to be inserted in the browser, see https://github.com/trezor/connect/issues/714
        TrezorConnect.on(UI_EVENT, (event) => {
            if (event.type === UI.REQUEST_PIN) {
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

        let signer = new OnekeySigner(provider, path);
        return signer;
    }

    constructor(provider?: ethers.providers.Provider, path?: string) {
        super();
        if (path == null) { path = defaultPath; }

        ethers.utils.defineReadOnly(this, "path", path);
        ethers.utils.defineReadOnly(this, "provider", provider || null);



    }

    connect(provider: ethers.providers.Provider): ethers.Signer {
        return new OnekeySigner(provider, this.path);
    }

    async getAddress(): Promise<string> {
        let result = await TrezorConnect.ethereumGetAddress({ path: this.path });
        if(result.success) {
            return result.payload.address;
        } else {
            throw Error(result.payload['error']);
        }

    }

    async signMessage(message: ethers.utils.Bytes | string): Promise<string> { 
        return "";
    }

    async signTransaction(transaction: ethers.providers.TransactionRequest): Promise<string> {
        return "";
    }
}