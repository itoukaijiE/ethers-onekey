"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnekeySigner = void 0;
const ethers_1 = require("ethers");
const connect_1 = __importStar(require("@onekeyhq/connect"));
const defaultPath = "m/44'/60'/0'/0/0";
class OnekeySigner extends ethers_1.ethers.Signer {
    constructor(provider, path) {
        super();
        if (path == null) {
            path = defaultPath;
        }
        ethers_1.ethers.utils.defineReadOnly(this, "path", path);
        ethers_1.ethers.utils.defineReadOnly(this, "provider", provider || undefined);
    }
    static create(provider, path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield connect_1.default.init({
                connectSrc: 'https://localhost:8088/',
                lazyLoad: true,
                manifest: {
                    email: 'itoukaiji@tutanota.com',
                    appUrl: 'https://github.com/itoukaiji@/ethers-onekey',
                },
                webusb: false
            });
            // without this listener, the passphrase, if enabled, would be infinitely awaited
            // to be inserted in the browser, see https://github.com/trezor/connect/issues/714
            connect_1.default.on(connect_1.UI_EVENT, (event) => {
                if (event.type === connect_1.UI.REQUEST_PASSPHRASE) {
                    if (event.payload.device.features.capabilities.includes('Capability_PassphraseEntry')) {
                        connect_1.default.uiResponse({
                            type: connect_1.UI.RECEIVE_PASSPHRASE,
                            payload: {
                                passphraseOnDevice: true,
                                save: true,
                                value: '',
                            },
                        });
                    }
                    else {
                        throw Error('Onekey passphrase not insertable on the device');
                    }
                }
                else if (event.type === connect_1.UI.REQUEST_PIN) {
                    throw Error('Onekey pin not insertable on the device');
                }
            });
            let signer = new OnekeySigner(provider, path);
            return signer;
        });
    }
    connect(provider) {
        return new OnekeySigner(provider, this.path);
    }
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield connect_1.default.ethereumGetAddress({ path: this.path });
            if (result.success) {
                return result.payload.address;
            }
            else {
                throw Error(result.payload['error']);
            }
        });
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let msg = typeof message === 'string' ? message : ethers_1.ethers.utils.hexlify(message);
            let isHex = typeof message === 'string' ? false : true;
            let result = yield connect_1.default.ethereumSignMessage({
                path: this.path,
                message: msg,
                hex: isHex
            });
            if (result.success) {
                return '0x' + result.payload.signature;
            }
            else {
                throw Error(result.payload['error']);
            }
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            transaction = yield this.populateTransaction(transaction);
            let baseTx = {
                chainId: (transaction.chainId || undefined),
                data: (transaction.data || undefined),
                gasLimit: (transaction.gasLimit || undefined),
                gasPrice: (transaction.gasPrice || undefined),
                nonce: (transaction.nonce ? ethers_1.ethers.BigNumber.from(transaction.nonce).toNumber() : undefined),
                to: (transaction.to || undefined),
                value: (transaction.value || undefined),
            };
            let tx = {
                to: transaction.to || '',
                value: '',
                data: '',
                chainId: transaction.chainId,
                nonce: ethers_1.ethers.utils.hexlify(transaction.nonce),
                gasLimit: ethers_1.ethers.utils.hexlify(transaction.gasLimit),
                gasPrice: ethers_1.ethers.utils.hexlify(transaction.gasPrice)
            };
            if (typeof transaction.data === 'string') {
                tx.data = transaction.data;
            }
            else if (ethers_1.ethers.utils.isBytesLike(transaction.data)) {
                tx.data = ethers_1.ethers.utils.hexlify(transaction.data);
            }
            else { // transaction.data === undefined
                tx.data = "0x";
            }
            if (typeof transaction.value === 'string') {
                tx.value = transaction.value;
            }
            else if (transaction.value === undefined) {
                tx.value = "0x";
            }
            else { // ethers.utils.isBytesLike(transaction.value)
                tx.value = ethers_1.ethers.utils.hexlify(transaction.value);
            }
            let result = yield connect_1.default.ethereumSignTransaction({
                path: this.path,
                transaction: tx
            });
            if (result.success) {
                return ethers_1.ethers.utils.serializeTransaction(baseTx, {
                    v: ethers_1.ethers.BigNumber.from(result.payload.v).toNumber(),
                    r: result.payload.r,
                    s: result.payload.s,
                });
            }
            else {
                throw Error(result.payload['error']);
            }
            ;
        });
    }
}
exports.OnekeySigner = OnekeySigner;
