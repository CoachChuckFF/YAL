import * as spl from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import * as helpers from "@coach-chuck/solana-helpers";
import { web3, BN } from "@project-serum/anchor";

// --------- DEFINES -----------------------------------------
export const PEZ_PROGRAM_ID = new anchor.web3.PublicKey(
    "GiJzLSGDvPMN7JGJsFxfuDoe8rnhAMEQGcMVEnDmgQbx"
);
export const YAL_PEZ_ID = new anchor.web3.PublicKey(
    "4rMer1B8rJBmSYecJmAJbBdooXDrjX8V3ofcT2dFWRqp"
);

export interface PezDispenser {
    name: string;
    dispenser: web3.PublicKey;
    owner: web3.PublicKey;
    gatekeeper: web3.PublicKey;
    nonce: number;
    candyMint: web3.PublicKey;
    candyShaft: web3.PublicKey;
    candyPerWallet: BN;
    candyPerPull: BN;
    candyTaken: BN;
}

export interface CreatePezParams {
    nonce: number;
    amountToLoad?: BN;
    name?: string;
    candyPerWallet?: BN;
    candyPerPull?: BN;
}

export interface UpdatePezParams {
    name?: string;
    candyPerWallet?: BN;
    candyPerPull?: BN;
}

export interface LoadPezParams {
    amountToLoad?: BN;
}

export interface EmptyPezParams {
    amountToEmpty?: BN;
}

// --------- PROVIDER -----------------------------------------
export class PezProvider {
    provider: anchor.Provider;
    program: anchor.Program<anchor.Idl>;
    owner: web3.PublicKey;
    valid: boolean;

    // Call init
    private constructor(
        provider: anchor.Provider,
        program: anchor.Program<anchor.Idl>,
        owner: web3.PublicKey,
        valid: boolean
    ) {
        this.provider = provider;
        this.program = program;
        this.owner = owner;
        this.valid = valid;
    }

    static empty = () => {
        return new PezProvider(null as any, null as any, null as any, false);
    };

    static init = async (
        provider: anchor.Provider,
        program?: anchor.Program<anchor.Idl>
    ) => {
        return new PezProvider(
            provider,
            program ?? (await PezProvider._getPezProgram(provider)),
            provider.wallet.publicKey,
            true
        );
    };

    static _getPezProgram = async (provider: anchor.Provider) => {
        const idl = await anchor.Program.fetchIdl(PEZ_PROGRAM_ID, provider);
        return new anchor.Program<anchor.Idl>(
            idl as any,
            PEZ_PROGRAM_ID,
            provider
        );
    };
}

// --------- FUNCTIONS -----------------------------------------
export const getPezCandyAccount = async (
    pezProvider: PezProvider,
    pezKey: anchor.web3.PublicKey | PezDispenser
) => {
    const pez = await getPezDispenser(pezProvider, pezKey);

    return await helpers.getSPLAccount(
        pezProvider.provider,
        pez.candyMint,
        pez.candyShaft
    );
};

export const getOwnerCandyAccount = async (
    pezProvider: PezProvider,
    pezKey: anchor.web3.PublicKey | PezDispenser
) => {
    const owner = pezProvider.provider.wallet.publicKey;
    const pez = await getPezDispenser(pezProvider, pezKey);

    const ownerCandyVaultKey = await helpers.getAssociatedTokenAddress(
        pez.candyMint,
        owner
    );

    return await helpers.getSPLAccount(
        pezProvider.provider,
        pez.candyMint,
        ownerCandyVaultKey
    );
};

export const checkIfPezAccountExists = (
    pezProvider: PezProvider,
    pezKey: anchor.web3.PublicKey | PezDispenser
) => {
    return new Promise(async (resolve, reject) => {
        try {
            let account = await getPezDispenser(pezProvider, pezKey);
            resolve(account !== null);
        } catch (error) {
            resolve(false);
        }
    });
};

export const getPezDispenser = async (
    pezProvider: PezProvider,
    pezKey: anchor.web3.PublicKey | PezDispenser,
    shouldUpdate?: boolean
) => {
    if ((pezKey as PezDispenser).nonce) {
        if (shouldUpdate) {
            return (await pezProvider.program.account.pezDispenser.fetch(
                (pezKey as PezDispenser).dispenser
            )) as PezDispenser;
        } else {
            return (await pezKey) as PezDispenser;
        }
    }
    return (await pezProvider.program.account.pezDispenser.fetch(
        pezKey as web3.PublicKey
    )) as PezDispenser;
};

