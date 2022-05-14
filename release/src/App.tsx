import React from 'react';
import './App.css';
import StoreProvider, { StoreContext, YALState } from './controllers/store';
import { STThemeProvider } from './models/theme';
import { STCurtains } from './views/curtains';
import { PublicKey } from '@solana/web3.js';
import * as STSolana from './controllers/solana';


import { STHUD } from './views/hud';
import { STWorld } from './pages/world';
import { PezProvider, getPezDispenser, takePez, YAL_PEZ_ID } from './controllers/pez';

function Loop(){
  const {
    pezProvider: [pezProvider, setpezProvider],
    globalState: [globalState, setGlobalState],
    loveCount: [loveCount, setLoveCount],
    curtains: [curtains, drawCurtains],
    isLoading: [isLoading, setIsLoading],
  } = React.useContext(StoreContext);

  const connectWallet = (onlyIfTrusted?:boolean) => { 
    setIsLoading(true);
    STSolana.connectWallet(onlyIfTrusted).then(async (walletKey:PublicKey)=>{
      setpezProvider(await PezProvider.init(
        STSolana.getProvider()
      ))
    }).catch((error)=>{
      console.log("Connecting Wallet Error", error);
      setIsLoading(false);
    });
  };

  const mintHeart = () => {
    setIsLoading(true);

    takePez(
      pezProvider,
      YAL_PEZ_ID,
    ).then((pez)=>{
      drawCurtains(
        "Reminders in your wallet!",
      );
      setLoveCount(pez.candyTaken.toNumber());
      setIsLoading(false);
    }).catch((error)=>{
      drawCurtains(
        "Try Again!",
      );
      setIsLoading(false);
    })

  }

  // On Page Load
  React.useEffect(() => {
    const onLoad = async () => {

      // connectWallet(true);
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);


  // On Change
  // React.useEffect(() => {

  //   // BG_SOUND.set(playingMusic);

  // }, [playingMusic]);

  
  // On Login
  React.useEffect(() => {
    if ( pezProvider.valid ) {

      getPezDispenser(
        pezProvider,
        YAL_PEZ_ID,
        true,
      ).then((pez)=>{
        setLoveCount(pez.candyTaken.toNumber())
        setGlobalState(YALState.Connected);
        setIsLoading(false);
      }).catch((error)=>{
        setIsLoading(false);
        setGlobalState(YALState.NotConnected)
      });

    } else {
      setIsLoading(false);
      setGlobalState(YALState.NotConnected)
    }
  }, [pezProvider]);

  return (<>

    <STHUD 
        connect={connectWallet}
        mint={mintHeart}
    />
  </>);
}

function App() {
  return (
    <div className="App">
      <STThemeProvider>
        <StoreProvider>
          <Loop/>
          <STWorld />
          <STCurtains/>
        </StoreProvider>
      </STThemeProvider>
    </div>
  );
}

export default App;
