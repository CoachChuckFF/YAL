import React from "react";
import * as STCurtains from "../views/curtains";
import * as STWorldSpace from "../models/space";
import { PezProvider } from "../controllers/pez";

export enum YALState {
    NotConnected = "Not Connected.",
    Connected = "Connected.",
}

export const DEFAULT_RPC = 'https://quiet-muddy-log.solana-mainnet.quiknode.pro/4fffdad3de6974646ada97e9a6941f6aa3c5fd8e/';

// TODO Change to Player State
export interface Store {
    pezProvider: [
        PezProvider,
        React.Dispatch<React.SetStateAction<PezProvider>>
    ],
    isLoading: [
        boolean,
        React.Dispatch<React.SetStateAction<boolean>>
    ],
    settingsVisable: [
        boolean,
        React.Dispatch<React.SetStateAction<boolean>>
    ],
    rpc: [
        string,
        React.Dispatch<React.SetStateAction<string>>
    ],
    curtains: [
        STCurtains.CurtainsInfo,
        ( 
            message: string, 
            clickToDismiss?: boolean,
            cb?: ()=>void 
        ) => void,
        React.Dispatch<React.SetStateAction<STCurtains.CurtainsInfo>>
    ],
    globalState: [
        YALState,
        React.Dispatch<React.SetStateAction<YALState>>
    ],
    loveCount: [
        number,
        React.Dispatch<React.SetStateAction<number>>
    ],
    logout: [() => void],
};

export const logoutOfStore = (store: Store) => {
    if( store.pezProvider[1] !== null) store.pezProvider[1](PezProvider.empty());
    if( store.isLoading[1] !== null) store.isLoading[1](false);
    if( store.settingsVisable[1] !== null) store.settingsVisable[1](false);
    if( store.rpc[1] !== null) store.rpc[1](DEFAULT_RPC);
    if( store.loveCount[1] !== null) store.loveCount[1](0);
    if( store.curtains[2] !== null) store.curtains[2](STCurtains.NULL_CURTAINS);
    if( store.globalState[1] !== null) store.globalState[1](YALState.NotConnected);
}

export const NULL_STORE: Store = {
    pezProvider: [null as any, (null as any)],
    isLoading: [false, (null as any)],
    settingsVisable: [false, (null as any)],
    rpc: [DEFAULT_RPC, (null as any)],
    curtains: [STCurtains.NULL_CURTAINS, (null as any), (null as any)],
    globalState: [YALState.NotConnected, (null as any)],
    loveCount: [0, (null as any)],
    logout: [(null as any)],
}

export const StoreContext = React.createContext<Store>(NULL_STORE)

export default function StoreProvider({ children }:any) {

    // Provider
    const [pezProvider, setTreasureProvider] = React.useState(PezProvider.empty());

    // Is Loading
    const [isLoading, setIsLoading] = React.useState(false);

    // Settings Visable
    const [settingsVisable, setSettingsVisable] = React.useState(false);

    // Is Loading
    const [rpc, setRpc] = React.useState(DEFAULT_RPC);

    // Curtains
    const [curtains, setCurtains] = React.useState(STCurtains.NULL_CURTAINS);
    const drawCurtains = ( message: string, clickToDismiss: boolean = false, cb?: ()=>void ) => {
        setCurtains({
            showing: true,
            clickToDismiss,
            message,
            cb,
        });
    }

    // Global State
    const [globalState, setGlobalState] = React.useState(YALState.NotConnected);

    // Love Count
    const [loveCount, setLoveCount] = React.useState(0);

    const store: Store = {
        pezProvider: [pezProvider, setTreasureProvider],
        isLoading: [isLoading, setIsLoading],
        settingsVisable: [settingsVisable, setSettingsVisable],
        rpc: [rpc, setRpc],
        curtains: [curtains, drawCurtains, setCurtains],
        globalState: [globalState, setGlobalState],
        loveCount: [loveCount, setLoveCount],
        logout: [()=>{logoutOfStore(store);}],
    };
  
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}