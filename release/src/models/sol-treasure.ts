import * as spl from "@solana/spl-token";
import * as anchor from '@project-serum/anchor';
import * as helpers from "@coach-chuck/solana-helpers";
import { web3, BN } from "@project-serum/anchor";

// --------- DEFINES -----------------------------------------
export const SOL_TREASURE_ID = new web3.PublicKey("GeHoPNKCypvmQy96y8DYxZBQf9gQiVW2NqVMUTxFG8a5");

export const NULL_MINT_BYTES = [0,0,0,0];
export const NULL_DATE = new BN(new BN(0).notn(64));

export enum GameItemType {
    item = 0x00,
    reward = 0x01,
    comb = 0x02,
}

export enum LeaderboardType {
    og,
    speed,
}
export interface GameLeaderboardInfo {
    name: string,
    player: web3.PublicKey,
    gameStart: BN,
    runStart: BN,
    runPercentTimestamp: BN,
    runPercent: number,
}

export interface GameCombination {
    name: string,
    input0Id: BN,
    input0Amount: number,
    input1Id: BN,
    input1Amount: number,
    outputId: BN,
    outputAmount: number,
}

export interface GameItem {
    name: string,
    mint: web3.PublicKey,
    burned: boolean,
    requirements: BN,
    id: BN,
    itemType: GameItemType,
    mintTailSeed: number,
    mintBytes: number[],
    percentPerItem: number,
    itemsPerMint: number,
    maxItemsPerInventory: number,
    costPerItem: BN,
}

export interface GameInventoryItem {
    mint: web3.PublicKey,
    amount: number,
    mintedCount: number,
}

export interface PlayerAccount {
    name: string,
    player: web3.PublicKey,
    game: web3.PublicKey,
    playerReplayVault: web3.PublicKey,
    playerWrongAnswerVault: web3.PublicKey,
    playerAccount: web3.PublicKey,
    runStart: BN,
    runPercentTimestamp: BN,
    runPercent: number,
    ogPercent: number,
    isSpeedrunning: boolean,
    inventory: GameInventoryItem[]
}

export interface GameAccount {
    name: string,
    game: web3.PublicKey,
    coach: web3.PublicKey,
    gatekeeper: web3.PublicKey,
    nonce: number,
    lamports: BN,
    cheaterTime: BN,
    startDate: BN,
    supernovaDate: BN,
    replayTokenMint: web3.PublicKey,
    wrongAnswerMint: web3.PublicKey,
    wrongAnswerVault: web3.PublicKey,
    itemCount: number,
    combinationCount: number,
    leaderboardCount: number,
    items: GameItem[],
    combinations: GameCombination[],
    leaderboard: GameLeaderboardInfo[],
    speedboard: GameLeaderboardInfo[],
}

export interface CreateGameParams {
    name: string,
    nonce?: number,
    itemCount: number,
    combinationCount: number,
    leaderboardCount: number,
}

export interface LoadItemsParams {
    name: string,
    itemType: GameItemType,
    mintTailSeed: number,
    mintBytes: number[],
    isReplayToken: boolean,
    isWrongAnswerItem: boolean,
    percentPerItem: number,
    itemsPerMint: number,
    maxItemsPerInventory: number,
    costPerItem: BN,
    amountToTx: BN,
}

export interface LoadCombinationsParams {
    name: string,
    input0Amount: number,
    input1Amount: number,
    outputAmount: number,
}

export interface LoadRequirementsParams {
    requirements: BN,
}

export interface StartStopCountdownParams {
    playing: boolean,
    countdownTime: BN,
    supernovaDate: BN,
    cheaterTime: BN,
}

export interface CreatePlayerParams {
    name: string,
    bump?: number,
}

export interface HashItemParams {
    hash: number[],
}


export interface ForgeItemParams {
    combinationIndex: number,
}

// --------- PROVIDER -----------------------------------------
export class STProvider {
    provider: anchor.Provider;
    program: anchor.Program<anchor.Idl>;
    owner: web3.PublicKey;
    valid: boolean;

    // Call init
    private constructor(
        provider: anchor.Provider,
        program: anchor.Program<anchor.Idl>,
        owner: web3.PublicKey,
        valid: boolean,
    ) {
        this.provider = provider;
        this.program = program;
        this.owner = owner;
        this.valid = valid;
    }

    static empty = () => {
        return new STProvider(
            null as any,
            null as any,
            null as any,
            false,
        );
    }

    static init = async (
        provider: anchor.Provider,
        program?: anchor.Program<anchor.Idl>,
    ) => {
        return new STProvider(
            provider,
            program ?? await STProvider._getSTProgram(provider),
            provider.wallet.publicKey,
            true,
        );
    }

    static _getSTProgram = async (provider: anchor.Provider) => { 
        const idl = await anchor.Program.fetchIdl(SOL_TREASURE_ID, provider);
        return new anchor.Program<anchor.Idl>(idl as any, SOL_TREASURE_ID, provider);
    }
}

