import { OnekeySigner } from './onekey'
import { ethers } from 'ethers';
import chai, { expect } from 'chai';

describe('Onekey', () => {
    // caution!!! 
    // you should never show your mnemonic to anyone! it's only for test!
    let mnemonicSigner: ethers.Wallet; 
    let onekeySigner: OnekeySigner;
    before('create signers', async () => {
        mnemonicSigner = ethers.Wallet.fromMnemonic('lobster border horror shoulder stove stove sort sock magic kind prison fun');
        onekeySigner = await OnekeySigner.create();
    });

    it('should get same address', async () => {
        expect(await onekeySigner.getAddress()).to.eq(mnemonicSigner.address);
    });

    it('should sign string message the same', async () => {
        let message = "hello world!";
        expect(await onekeySigner.signMessage(message)).to.eq(await mnemonicSigner.signMessage(message));
    })
    
    it.only('should sign hex message the same', async () => {
        let message: ethers.utils.Bytes = [1, 2, 3, 4];
        expect(await onekeySigner.signMessage(message)).to.eq(await mnemonicSigner.signMessage(message));
    })
});