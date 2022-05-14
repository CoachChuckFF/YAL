import { NodeWallet } from "@metaplex/js";
import * as anchor from "@project-serum/anchor";
import * as helpers from "../index"

const secretArray = require('/Users/drkrueger/.config/solana/programs/pez.json');
const secret = new Uint8Array(secretArray);
const payerKeypair = anchor.web3.Keypair.fromSecretKey(secret);

const main = async () => {
    let ownerWallet = new NodeWallet(payerKeypair);
    const provider = helpers.getSolanaProvider(ownerWallet);
    anchor.setProvider(provider);

    console.log("🚀 Starting test...")


    console.log("Creating SFT...")
    let SFT = await helpers.createSFT(
        provider,
        helpers.TEST_SPL_URL,
        helpers.TEST_SPL_METADATA,
        new anchor.BN(100),
    );

    console.log("Updating SFT...")
    SFT = await helpers.updateSFT(
        provider,
        SFT.mint,
        helpers.TEST_SPL_METADATA,
        true,
    )

    console.log(
        await helpers.getMetadataAccount(provider, SFT.mint)
    );

    console.log("... to the moon! 🌑")
}

main();