export const createPezDispenser = async (
    pezProvider: PezProvider,
    tokenAccount: spl.AccountInfo,
    pezKeypair?: web3.Keypair,
    amountToLoad?: BN,
    name?: string,
    candyPerWallet?: BN,
    candyPerPull?: BN
) => {
    const pezPair = pezKeypair ?? web3.Keypair.generate();

    const [gatekeeper, nonce] = await anchor.web3.PublicKey.findProgramAddress(
        [pezPair.publicKey.toBuffer()],
        pezProvider.program.programId
    );

    const { vault, shouldCreate } =
        await helpers.getAssociatedTokenAddressAndShouldCreate(
            pezProvider.provider,
            tokenAccount.mint,
            gatekeeper,
            true
        );

    const pezParams = {
        nonce: nonce,
        amountToLoad: amountToLoad ?? tokenAccount.amount,
        name: name ?? "Pez Dispenser",
        candyPerWallet: candyPerWallet ?? new BN(1),
        candyPerPull: candyPerPull ?? new BN(1),
    } as CreatePezParams;

    await pezProvider.program.rpc.createPez(pezParams, {
        accounts: {
            dispenser: pezPair.publicKey,
            gatekeeper: gatekeeper,
            candyShaft: vault,
            ownerCandyVault: tokenAccount.address,
            owner: tokenAccount.owner,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
        },
        signers: [pezPair],
        instructions: [
            ...(shouldCreate
                ? [
                      spl.Token.createAssociatedTokenAccountInstruction(
                          spl.ASSOCIATED_TOKEN_PROGRAM_ID,
                          spl.TOKEN_PROGRAM_ID,
                          tokenAccount.mint,
                          vault,
                          gatekeeper,
                          pezProvider.provider.wallet.publicKey
                      ),
                  ]
                : []),
        ],
    });

    return getPezDispenser(pezProvider, pezPair.publicKey, true);
};

export const updatePezDispenser = async (
    pezProvider: PezProvider,
    pezKey: anchor.web3.PublicKey | PezDispenser,
    name?: string,
    candyPerWallet?: BN,
    candyPerPull?: BN
) => {
    const pez = await getPezDispenser(pezProvider, pezKey);

    const pezParams = {
        name: name ?? "",
        candyPerWallet: candyPerWallet ?? new BN(0),
        candyPerPull: candyPerPull ?? new BN(0),
    } as UpdatePezParams;

    await pezProvider.program.rpc.updatePez(pezParams, {
        accounts: {
            dispenser: pez.dispenser,
            owner: pez.owner,
        },
        signers: [],
        instructions: [],
    });

    return getPezDispenser(pezProvider, pez, true);
};

export const loadPezDispenser = async (
    pezProvider: PezProvider,
    pezKey: anchor.web3.PublicKey | PezDispenser,
    amountToLoad?: BN
) => {
    const owner = pezProvider.provider.wallet.publicKey;
    const pez = await getPezDispenser(pezProvider, pezKey);

    const ownerCandyVaultKey = await helpers.getAssociatedTokenAddress(
        pez.candyMint,
        owner
    );

    const ownerCandyVault = await helpers.getSPLAccount(
        pezProvider.provider,
        pez.candyMint,
        ownerCandyVaultKey
    );

    const pezParams = {
        amountToLoad: amountToLoad ?? new BN(ownerCandyVault.amount),
    } as LoadPezParams;

    await pezProvider.program.rpc.loadPez(pezParams, {
        accounts: {
            dispenser: pez.dispenser,
            gatekeeper: pez.gatekeeper,
            candyShaft: pez.candyShaft,
            ownerCandyVault: ownerCandyVaultKey,
            owner: pez.owner,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
        },
        signers: [],
        instructions: [],
    });

    return getPezDispenser(pezProvider, pez, true);
};

export const emptyPezDispenser = async (
    pezProvider: PezProvider,
    pezKey: anchor.web3.PublicKey | PezDispenser,
    amountToEmpty?: BN
) => {
    const owner = pezProvider.provider.wallet.publicKey;
    const pez = await getPezDispenser(pezProvider, pezKey);

    const ownerCandyVaultKey = await helpers.getAssociatedTokenAddress(
        pez.candyMint,
        owner
    );

    const candyShaft = await helpers.getSPLAccount(
        pezProvider.provider,
        pez.candyMint,
        pez.candyShaft
    );

    const pezParams = {
        amountToEmpty: amountToEmpty ?? new BN(candyShaft.amount),
    } as EmptyPezParams;

    await pezProvider.program.rpc.emptyPez(pezParams, {
        accounts: {
            dispenser: pez.dispenser,
            gatekeeper: pez.gatekeeper,
            candyShaft: pez.candyShaft,
            ownerCandyVault: ownerCandyVaultKey,
            owner: pez.owner,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
        },
        signers: [],
        instructions: [],
    });

    return getPezDispenser(pezProvider, pez, true);
};

export const takePez = async (
    pezProvider: PezProvider,
    pezKey: anchor.web3.PublicKey | PezDispenser
) => {
    const taker = pezProvider.provider.wallet.publicKey;
    const pez = await getPezDispenser(pezProvider, pezKey);

    const { vault, shouldCreate } =
        await helpers.getAssociatedTokenAddressAndShouldCreate(
            pezProvider.provider,
            pez.candyMint,
            taker
        );

    await pezProvider.program.rpc.takePez({
        accounts: {
            dispenser: pez.dispenser,
            gatekeeper: pez.gatekeeper,
            candyShaft: pez.candyShaft,
            takerCandyVault: vault,
            taker: taker,
            tokenProgram: spl.TOKEN_PROGRAM_ID,
        },
        signers: [],
        instructions: [
            ...(shouldCreate
                ? [
                      spl.Token.createAssociatedTokenAccountInstruction(
                          spl.ASSOCIATED_TOKEN_PROGRAM_ID,
                          spl.TOKEN_PROGRAM_ID,
                          pez.candyMint,
                          vault,
                          taker,
                          taker
                      ),
                  ]
                : []),
        ],
    });

    return getPezDispenser(pezProvider, pez, true);
};