// --------- FUNCTIONS -----------------------------------------
export const getGameAccount = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    shouldUpdate?: boolean,
) => { 
    if((gameKey as GameAccount).game){
        if( shouldUpdate ){
            return (await stProvider.program.account.game.fetch((gameKey as GameAccount).game)) as GameAccount; 
        } else {
            return await gameKey as GameAccount;
        }
    }
    return (await stProvider.program.account.game.fetch(gameKey as web3.PublicKey)) as GameAccount; 
}

export const getPlayerAccount = async (
    stProvider: STProvider,
    playerAccountKey: web3.PublicKey | PlayerAccount,
    shouldUpdate?: boolean,
) => { 
    if((playerAccountKey as PlayerAccount).player){
        if( shouldUpdate ){
            return (await stProvider.program.account.player.fetch((playerAccountKey as PlayerAccount).playerAccount)) as PlayerAccount; 
        } else {
            return await playerAccountKey as PlayerAccount;
        }
    }
    return (await stProvider.program.account.player.fetch(playerAccountKey as web3.PublicKey)) as PlayerAccount; 
}


export const findPlayerAccount = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    player?: web3.PublicKey,
) => {
    const game = await getGameAccount(stProvider, gameKey);

    return await web3.PublicKey.findProgramAddress(
        [
            player?.toBuffer() ?? stProvider.owner.toBuffer(),
            game.game.toBuffer(),
        ],
        stProvider.program.programId,
    );
}

export const createGame = async (
    stProvider: STProvider,
    params: CreateGameParams,
    gameKeypair?: web3.Keypair 
) => {
    const owner = stProvider.owner;
    const gameKP = gameKeypair ?? web3.Keypair.generate();

    const [gatekeeper, nonce] = await web3.PublicKey.findProgramAddress(
        [gameKP.publicKey.toBuffer()],
        stProvider.program.programId
    );

    params.nonce = nonce;
    
    await stProvider.program.rpc.createGame(
        params,
        {
            accounts: {
                game: gameKP.publicKey,
                gatekeeper: gatekeeper,
                coach: owner,
                systemProgram: web3.SystemProgram.programId,
            },
            signers: [gameKP],
            instructions: [],
        }
    );

    return getGameAccount(stProvider, gameKP.publicKey, true);
}

export const loadItem = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    mint: web3.PublicKey,
    params: LoadItemsParams,
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const owner = stProvider.owner;

    const ownerVault = await helpers.getAssociatedTokenAddress(
        mint,
        owner, 
    );

    const { vault, shouldCreate } = await helpers.getAssociatedTokenAddressAndShouldCreate(
        stProvider.provider,
        mint,
        game.gatekeeper,
        true,
    );
    
    await stProvider.program.rpc.loadItem(
        params,
        {
          accounts: {
                game: game.game,
                gatekeeper: game.gatekeeper,
                coachVault: ownerVault,
                gameVault: vault,
                coach: owner,
                tokenProgram: spl.TOKEN_PROGRAM_ID,
          },
          signers: [],
          instructions: [
            ...(shouldCreate) ? [
                spl.Token.createAssociatedTokenAccountInstruction(
                    spl.ASSOCIATED_TOKEN_PROGRAM_ID,
                    spl.TOKEN_PROGRAM_ID,
                    mint,
                    vault,
                    game.gatekeeper,
                    owner,
                ) 
            ] : []
          ],
        }
    );

    return getGameAccount(stProvider, game.game, true);
}

export const loadCombination = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    mintI0: web3.PublicKey,
    mintI1: web3.PublicKey,
    mintO: web3.PublicKey,
    params: LoadCombinationsParams,
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const owner = stProvider.owner;

    const input0 = await helpers.getAssociatedTokenAddress(mintI0, game.gatekeeper, true);
    const input1 = await helpers.getAssociatedTokenAddress(mintI1, game.gatekeeper, true);
    const output = await helpers.getAssociatedTokenAddress(mintO, game.gatekeeper, true);
    
    await stProvider.program.rpc.loadCombination(
        params,
        {
            accounts: {
                game: game.game,
                gatekeeper: game.gatekeeper,
                input0: input0,
                input1: input1,
                output: output,
                coach: owner,
            },
            signers: [],
            instructions: [],
        }
    );

    return getGameAccount(stProvider, game.game, true);
}

export const loadRequirements = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    mint: web3.PublicKey,
    params: LoadRequirementsParams,
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const owner = stProvider.owner;

    const itemVault = await helpers.getAssociatedTokenAddress(mint, game.gatekeeper, true);
    
    await stProvider.program.rpc.loadRequirements(
        params,
        {
            accounts: {
                game: game.game,
                gatekeeper: game.gatekeeper,
                itemVault: itemVault,
                coach: owner,
            },
            signers: [],
            instructions: [],
        }
    );

    return getGameAccount(stProvider, game.game, true);
}

