import { ethers } from "ethers";
export declare class OnekeySigner extends ethers.Signer {
    readonly path: string;
    static create(provider?: ethers.providers.Provider, path?: string): Promise<OnekeySigner>;
    constructor(provider?: ethers.providers.Provider, path?: string);
    connect(provider: ethers.providers.Provider): ethers.Signer;
    getAddress(): Promise<string>;
    signMessage(message: ethers.utils.Bytes | string): Promise<string>;
    signTransaction(transaction: ethers.providers.TransactionRequest): Promise<string>;
}
