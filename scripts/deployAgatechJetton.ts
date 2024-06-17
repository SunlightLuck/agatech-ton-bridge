import { toNano } from '@ton/core';
import { AgatechJetton } from '../wrappers/AgatechJetton';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const agatechJetton = provider.open(await AgatechJetton.fromInit());

    await agatechJetton.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(agatechJetton.address);

    // run methods on `agatechJetton`
}
