import * as ST from "./sol-treasure";
import * as helpers from "@coach-chuck/solana-helpers"
import { web3, BN } from "@project-serum/anchor";

const _MS_PER_SEC = 1000;
const _SEC_PER_MIN = 60;
const _MIN_PER_HR = 60;
const _HR_PER_DAY = 24;
const _MS_PER_MIN = (_MS_PER_SEC * _SEC_PER_MIN);
const _MS_PER_DAY = (_MS_PER_MIN * _MIN_PER_HR * _HR_PER_DAY);

const sol = (sol:number) => {
    return new BN(Math.floor(sol * web3.LAMPORTS_PER_SOL));
}

export const GAME_KEY = new web3.PublicKey('FABt9886NbLDkfJReCNw4EicD2zPoYVC25jkmMyGXvUP');

export const GAME_SETTINGS = {
    countdownTime: _MS_PER_MIN * 3, //3 Min
    gameTime: _MS_PER_DAY * 14,     // Days
    cheaterTime: _MS_PER_MIN * 10,  //10 min
    leaderboardCount: 10,
}

export const INDEXES = {
    blueKey: 0,
    greenKey: 1,
    purpleKey: 2,
    whiteKey: 3,
    brokenKey: 4,
    blackKey: 5,
    blackChest: 6,
    whiteChest: 7,
    replayToken: 8,
    realTreasure: 9,
    redHerring: 10,
}

export const CODES = {
    noot: {mintTailSeed: 7, mintBytes: [5, 6, 7, 8]},
    dronie: {mintTailSeed: 5, mintBytes: [0, 1, 2, 3]},
    desolates: {mintTailSeed: 8, mintBytes: [0xF, 0x5, 0x3, (0xF + 0x5 + 0x3)]},
    fractals: {mintTailSeed: 3, mintBytes: [0xA, 0xB, 0xC, 0xD]},
}

export const ITEMS = {
    blueKey: ST.createMinGameItem(
        new web3.PublicKey("27zp1EbjTnzL6vFckoTXKng54piUyr77pTKUR2ktT9Qb"),
        {
            name: "Blue Key",
            ...CODES.noot,
            percentPerItem: 22,
            amountToMake: 100_000,
            costPerItem: sol(0.05),
        }
    ),
    greenKey: ST.createMinGameItem(
        new web3.PublicKey("JCcLJCKxuvwTeKCzAweaDuXwUqaRBtWi6BJuBCi21MtF"),
        {
            name: "Green Key",
            ...CODES.dronie,
            percentPerItem: 42,
            amountToMake: 100_000,
            costPerItem: sol(0.05),
        }
    ),
    purpleKey: ST.createMinGameItem(
        new web3.PublicKey("2cpDi9tK6txAH83hhF9wMr7WqdJByHegjbh4PxFVknyv"),
        {
            name: "Purple Key",
            ...CODES.desolates,
            percentPerItem: 32,
            amountToMake: 100_000,
            costPerItem: sol(0.05),
        }
    ),
    whiteKey: ST.createMinGameItem(
        new web3.PublicKey("5X82vXfWg4RWy9RymE2BbVBNxuhCSoqoVh9TtXfx51L2"),
        {
            name: "White Key",
            ...CODES.fractals,
            percentPerItem: 1,
            amountToMake: 100_000,
            costPerItem: sol(0.05),
        }
    ),
    brokenKey: ST.createMinGameItem(
        new web3.PublicKey("BqToRRuffJa1nhy2ozy5L9BaqaTVCgq47S9w28Md6HYs"),
        {
            name: "Broken Key",
            percentPerItem: 0,
            amountToMake: 100_000,
            isWrongAnswerItem: true,
            maxItemsPerInventory: 2,
            costPerItem: sol(0.025),
        }
    ),
    blackKey: ST.createMinGameItem(
        new web3.PublicKey("8vn6D45BqpxHYbu5QPbKypUztvrA9YERsBda5Hbox2Lt"),
        {
            name: "Black Key",
            percentPerItem: 1,
            amountToMake: 100_000,
            itemType: ST.GameItemType.comb,
        }
    ),
    blackChest: ST.createMinGameItem(
        new web3.PublicKey("HkNhhakjJNoewms2e2yES3DRFpGDQ9C4cDoA3LwryJGi"),
        {
            name: "Black Chest",
            percentPerItem: 3,
            amountToMake: 100_000,
            itemType: ST.GameItemType.reward,
        }
    ),
    whiteChest: ST.createMinGameItem(
        new web3.PublicKey("ALVHiPAbFibDdFGxUwogvqMKa5FoRkSFipAyDqmU7NS8"),
        {
            name: "White Chest",
            percentPerItem: 1,
            amountToMake: 100_000,
            itemType: ST.GameItemType.reward,
        }
    ),
    replayToken: ST.createMinGameItem(
        new web3.PublicKey("H1FAJcnpuWQQmbvqecyAgFZnC8daP27ALKyvAkgebYzh"),
        {
            name: "Replay Token",
            percentPerItem: 0,
            amountToMake: 100_000,
            isReplayToken: true,
            itemType: ST.GameItemType.reward,
        }
    ),
    realTreasure: ST.createMinGameItem(
        new web3.PublicKey("BcKDpADLTnHoeNgAXxyKdWmMkd4iTxyA4XV4kYVqeWqh"),
        {
            name: "Real Treasure",
            percentPerItem: 0,
            amountToMake: 100_000,
            itemType: ST.GameItemType.reward,
        }
    ),
    redHerring: ST.createMinGameItem(
        new web3.PublicKey("8p7H4N3gvbSo7UKZbA3kvA82vTzbSnuhVuJMNyaASqD9"),
        {
            name: "Red Herring",
            percentPerItem: 1,
            amountToMake: 100,
            itemType: ST.GameItemType.reward,
        }
    ),
}

