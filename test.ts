import { OnekeySigner } from './onekey'

(async () => {
    console.log("aaa");
    let signer = await OnekeySigner.create();
    let addr = await signer.getAddress();
    console.log(addr);
})();