export const startStopCountdown = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    params: StartStopCountdownParams,
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const owner = stProvider.owner;
    
    await stProvider.program.rpc.startStopCountdown(
        params,
        {
            accounts: {
                game: game.game,
                coach: owner,
            },
            signers: [],
            instructions: [],
        }
    );

    return getGameAccount(stProvider, game.game, true);
}

export const supernova = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    mint: web3.PublicKey,
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const owner = stProvider.owner;

    const itemVault = await helpers.getAssociatedTokenAddress(mint, game.gatekeeper, true);
    
    await stProvider.program.rpc.supernova(
        {
            accounts: {
                game: game.game,
                gatekeeper: game.gatekeeper,
                itemVault: itemVault,
                itemMint: mint,
                coach: owner,
                tokenProgram: spl.TOKEN_PROGRAM_ID,
            },
            signers: [],
            instructions: [],
        }
    );

    return getGameAccount(stProvider, game.game, true);
}

export const createPlayerAccount = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    params: CreatePlayerParams,
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const player = stProvider.owner;


    const [ playerAccount, bump ] = await findPlayerAccount(
        stProvider,
        game,
        player
    );

    params.bump = bump;


    let replay = await helpers.getAssociatedTokenAddressAndShouldCreate(
        stProvider.provider,
        game.replayTokenMint,
        player,
    );


    let wrongAns = await helpers.getAssociatedTokenAddressAndShouldCreate(
        stProvider.provider,
        game.wrongAnswerMint,
        player,
    );

    await stProvider.program.rpc.createPlayerAccount(
        params,
        {
            accounts: {
                playerAccount: playerAccount,
                game: game.game,
                player: player,
                playerReplayVault: replay.vault,
                playerWrongAnswerVault: wrongAns.vault,
                gatekeeper: game.gatekeeper,
                systemProgram: web3.SystemProgram.programId,
            },
            signers: [],
            instructions: [
                ...(replay.shouldCreate) ? [
                    spl.Token.createAssociatedTokenAccountInstruction(
                        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
                        spl.TOKEN_PROGRAM_ID,
                        game.replayTokenMint,
                        replay.vault,
                        player,
                        player,
                    ) 
                ] : [],
                ...(wrongAns.shouldCreate) ? [
                    spl.Token.createAssociatedTokenAccountInstruction(
                        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
                        spl.TOKEN_PROGRAM_ID,
                        game.wrongAnswerMint,
                        wrongAns.vault,
                        player,
                        player,
                    ) 
                ] : []
            ],
        }
    );


    return getPlayerAccount(stProvider, playerAccount, true);
}

export const startSpeedrun = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    playerAccountKey: web3.PublicKey | PlayerAccount,
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const playerAccount = await getPlayerAccount(stProvider, playerAccountKey);
    const player = stProvider.owner;

    await stProvider.program.rpc.startSpeedrun(
        {
            accounts: {
                game: game.game,
                playerAccount: playerAccount.playerAccount,
                playerReplayVault: playerAccount.playerReplayVault,
                player: player,
            },
            signers: [],
            instructions: [],
        }
    );

    return getPlayerAccount(stProvider, playerAccount.playerAccount, true);
}


export const hashItem = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    playerAccountKey: web3.PublicKey | PlayerAccount,
    mint: web3.PublicKey,
    params: HashItemParams,
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const playerAccount = await getPlayerAccount(stProvider, playerAccountKey);
    const player = stProvider.owner;

    const gameItemAccount = await helpers.getAssociatedTokenAddress(mint, game.gatekeeper, true);
    const isRecreation = await getIsRecreation(stProvider, game);

    const gameVault = await helpers.getAssociatedTokenAddress(mint, game.gatekeeper, true);
    const { vault, shouldCreate } = await helpers.getAssociatedTokenAddressAndShouldCreate(
        stProvider.provider,
        mint,
        player,
    );

    const tx = new web3.Transaction();

    tx.add(
        stProvider.program.instruction.hashItem(
            params,
            {
                accounts: {
                    game: game.game,
                    playerAccount: playerAccount.playerAccount,
                    gatekeeper: game.gatekeeper,
                    gameItemAccount: gameItemAccount,
                    playerReplayVault: playerAccount.playerReplayVault,
                    player: player,
                },
                signers: [],
                instructions: [],
            } 
        )
    );


    if(shouldCreate && !isRecreation){
        tx.add(
            ...[
                spl.Token.createAssociatedTokenAccountInstruction(
                    spl.ASSOCIATED_TOKEN_PROGRAM_ID,
                    spl.TOKEN_PROGRAM_ID,
                    mint,
                    vault,
                    player,
                    player,
                ) 
            ]
        );
    }

    tx.add(
        stProvider.program.instruction.mintItem(
            {
                accounts: {
                    game: game.game,
                    gatekeeper: game.gatekeeper,
                    playerAccount: playerAccount.playerAccount,
                    gameVault: gameVault,
                    gameWrongAnswerVault: game.wrongAnswerVault,
                    playerVaultOrReplay: isRecreation ? playerAccount.playerReplayVault : vault,
                    playerWrongAnswerVault: playerAccount.playerWrongAnswerVault,
                    player: player,
                    coach: game.coach,
                    tokenProgram: spl.TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [],
                instructions: [],
            } 
        )
    );

    await stProvider.provider.send(tx);

    return getPlayerAccount(stProvider, playerAccount, true);
}

