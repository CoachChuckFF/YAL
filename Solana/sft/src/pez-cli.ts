import * as anchor from "@project-serum/anchor";
import * as helpers from "@coach-chuck/solana-helpers";
import * as pez from "./pez"
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { BN } from "@project-serum/anchor";

const secretArray = require('/Users/drkrueger/.config/solana/programs/yal.json');
const secret = new Uint8Array(secretArray);
const payerKeypair = anchor.web3.Keypair.fromSecretKey(secret);

const MINT = new anchor.web3.PublicKey("A5nzFjvzTs6AitRyFdX6u4wUyJL6tYRXfMiQhsuuwPyb");

const main = async() => {
    console.log("🚀 Starting test...")
  
    const opts = anchor.Provider.defaultOptions()
    const provider = new anchor.Provider(
      new anchor.web3.Connection(anchor.web3.clusterApiUrl('mainnet-beta'), opts.preflightCommitment),
      new NodeWallet(payerKeypair),
      opts,
    )
    anchor.setProvider(provider);
    
    // console.log("Creating SFT...");
    // let sft = await helpers.createSPL(
    //   provider,
    //   1000000
    // );
  
  
    console.log("Creating provider...");
    let pezProvider = await pez.PezProvider.init(provider);

    let sft = await helpers.getSPLAccount(
        pezProvider.provider,
        MINT,
        await helpers.getAssociatedTokenAddress(
            MINT,
            provider.wallet.publicKey,
        )
    )

    let keypair = anchor.web3.Keypair.generate();
  
    console.log("Calling create...");
    let pezDispenser = await pez.createPezDispenser(
        pezProvider,
        sft,
        keypair,
        sft.amount,
        "YAL",
        new BN(3*1_000_000),
        new BN(3),
    );
  
    console.log(pezDispenser);
    console.log(keypair.publicKey.toString());
  
    // console.log("Updating Pez...");
    // pezDispenser = await pez.updatePezDispenser(
    //     pezProvider,
    //     pezDispenser,
    //     "Tod",
    //     new anchor.BN(0),
    //     new anchor.BN(0),
    // );
    // console.log(pezDispenser);

    // console.log("Loading Pez...");
    // pezDispenser = await pez.loadPezDispenser(
    //     pezProvider,
    //     pezDispenser,
    //     new anchor.BN(500),
    // );
    // console.log(pezDispenser);


    // console.log("Emptying Pez...");
    // pezDispenser = await pez.emptyPezDispenser(
    //     pezProvider,
    //     pezDispenser,
    //     new anchor.BN(100),
    // );
    // console.log(pezDispenser);

    // let pezCandy = await pez.getPezCandyAccount(
    //     pezProvider,
    //     pezDispenser,
    // );

    // let ownerCandy = await pez.getOwnerCandyAccount(
    //     pezProvider,
    //     pezDispenser,
    // );

    // console.log("Pez: " + pezCandy.amount.toNumber());
    // console.log("Owner: " + ownerCandy.amount.toNumber());

    // console.log("Loading the rest");
    // pezDispenser = await pez.loadPezDispenser(
    //     pezProvider,
    //     pezDispenser,
    // );
    // console.log(pezDispenser);

    // console.log("Taking Pez...");
    // pezDispenser = await pez.takePez(
    //     pezProvider,
    //     pezDispenser,
    // );
    // console.log(pezDispenser);

    // pezCandy = await pez.getPezCandyAccount(
    //     pezProvider,
    //     pezDispenser,
    // );

    // ownerCandy = await pez.getOwnerCandyAccount(
    //     pezProvider,
    //     pezDispenser,
    // );

    // console.log("Pez: " + pezCandy.amount.toNumber());
    // console.log("Owner: " + ownerCandy.amount.toNumber());
  
    console.log("... to the moon! 🌑")
  }
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
  
  runMain();


