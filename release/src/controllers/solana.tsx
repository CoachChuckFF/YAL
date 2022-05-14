import * as anchor from '@project-serum/anchor';
import { web3 } from "@project-serum/anchor";

export const connectWallet = (onlyIfTrusted?: boolean) => {
    return new Promise<anchor.web3.PublicKey>(async (resolve, reject) => {
        try {
            const { solana } = window as any;
            if (solana) {
                if (solana.isPhantom) {
                    try {
                        solana.connect({ onlyIfTrusted: onlyIfTrusted }).then((result:any)=>{
                            resolve(new anchor.web3.PublicKey(result.publicKey.toString()));
                        }).catch((error:any)=>{
                            reject(`Error ${error}`);
                        })
                    } catch (error) {
                        reject(`Error re-connecting to phantom. ${error}`);
                    }
                }
            } else {
                reject('Solana object not found! Get a Phantom Wallet 👻');
            }
        } catch (error) {
            reject(error);
        }
    });
};


export const getProvider = () => {
    const opts = anchor.Provider.defaultOptions()
    const provider = new anchor.Provider(
      new anchor.web3.Connection(
        web3.clusterApiUrl('mainnet-beta'), 
        opts.preflightCommitment
    ),
      getSolanaWallet(),
      opts,
    );

    return provider;
}

export const getSolanaWallet = () => {
    const { solana } = window as any;
    return solana;
}