export const hashTwoItems = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    playerAccountKey: web3.PublicKey | PlayerAccount,
    mint0: web3.PublicKey,
    mint1: web3.PublicKey,
    params: HashItemParams,
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const playerAccount = await getPlayerAccount(stProvider, playerAccountKey);
    const player = stProvider.owner;

    const isRecreation = await getIsRecreation(stProvider, game);

    const gameVault0 = await helpers.getAssociatedTokenAddress(mint0, game.gatekeeper, true);
    const vault0 = await helpers.getAssociatedTokenAddressAndShouldCreate(
        stProvider.provider,
        mint0,
        player,
    );

    const gameVault1 = await helpers.getAssociatedTokenAddress(mint1, game.gatekeeper, true);
    const vault1 = await helpers.getAssociatedTokenAddressAndShouldCreate(
        stProvider.provider,
        mint1,
        player,
    );

    const tx = new web3.Transaction();

    tx.add(
        stProvider.program.instruction.hashItem(
            params,
            {
                accounts: {
                    game: game.game,
                    playerAccount: playerAccount.playerAccount,
                    gatekeeper: game.gatekeeper,
                    gameItemAccount: gameVault0,
                    playerReplayVault: playerAccount.playerReplayVault,
                    player: player,
                },
                signers: [],
                instructions: [],
            } 
        )
    );


    if(vault0.shouldCreate && !isRecreation){
        tx.add(
            ...[
                spl.Token.createAssociatedTokenAccountInstruction(
                    spl.ASSOCIATED_TOKEN_PROGRAM_ID,
                    spl.TOKEN_PROGRAM_ID,
                    mint0,
                    vault0.vault,
                    player,
                    player,
                ) 
            ]
        );
    }

    tx.add(
        stProvider.program.instruction.mintItem(
            {
                accounts: {
                    game: game.game,
                    gatekeeper: game.gatekeeper,
                    playerAccount: playerAccount.playerAccount,
                    gameVault: gameVault0,
                    gameWrongAnswerVault: game.wrongAnswerVault,
                    playerVaultOrReplay: isRecreation ? playerAccount.playerReplayVault : vault0.vault,
                    playerWrongAnswerVault: playerAccount.playerWrongAnswerVault,
                    player: player,
                    coach: game.coach,
                    tokenProgram: spl.TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [],
                instructions: [],
            } 
        )
    );

    tx.add(
        stProvider.program.instruction.hashItem(
            params,
            {
                accounts: {
                    game: game.game,
                    playerAccount: playerAccount.playerAccount,
                    gatekeeper: game.gatekeeper,
                    gameItemAccount: gameVault1,
                    playerReplayVault: playerAccount.playerReplayVault,
                    player: player,
                },
                signers: [],
                instructions: [],
            } 
        )
    );


    if(vault1.shouldCreate && !isRecreation){
        tx.add(
            ...[
                spl.Token.createAssociatedTokenAccountInstruction(
                    spl.ASSOCIATED_TOKEN_PROGRAM_ID,
                    spl.TOKEN_PROGRAM_ID,
                    mint1,
                    vault1.vault,
                    player,
                    player,
                ) 
            ]
        );
    }

    tx.add(
        stProvider.program.instruction.mintItem(
            {
                accounts: {
                    game: game.game,
                    gatekeeper: game.gatekeeper,
                    playerAccount: playerAccount.playerAccount,
                    gameVault: gameVault1,
                    gameWrongAnswerVault: game.wrongAnswerVault,
                    playerVaultOrReplay: isRecreation ? playerAccount.playerReplayVault : vault1.vault,
                    playerWrongAnswerVault: playerAccount.playerWrongAnswerVault,
                    player: player,
                    coach: game.coach,
                    tokenProgram: spl.TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [],
                instructions: [],
            } 
        )
    );

    await stProvider.provider.send(tx);

    return getPlayerAccount(stProvider, playerAccount, true);
}

export const forgeItem = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    playerAccountKey: web3.PublicKey | PlayerAccount,
    mintI0: web3.PublicKey,
    mintI1: web3.PublicKey,
    mintO: web3.PublicKey,
    params: ForgeItemParams,
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const playerAccount = await getPlayerAccount(stProvider, playerAccountKey);
    const player = stProvider.owner;

    const isRecreation = await getIsRecreation(stProvider, game);

    const playerI0Vault = await helpers.getAssociatedTokenAddress(isRecreation ? game.replayTokenMint : mintI0, player);
    const playerI1Vault = await helpers.getAssociatedTokenAddress(isRecreation ? game.replayTokenMint : mintI1, player);

    const gameI0Vault = await helpers.getAssociatedTokenAddress(mintI0, game.gatekeeper, true);
    const gameI1Vault = await helpers.getAssociatedTokenAddress(mintI1, game.gatekeeper, true);
    const gameOVault = await helpers.getAssociatedTokenAddress(mintO, game.gatekeeper, true);


    const gameVault = await helpers.getAssociatedTokenAddress(mintO, game.gatekeeper, true);
    const { vault, shouldCreate } = await helpers.getAssociatedTokenAddressAndShouldCreate(
        stProvider.provider,
        mintO,
        player,
    );

    const tx = new web3.Transaction();

    tx.add(
        stProvider.program.instruction.forgeItem(
            params,
            {
                accounts: {
                    game: game.game,
                    gatekeeper: game.gatekeeper,
                    playerAccount: playerAccount.playerAccount,
                    input0Mint: mintI0,
                    input1Mint: mintI1,
                    input0Vault: gameI0Vault,
                    input1Vault: gameI1Vault,
                    outputVault: gameOVault,
                    input0PlayerVault: playerI0Vault,
                    input1PlayerVault: playerI1Vault,
                    playerReplayVault: playerAccount.playerReplayVault,
                    player: player,
                    tokenProgram: spl.TOKEN_PROGRAM_ID,
                },
                signers: [],
                instructions: [],
            } 
        )
    );

    if(shouldCreate && !isRecreation){
        tx.add(
            ...[
                spl.Token.createAssociatedTokenAccountInstruction(
                    spl.ASSOCIATED_TOKEN_PROGRAM_ID,
                    spl.TOKEN_PROGRAM_ID,
                    mintO,
                    vault,
                    player,
                    player,
                ) 
            ]
        );
    }

    tx.add(
        stProvider.program.instruction.mintItem(
            {
                accounts: {
                    game: game.game,
                    gatekeeper: game.gatekeeper,
                    playerAccount: playerAccount.playerAccount,
                    gameVault: gameVault,
                    gameWrongAnswerVault: game.wrongAnswerVault,
                    playerVaultOrReplay: isRecreation ? playerAccount.playerReplayVault : vault,
                    playerWrongAnswerVault: playerAccount.playerWrongAnswerVault,
                    player: player,
                    coach: game.coach,
                    tokenProgram: spl.TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [],
                instructions: [],
            } 
        )
    );

    await stProvider.provider.send(tx);

    return getPlayerAccount(stProvider, playerAccount, true);
}

// --------- HELPERS -------------------------------------------
export const lammysToSol = (lammys: BN) => {
    return lammys.toNumber() / web3.LAMPORTS_PER_SOL
}

export const DateToBN = (date: Date | number) => {
    return new BN(Math.trunc((new Date(date)).getTime() / 1000))
}

export const BNToDate = (date: BN) => {
    if(date.eq(NULL_DATE)) return new Date(0);
    return new Date(Math.trunc(date.toNumber() * 1000));
}

export const BNToMin = (date: BN) => {
    if(date.eq(NULL_DATE)) return 0;
    return Math.fround(date.toNumber() / 60 );
}

export const BNToHours = (date: BN) => {
    if(date.eq(NULL_DATE)) return 0;
    return Math.fround(date.toNumber() / 60 / 60 );
}

export const dateToUnix = (date?: Date) => {
    return ( date ) ? 
        (Math.trunc(date.getTime() / 1000)) :
        (Math.trunc(Date.now() / 1000));
}

export const timeToString = (time?: number | Date) => {
    let date = new Date(time ?? Date.now());

    return date.toISOString();
}

export const reqToString = (req: BN, len: number = 64) => {
    let string = "";
    for (let index = 0; index < len; index++) {

        if(req.and((new BN(1)).shln(len - 1 - index)).eq(new BN(0))){
            string += "0 "
        } else {
            string += "1 "
        }
    }

    return string;
}

export const itemTypeToString = (itemType: GameItemType) => {
    switch(itemType){
        case GameItemType.comb: return "Combination";
        case GameItemType.item: return "Item";
        case GameItemType.reward: return "Reward";
    }

    return "Unkown";
}
// --------- GAME HELPERS -----------------------------------------
export const checkAllBurned = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
) => {
    const game = await getGameAccount(stProvider, gameKey);

    for (let i = 0; i < game.items.length; i++){
        if(!game.items[i].burned) return false;
    }

    return true;
}

