import { OnekeySigner } from './onekey'
import { ethers } from 'ethers';
import chai, { expect } from 'chai';

describe('Onekey', () => {
    // caution!!! 
    // you should never show your mnemonic to anyone! it's only for test!
    let mnemonicSigner: ethers.Wallet; 
    let onekeySigner: OnekeySigner;
    before('create signers', async () => {
        const provider = new ethers.providers.JsonRpcProvider('https://http-testnet.hecochain.com');
        mnemonicSigner = ethers.Wallet.fromMnemonic('lobster border horror shoulder stove stove sort sock magic kind prison fun').connect(provider);
        onekeySigner = await OnekeySigner.create(provider);
    });

    it('should get same address', async () => {
        // console.log(mnemonicSigner.address);
        expect(await onekeySigner.getAddress()).to.eq(mnemonicSigner.address);
    });

    it('should sign string message the same', async () => {
        let message = "hello world!";
        expect(await onekeySigner.signMessage(message)).to.eq(await mnemonicSigner.signMessage(message));
    });
    
    it('should sign hex message the same', async () => {
        let message: ethers.utils.Bytes = [1, 2, 3, 4];
        expect(await onekeySigner.signMessage(message)).to.eq(await mnemonicSigner.signMessage(message));
    });

    it('should sign transaction with no value and date the same', async () => {
        const tx = await mnemonicSigner.populateTransaction({ to: "0x5078907eE4F739e42c3477B7A5aefaabA9651374" });
        console.log(tx);
        delete tx.from;
        const mnemonicRawTx = await mnemonicSigner.signTransaction(tx);
        const onekeyRawTx = await onekeySigner.signTransaction(tx);
        expect(onekeyRawTx).to.eq(mnemonicRawTx);
    });

    it('should sign transaction with number value the same', async () => {
        const tx = await mnemonicSigner.populateTransaction({ 
            to: "0x5078907eE4F739e42c3477B7A5aefaabA9651374",
            value: 100000
        });
        console.log(tx);
        delete tx.from;
        const mnemonicRawTx = await mnemonicSigner.signTransaction(tx);
        const onekeyRawTx = await onekeySigner.signTransaction(tx);
        expect(onekeyRawTx).to.eq(mnemonicRawTx);
    });

    it('should sign transaction with string value and date the same', async () => {
        const tx = await mnemonicSigner.populateTransaction({ 
            to: "0x5078907eE4F739e42c3477B7A5aefaabA9651374",
            data: "0x01",
            value: "0xf4240"
        });
        console.log(tx);
        delete tx.from;
        const mnemonicRawTx = await mnemonicSigner.signTransaction(tx);
        const onekeyRawTx = await onekeySigner.signTransaction(tx);
        expect(onekeyRawTx).to.eq(mnemonicRawTx);
    });

    it('should sign transaction with bytes value and date the same', async () => {
        const tx = await mnemonicSigner.populateTransaction({ 
            to: "0x5078907eE4F739e42c3477B7A5aefaabA9651374",
            data: [1],
            value: ethers.utils.parseEther('0.1')
        });
        console.log(tx);
        delete tx.from;
        const mnemonicRawTx = await mnemonicSigner.signTransaction(tx);
        const onekeyRawTx = await onekeySigner.signTransaction(tx);
        expect(onekeyRawTx).to.eq(mnemonicRawTx);
    });
});