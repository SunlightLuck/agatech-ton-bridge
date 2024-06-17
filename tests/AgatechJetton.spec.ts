import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, toNano } from '@ton/core';
import { AgatechJetton } from '../wrappers/AgatechJetton';
import '@ton/test-utils';
import { buildOnchainMetadata } from '../utils/jetton-helpers';
import { JettonDefaultWallet } from '../build/AgatechJetton/tact_JettonDefaultWallet';

const jettonParams = {
    name: "Agatech",
    description: "Agatech token",
    symbol: "AGA",
    image: "https://play-lh.googleusercontent.com/ahJtMe0vfOlAu1XJVQ6rcaGrQBgtrEZQefHy7SXB7jpijKhu1Kkox90XDuH8RmcBOXNn",
};
let content = buildOnchainMetadata(jettonParams);

describe('AgatechJetton', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let agatechJetton: SandboxContract<AgatechJetton>;
    let bridge: SandboxContract<TreasuryContract>;
    let jettonWallet: SandboxContract<JettonDefaultWallet>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        bridge = await blockchain.treasury('bridge');
        agatechJetton = blockchain.openContract(await AgatechJetton.fromInit(deployer.address, content, bridge.address));


        // const deployResult = await agatechJetton.send(bridge.getSender(), { value: toNano("10") }, { $$type: 'Mint', amount: 100n, to: deployer.address });
        // expect(deployResult.transactions).toHaveTransaction({
        //     from: bridge.address,
        //     to: agatechJetton.address,
        //     deploy: true,
        //     success: true,
        // });

        // const playerWallet = await agatechJetton.getGetWalletAddress(deployer.address);
        // jettonWallet = blockchain.openContract(await JettonDefaultWallet.fromAddress(playerWallet))

        const deployResult = await agatechJetton.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'SetBridge', bridge: bridge.address });
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: agatechJetton.address,
            deploy: true,
            success: true
        })
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and agatechJetton are ready to use
        // console.log((await agatechJetton.getGetJettonData()).total_supply);
        // console.log((await agatechJetton.getGetJettonData()).owner.toString());
        // console.log((await agatechJetton.getGetBridgeAddress()).toString())
    });

    it('mint by owner', async () => {
        const tx1 = await agatechJetton.send(bridge.getSender(), { value: toNano('1') }, { $$type: 'Mint', amount: 100n, to: deployer.address })

        const playerWallet = await agatechJetton.getGetWalletAddress(deployer.address);
        jettonWallet = blockchain.openContract(await JettonDefaultWallet.fromAddress(playerWallet))
        console.log((await jettonWallet.getGetWalletData()).balance)

        const tx2 = await agatechJetton.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'Burn', amount: 1n, from: deployer.address })
        console.log((await jettonWallet.getGetWalletData()).balance)
    })

    it('transfer', async () => {
        const tx1 = await agatechJetton.send(bridge.getSender(), { value: toNano('1') }, { $$type: 'Mint', amount: 100n, to: deployer.address })

        const playerWallet = await agatechJetton.getGetWalletAddress(deployer.address);
        jettonWallet = blockchain.openContract(await JettonDefaultWallet.fromAddress(playerWallet))
        console.log((await jettonWallet.getGetWalletData()).balance)

        const user = await blockchain.treasury('user')
        await jettonWallet.send(deployer.getSender(), { value: toNano('1') }, { $$type: 'TokenTransfer', amount: 10n, query_id: 0n, custom_payload: null, sender: user.address, forward_payload: beginCell().storeUint(0, 1).storeUint(0, 32).endCell(), forward_ton_amount: toNano('0.1'), response_destination: deployer.address })

        const userWallet = await agatechJetton.getGetWalletAddress(user.address)
        const userJettonWallet = blockchain.openContract(await JettonDefaultWallet.fromAddress(userWallet))
        console.log((await jettonWallet.getGetWalletData()).balance, (await userJettonWallet.getGetWalletData()).balance)

        const tx2 = await agatechJetton.send(bridge.getSender(), { value: toNano('1') }, { $$type: 'Burn', amount: 1n, from: user.address })
        console.log((await jettonWallet.getGetWalletData()).balance, (await userJettonWallet.getGetWalletData()).balance)
    })
});