export const getItemByMint = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    mint: web3.PublicKey
) => {
    const game = await getGameAccount(stProvider, gameKey);

    for (let i = 0; i < game.items.length; i++){
        if( mint.equals(game.items[i].mint) ) return game.items[i];
    }

    throw new Error("Item not found");
}

export const getInventoryItemByMint = async (
    stProvider: STProvider,
    playerAccountKey: web3.PublicKey | PlayerAccount,
    mint: web3.PublicKey,
) => {
    const playerAccount = await getPlayerAccount(stProvider, playerAccountKey);

    for (let i = 0; i < playerAccount.inventory.length; i++){
        if( mint.equals(playerAccount.inventory[i].mint) ) return playerAccount.inventory[i];
    }

    throw new Error("Item not found");
}

export const doesMeetReq = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    playerAccountKey: web3.PublicKey | PlayerAccount,
    mint: web3.PublicKey
) => {
    const game = await getGameAccount(stProvider, gameKey);
    const playerAccount = await getPlayerAccount(stProvider, playerAccountKey);
    const player = stProvider.owner;

    let item = await getItemByMint(
        stProvider,
        game,
        mint
    );

    let mints: web3.PublicKey[] = [];
    for (let i = 0; i < game.items.length; i++) {
        if(!item.requirements.and(game.items[i].id).eq(new BN(0))){
            mints.push(game.items[i].mint);
        }
    }

    for (let i = 0; i < mints.length; i++) {
        for (let j = 0; j < playerAccount.inventory.length; j++) {
            if(mints[i].equals(playerAccount.inventory[j].mint)){
                if(playerAccount.inventory[j].mintedCount == 0) return false;
            }
        }        
    }

    return true;
}