export const COMBINATIONS = {
    blackKey: ST.createMinCombination(
        ITEMS.brokenKey.mint,
        ITEMS.blackKey.mint,
        ITEMS.blackKey.mint,
        {
            name: "Forge Key",
        }
    )
}

export const REQUIREMENTS= {
    blackChest: ST.createMinReq(
        ITEMS.blackChest.mint,
        [
            ITEMS.blueKey.mint,
            ITEMS.greenKey.mint,
            ITEMS.purpleKey.mint,
        ]
    ),
    replayToken: ST.createMinReq(
        ITEMS.replayToken.mint,
        [
            ITEMS.blueKey.mint,
            ITEMS.greenKey.mint,
            ITEMS.purpleKey.mint,
        ]
    ),
    whiteChest: ST.createMinReq(
        ITEMS.whiteChest.mint,
        [
            ITEMS.blueKey.mint,
            ITEMS.greenKey.mint,
            ITEMS.purpleKey.mint,
            ITEMS.blackKey.mint,
            ITEMS.whiteKey.mint,
        ]
    ),
    realTreasure: ST.createMinReq(
        ITEMS.realTreasure.mint,
        [
            ITEMS.blueKey.mint,
            ITEMS.greenKey.mint,
            ITEMS.purpleKey.mint,
            ITEMS.blackKey.mint,
            ITEMS.whiteKey.mint,
        ]
    ),
    redHerring: ST.createMinReq(
        ITEMS.redHerring.mint,
        [
            ITEMS.realTreasure.mint,
        ]
    ),
}

export const createTheGame = async (
    stProvider: ST.STProvider,
    gameKeypair: web3.Keypair,
    createTokens: boolean = false
) => {
    let items = Object.assign({}, ITEMS);
    let combinations = Object.assign({}, COMBINATIONS);
    let requirements = Object.assign({}, REQUIREMENTS);

    // ---------------------- CREATE TOKENS ----------------------------------
    if(createTokens) {
        console.log("Creating Items...");
        for (const [key, value] of Object.entries(items)) {
            console.log(`--- ${key}`);
            if(value.params.amountToTx.toNumber() !== 0) {
                value.mint = (await helpers.createSPL(
                    stProvider.provider,
                    value.params.amountToTx.toNumber(),
                )).mint;
            }
        }

        combinations.blackKey = {
            mintI0: items.brokenKey.mint,
            mintI1: items.brokenKey.mint,
            mintO: items.blackKey.mint,
            params: Object.assign({}, combinations.blackKey.params)
        }

        requirements.blackChest = {
            mint: items.blackChest.mint,
            params: [items.blueKey.mint, items.greenKey.mint, items.purpleKey.mint, ],
        }

        requirements.replayToken = {
            mint: items.replayToken.mint,
            params: [items.blueKey.mint, items.greenKey.mint, items.purpleKey.mint, ],
        }

        requirements.whiteChest = {
            mint: items.whiteChest.mint,
            params: [items.blueKey.mint, items.greenKey.mint, items.purpleKey.mint, items.whiteKey.mint, items.blackKey.mint,],
        }

        requirements.realTreasure = {
            mint: items.realTreasure.mint,
            params: [items.blueKey.mint, items.greenKey.mint, items.purpleKey.mint, items.whiteKey.mint, items.blackKey.mint,],
        }

        requirements.redHerring = {
            mint: items.redHerring.mint,
            params: [items.realTreasure.mint],
        }
    }

    // ---------------------- CREATE GAME ----------------------------------
    console.log("Creating Game...");
    let game = await ST.createGame(
      stProvider,
      {
        name: "Sol-Treasure V0",
        itemCount: Object.keys(items).length,
        combinationCount: Object.keys(combinations).length,
        leaderboardCount: 10,
      },
      gameKeypair,
    )

    // ---------------------- LOAD ITEMS ----------------------------------
    console.log("Loading Items...");
    for (const [key, value] of Object.entries(items)) {
        if(value.mint.equals(ITEMS.redHerring.mint)){
            console.log("--- " + key);
            game = await ST.loadItem(
              stProvider,
              game,
              value.mint,
              value.params,
            )
        }
    }


    // ---------------------- LOAD COMBOS ----------------------------------
    console.log("Loading Combos...");
    for (const [key, value] of Object.entries(combinations)) {
      console.log("--- " + key);
      game = await ST.loadCombination(
        stProvider,
        game,
        value.mintI0,
        value.mintI1,
        value.mintO,
        value.params,
      )
    }


    // ---------------------- LOAD REQUIREMENTS ----------------------------------
    console.log("Loading Requirements...");
    for (const [key, value] of Object.entries(requirements)) {
      console.log("--- " + key);
      game = await ST.loadRequirements(
        stProvider,
        game,
        value.mint,
        await ST.createLoadRequirementParams(stProvider, game, value.params),
      )
    }

    console.log("Locked and loaded");
    
    return await ST.getGameAccount(
        stProvider,
        game.game,
        true
    );
}

export const startGame = async(
    stProvider: ST.STProvider,
    gameKey: web3.PublicKey | ST.GameAccount,
) => {
    return ST.startStopCountdown(
        stProvider,
        gameKey,
        ST.createMinStartStop(
            true,
            {
                countdownTime: GAME_SETTINGS.countdownTime,
                gameTime: GAME_SETTINGS.gameTime,
                cheaterTime: GAME_SETTINGS.cheaterTime,
            }
        )
    )
}
