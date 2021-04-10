import { ethers } from "ethers";
import { default as OnekeyConnect, UI, UI_EVENT } from "@onekeyhq/connect";

const defaultPath = "m/44'/60'/0'/0/0";

export class OnekeySigner extends ethers.Signer {
    readonly path: string

    static async create(provider?: ethers.providers.Provider, path?: string): Promise<OnekeySigner> {
        await OnekeyConnect.init({
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
        OnekeyConnect.on(UI_EVENT, (event) => {
            if (event.type === UI.REQUEST_PASSPHRASE ) {
                if (event.payload.device.features!.capabilities.includes('Capability_PassphraseEntry')) {
                    OnekeyConnect.uiResponse({
                        type: UI.RECEIVE_PASSPHRASE,
                        payload: {
                            passphraseOnDevice: true,
                            save: true,
                            value: '',
                        },
                    })
                } else {
                    throw Error('Onekey passphrase not insertable on the device');
                }
            } else if (event.type === UI.REQUEST_PIN) {
                throw Error('Onekey pin not insertable on the device');
            }
        })

        let signer = new OnekeySigner(provider, path);
        return signer;
    }

    constructor(provider?: ethers.providers.Provider, path?: string) {
        super();
        if (path == null) { path = defaultPath; }
        ethers.utils.defineReadOnly(this, "path", path);
        ethers.utils.defineReadOnly(this, "provider", provider || undefined);
    }

    connect(provider: ethers.providers.Provider): ethers.Signer {
        return new OnekeySigner(provider, this.path);
    }

    async getAddress(): Promise<string> {
        let result = await OnekeyConnect.ethereumGetAddress({ path: this.path });
        if(result.success) {
            return result.payload.address;
        } else {
            throw Error(result.payload['error']);
        }
    }

    async signMessage(message: ethers.utils.Bytes | string): Promise<string> { 
        let msg = typeof message === 'string'? message: ethers.utils.hexlify(message);
        let isHex = typeof message === 'string' ? false: true;
        let result = await OnekeyConnect.ethereumSignMessage({
            path: this.path,
            message: msg,
            hex: isHex
        });
        if(result.success) {
            return '0x' + result.payload.signature!;
        } else {
            throw Error(result.payload['error']);
        }
    }

    async signTransaction(transaction: ethers.providers.TransactionRequest): Promise<string> {
        transaction = await this.populateTransaction(transaction);
        let baseTx: ethers.utils.UnsignedTransaction = {
            chainId: (transaction.chainId || undefined),
            data: (transaction.data || undefined),
            gasLimit: (transaction.gasLimit || undefined),
            gasPrice: (transaction.gasPrice || undefined),
            nonce: (transaction.nonce ? ethers.BigNumber.from(transaction.nonce).toNumber(): undefined),
            to: (transaction.to || undefined),
            value: (transaction.value || undefined),
        };
        let tx = {
            to: transaction.to || '',
            value: '',
            data: '',
            chainId: transaction.chainId!,
            nonce: ethers.utils.hexlify(transaction.nonce!),
            gasLimit: ethers.utils.hexlify(transaction.gasLimit!),
            gasPrice: ethers.utils.hexlify(transaction.gasPrice!)
        }

        if (typeof transaction.data === 'string' ) {
            tx.data = transaction.data;
        } else if ( ethers.utils.isBytesLike(transaction.data) ) {
            tx.data = ethers.utils.hexlify(transaction.data);
        } else  { // transaction.data === undefined
            tx.data = "0x";
        }

        if (typeof transaction.value === 'string' ) {
            tx.value = transaction.value;
        } else if ( transaction.value === undefined ) {
            tx.value = "0x";
        } else  { // ethers.utils.isBytesLike(transaction.value)
            tx.value = ethers.utils.hexlify(transaction.value);
        }


        let result = await OnekeyConnect.ethereumSignTransaction({
            path: this.path,
            transaction: tx
        });
        
        if(result.success) {
            return ethers.utils.serializeTransaction(baseTx, {
                v: ethers.BigNumber.from(result.payload.v).toNumber(),
                r: result.payload.r,
                s: result.payload.s,
        });
        } else {
            throw Error(result.payload['error']);
        };
    }
}