export const leaderboardSort = (
    a: GameLeaderboardInfo,
    b: GameLeaderboardInfo,
) => {
    if(a.runPercent > b.runPercent){ return -1; }
    if(a.runPercent < b.runPercent){ return 1; }

    let aTime = a.runPercentTimestamp.sub(a.gameStart);
    let bTime = b.runPercentTimestamp.sub(b.gameStart);

    return aTime.cmp(bTime)
}
export const speedboardSort = (
    a: GameLeaderboardInfo,
    b: GameLeaderboardInfo,
) => {
    if(a.runPercent > b.runPercent){ return -1; }
    if(a.runPercent < b.runPercent){ return 1; }

    let aTime = a.runPercentTimestamp.sub(a.runStart);
    let bTime = b.runPercentTimestamp.sub(b.runStart);

    return aTime.cmp(bTime)
}

export const sortLeaderboard = (
    entries: GameLeaderboardInfo[],
    type: LeaderboardType,
) => {
    switch(type){
        case LeaderboardType.og: return [...entries.sort(leaderboardSort)];
        case LeaderboardType.speed: return [...entries.sort(speedboardSort)];
    }

    return [...entries];
}

export const hashWallet = (
    stProvider: STProvider,
    mintBytes: number[],
    tail: number,
) => {
    const wallet = [...stProvider.owner.toBytes() as any];
    let hash = [...NULL_MINT_BYTES];

    if(tail > 16 ) return hash;
    if(mintBytes.length !== hash.length) return hash;
    for(let i = 0; i < mintBytes.length; i++){ if(mintBytes[i] > wallet.length) return hash; }

    
    for(let i = 0; i < hash.length; i++)
        hash[i] = wallet[wallet.length - 1 - tail] ^ wallet[mintBytes[i]]

    // console.log(`"Player Key: ${stProvider.owner}`);
    // console.log(`"Wallet Len: ${wallet.length}`);
    // console.log(`"Wallet:     [${wallet}]`);
    // console.log(`"Tail:       ${tail}`);
    // console.log(`"Mint:       [${mintBytes}]`);
    // console.log(`"Hash:       [${hash}]\n`);

    // [50, 37, 53, 127]
    // [14,31,167,9]

    return hash;
}

export const getTimeTillSupernova = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    mint: web3.PublicKey
) => {
    const game = await getGameAccount(stProvider, gameKey);
    return Math.min(0, (BNToDate(game.supernovaDate).getTime() - Date.now()))
}

export const getIsPlaying = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
) => {
    const game = await getGameAccount(stProvider, gameKey);

    if(game.startDate.eq(NULL_DATE)) return false;

    return game.startDate.lte(DateToBN(Date.now()));
}

export const getIsRecreation = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
) => {
    const game = await getGameAccount(stProvider, gameKey);

    if(game.startDate.eq(NULL_DATE)) return false;

    return game.supernovaDate.lt(DateToBN(Date.now()));
}


export const getItemID = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    mint: web3.PublicKey
) => {
    const game = await getGameAccount(stProvider, gameKey);

    for (let i = 0; i < game.items.length; i++) {
        if(mint.equals(game.items[i].mint)) return game.items[i].id;
    }

    throw new Error("Item does not exist");
}

export const createLoadRequirementParams = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    reqItems: web3.PublicKey[],
) => {
    const game = await getGameAccount(stProvider, gameKey);
    let req = new BN(0);

    for (let i = 0; i < reqItems.length; i++) {
        req = req.or(await getItemID(stProvider, gameKey, reqItems[i]))
    }

    return {
        requirements: req
    } as LoadRequirementsParams;
}

