# Onekey Signer for The Ethers Project 

An [ethers.js](https://github.com/ethers-io/ethers.js) signer for [Onekey](https://onekey.so/]) hardware wallet.

REMIND: it is very pre-mature and may contain unknown bugs. It may be compatible with Trezor, but without any test.

## usage

run [onekey-bridge](https://github.com/OneKeyHQ/onekey-bridge) on https://localhost:8088/

create onekey signer

```typescript
let onekeySigner = await OnekeySigner.create(provider, path);
```

notice it is an async function as it need to connect to the bridge, you should never create an instance by the "new" method. the default path is "m/44'/60'/0'/0/0", which can be overriden by path argument.

then you can use it as a normal [ethers.Signer](https://docs.ethers.io/v5/api/signer/).



## Known Issues

As [onekey-connect](https://github.com/OneKeyHQ/connect) does not provide any API to disconnect the bridge explicitly, you code will not exit after completion(try the test).



## License

MIT License (including **all** dependencies).