export const createForgeParams = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
    comboIndex: number
) => {
    const game = await getGameAccount(stProvider, gameKey);

    if(comboIndex >= game.combinations.length){
        throw new Error("Bad combo index");
    }

    const combo = game.combinations[comboIndex];
    let mints = {
        mintI0: web3.PublicKey.default,
        mintI1: web3.PublicKey.default,
        mintO: web3.PublicKey.default,
    };

    for (let i = 0; i < game.items.length; i++) {
        if(game.items[i].id.eq(combo.input0Id)) mints.mintI0 = game.items[i].mint;
        if(game.items[i].id.eq(combo.input1Id)) mints.mintI1 = game.items[i].mint;
        if(game.items[i].id.eq(combo.outputId)) mints.mintO = game.items[i].mint;
    }

    return {
        mints: mints,
        params: {
            combinationIndex: comboIndex,
        } as ForgeItemParams
    };
}

export const errorToString = (error: any, isMint: boolean = false) => {

    let message = (isMint) ? "Need 0.05 Sol" : "Unkown";
    if(error.logs){
        if(error.logs.length >= 3){
            const split = (error.logs[2] as String).split('Error Message:');
            if(split.length >= 2){
                message = split[1];
            }
        }
    }

    return message;
}

export const gameToString = async (
    stProvider: STProvider,
    gameKey: web3.PublicKey | GameAccount,
) => {
    const game = await getGameAccount(stProvider, gameKey);


    let string = "\n";
    string += `---------- SOL-TREASURE -------------\n`;
    string += `- Playing:                 ${await getIsPlaying(stProvider, game)} \n`;
    string += `- Is Recon:                ${await getIsRecreation(stProvider, game)} \n\n`;
    string += `- Name:                    ${game.name} \n`;
    string += `- Game:                    ${game.game} \n`;
    string += `- Coach:                   ${game.coach} \n`;
    string += `- Gatekeeper:              ${game.gatekeeper} [${game.nonce}]\n\n`;
    string += `- Replay Token:            ${game.replayTokenMint} \n`;
    string += `- Wrong Answer:            ${game.wrongAnswerMint} \n`;
    string += `- Wrong Answer Vault:      ${game.wrongAnswerVault} \n`;
    string += `\n---- STATE\n`;
    string += `- Lammys:                  ${lammysToSol(game.lamports)} \n`;
    string += `- Cheater Time:            ${BNToMin(game.cheaterTime)}\n`;
    string += `- Start Date:              ${BNToDate(game.startDate)}\n`;
    string += `- Supernova Date:          ${BNToDate(game.supernovaDate)}\n\n`;
    string += `\n---- ITEMS\n`;
    string += `- Total Items:             ${game.itemCount} [${game.items.length}] \n`;
    
    for (let i = 0; i < game.items.length; i++) { string += gameItemToString(game.items[i], game.items.length) }

    string += `\n---- COMBOS\n`;
    string += `- Total Combos:             ${game.combinationCount} [${game.combinations.length}] \n`;

    for (let i = 0; i < game.combinations.length; i++) { string += gameCombinationToString(game.combinations[i], game.items.length) }

    string += `\n---- LEADERBAORDS\n`;
    string += `- Total Players:            ${game.leaderboardCount} [${game.leaderboard.length}] \n`;

    for (let i = 0; i < game.leaderboard.length; i++) { string += gameLeaderboardEntryToString(game.leaderboard[i], game.startDate) }

    string += `\n---- SPEEDBOARD\n`;
    string += `- Total Players:            ${game.leaderboardCount} [${game.leaderboard.length}] \n`;

    for (let i = 0; i < game.speedboard.length; i++) { string += gameLeaderboardEntryToString(game.speedboard[i]) }

    string += `\n-------------------------------------\n\n`;

    return string;
}

export const gameItemToString = (
    item: GameItem,
    len: number = 64,
) => {

    let string = `\n`;
    string += `--- [${item.name}]\n`;
    string += `-- Burned?:                 ${item.burned}\n`;
    string += `-- Mint:                    ${item.mint}\n`;
    string += `-- Item Type:               ${itemTypeToString(item.itemType)}\n`;
    string += `-- ID:                      ${reqToString(item.id, len)}\n`;
    string += `-- Reqs:                    ${reqToString(item.requirements, len)}\n`;
    string += `-- Hash:                    [${item.mintTailSeed}] [${item.mintBytes}]\n`;

    string += `-- Percent:                 ${item.percentPerItem}\n`;
    string += `-- Amount Per Mint:         ${item.itemsPerMint}\n`;
    string += `-- Max Per Inventory:       ${item.maxItemsPerInventory}\n`;
    string += `-- Cost:                    ${lammysToSol(item.costPerItem)}\n`;

    return string;
}

export const gameCombinationToString = (
    combo: GameCombination,
    len: number = 64,
) => {

    let string = `\n`;
    string += `--- [${combo.name}]\n`;
    string += `-- Input 0:                 [${combo.input0Amount}] ${reqToString(combo.input0Id, len)}\n`;
    string += `-- Input 1:                 [${combo.input1Amount}] ${reqToString(combo.input1Id, len)}\n`;
    string += `-- Output:                  [${combo.outputAmount}] ${reqToString(combo.outputId, len)}\n`;

    return string;
}

export const gameLeaderboardEntryToString = (
    entry: GameLeaderboardInfo,
    gameStart?: BN
) => {

    const name = `-- ${entry.name.substring(0, 3)}:${entry.player.toString().substring(0, 3)}:`;
    const time = `${entry.runPercent}% in ${BNToMin(entry.runPercentTimestamp.sub(gameStart ?? entry.runStart))}`
    return `${name}                 ${time}\n`;
}

export const playerToString = async (
    stProvider: STProvider,
    playerAccountKey: web3.PublicKey | PlayerAccount,
) => {
    const player = await getPlayerAccount(stProvider, playerAccountKey);

    let string = "\n";
    string += `---------- SOL-PLAYER --------------------\n`;
    string += `- Name:                    ${player.name} \n`;
    string += `- Player:                  ${player.player} \n`;
    string += `- Player Replay Vault:     ${player.playerReplayVault} \n`;
    string += `- Player Wrong Vault:      ${player.playerWrongAnswerVault} \n`;
    string += `- Player Account:          ${player.playerAccount}\n\n`;
    string += `\n---- STATE\n`;
    string += `- OG Percent:              ${player.ogPercent}%\n`;
    string += `- Is Speedrunning:         ${player.isSpeedrunning}\n\n`;
    string += `- Start:                   ${BNToDate(player.runStart)} \n`;
    string += `- Timestamp:               ${BNToDate(player.runPercentTimestamp)} \n`;
    string += `- Percent:                 ${player.runPercent}%\n\n`;
    string += `\n---- INVENTORY\n`;
    string += gameInventoryToString(player.inventory);
    string += `\n-------------------------------------\n\n`;

    return string;
}

export const gameInventoryToString = (
    inventory: GameInventoryItem[],
) => {

    let amount = `-  Amount:                 `;
    let minted = `-  Minted:                 `;
    for (let i = 0; i < inventory.length; i++) {
        amount += `${inventory[i].amount.toString().padEnd(3, " ")}`;
        minted += `${inventory[i].mintedCount.toString().padEnd(3, " ")}`;
    }
    return `${amount}\n${minted}\n`;
}

// --------- GAME TESTERS -----------------------------------------

export interface MinItemParams {
    name?: string,
    itemType?: GameItemType,
    mintTailSeed?: number,
    mintBytes?: number[],
    isReplayToken?: boolean,
    isWrongAnswerItem?: boolean,
    percentPerItem?: number,
    itemsPerMint?: number,
    maxItemsPerInventory?: number,
    costPerItem?: anchor.BN,
    amountToTx?: anchor.BN,
    amountToMake?: number,
  }
  export const createMinGameItem = (
    mint: web3.PublicKey,
    params: MinItemParams,
  ) => {
    return {
      mint: mint,
      params: {
        name: params.name ?? "Test Item",
        itemType: params.itemType ?? GameItemType.item,
        mintTailSeed: params.mintTailSeed ?? 0,
        mintBytes: params.mintBytes ?? NULL_MINT_BYTES,
        isReplayToken: params.isReplayToken ?? false,
        isWrongAnswerItem: params.isWrongAnswerItem ?? false,
        percentPerItem: params.percentPerItem ?? 0,
        itemsPerMint: params.itemsPerMint ?? 1,
        maxItemsPerInventory: params.maxItemsPerInventory ?? 1,
        costPerItem: params.costPerItem ?? new anchor.BN(0),
        amountToTx: params.amountToTx ?? new anchor.BN(params.amountToMake ?? 0),
      } as LoadItemsParams,
    };
  }
  
  export interface MinCombinationParams {
    name?: string,
    input0Amount?: number,
    input1Amount?: number,
    outputAmount?: number,
  }
  export const createMinCombination = (
    mintI0: web3.PublicKey,
    mintI1: web3.PublicKey,
    mintO: web3.PublicKey,
    params: MinCombinationParams,
  ) => {
    return {
      mintI0: mintI0,
      mintI1: mintI1,
      mintO: mintO,
      params: {
        name: params.name ?? "Test Combo",
        input0Amount: params.input0Amount ?? 1,
        input1Amount: params.input1Amount ?? 1,
        outputAmount: params.outputAmount ?? 1,
      } as LoadCombinationsParams
    }
  }

  export const createMinReq = (
    mint: web3.PublicKey,
    params: web3.PublicKey[]
  ) => {
    return {
        mint: mint,
        params: [
            ...params
        ]
    }
  }

  export interface MinStartParams {
    countdownTime?: number,
    gameTime?: number,
    cheaterTime?: number,
  }
  export const createMinStartStop = (
    playing: boolean,
    params: MinStartParams,
  ) => {
    return {
        playing: playing,
        countdownTime: new BN(params.countdownTime ?? 0),
        supernovaDate: DateToBN(Date.now() + (params.gameTime ?? (1000 * 60 * 30))),
        cheaterTime: new BN(params.cheaterTime ?? 0),
    } as StartStopCountdownParams;
  }

