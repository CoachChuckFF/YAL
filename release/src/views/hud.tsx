import * as React from 'react';
import * as STS from '../models/space'
import { StoreContext, YALState } from '../controllers/store';

import Button from '@mui/material/Button';
import './../App.css' 

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

// Icons
import { PuzzleIcon, WalletIcon, ChestIcon, KeyIcon, LogoutIcon, TerminalIcon, ForgeIcon, BreakIcon, SpeedrunIcon, RefreshIcon, HeartIcon } from './icons';
import { ST_COLORS, ST_THEME_COLORS } from '../models/theme';

export default function TestButton(props:any) {
    return (
      <Button onClick={props.onClick} variant="contained">{props.children}</Button>
    );
}

function TheButton(props:any) {
    let handleClick = props.handleClick as ()=>null;
    let isLoading = props.isLoading as boolean;
    let state = props.state as HUDState;

    let themeColor = state.themeColor ?? ST_THEME_COLORS.enabled;
    let textColor = state.textColor ?? ST_COLORS.enabledTextColor;

    let cb = () => {
        if(!isLoading){
            handleClick();
        }
    }

    if(!state.enabled || isLoading){
        themeColor = ST_THEME_COLORS.disabled;
        textColor = ST_COLORS.disabledTextColor;
    }

    if(state.overrideThemeColor && !isLoading){
        themeColor = state.overrideThemeColor;
    }

    if(state.overrideTextColor){
        textColor = state.overrideTextColor;
    }

    let iconDiv = (<div  className={isLoading ? 'icon-spin' : ''}>{state.icon}</div>);

    return (
        <Button
            color={themeColor as any}
            onClick={cb}
            startIcon={iconDiv}
            variant="contained"
            sx={{
                width: '100%',
                height: '5vh',
                margin: 0,
                color: textColor,
            }}
            disableElevation
        >{state.text}</Button>
    );
}


function PuzzleButton(props:any) {
    let handleClick = props.handleClick as ()=>null;
    let isLoading = props.isLoading as boolean;
    let state = props.state as HUDState;

    let cb = () => {
        if(!isLoading){
            handleClick();
        }
    }

    return (
        <Button
            color={state.puzzleThemeColor as any}
            onClick={cb}
            // startIcon={icon}
            variant="contained"
            sx={{
                width: '100%',
                height: '5vh',
                margin: 0,
            }}
            disableElevation
        >  
            <div style={{
                color: state.puzzleIconColor,
                fontSize: "1.3rem",
            }} >
                {state.puzzleIcon}
            </div>
        </Button>
    );
}

export function HudControls(props: any) {
    const buttonsRef = props.buttonsRef;
    const hudState = props.hudState as HUDState;
    const isLoading = props.isLoading as boolean;
    const handleLogout = props.handleLogout as ()=>null;
    const handleMint = props.handleMint as ()=>null;
    return (
        <div className="hub-controls">
            <div className='puzzle-controls'>
                <div className="puzzle-controls">
                    <Box component="div" className="puzzle-control-row"></Box>
                    <Box component="div" ref={buttonsRef} className="puzzle-control-row">
                        <Grid container spacing={2}>
                            <Grid item xs={9}>
                                <TheButton handleClick={handleMint} isLoading={isLoading} state={hudState}/>
                            </Grid>
                            <Grid item xs={3}>
                                <PuzzleButton handleClick={handleLogout} state={hudState}/>
                            </Grid>
                        </Grid>
                    </Box>
                </div>
            </div>
        </div>
    );
}

function OneButtonHUD(props: any) {
    const buttonsRef = props.buttonsRef;
    const hudState = props.hudState as HUDState;
    const isLoading = props.isLoading as boolean;
    const handleConnect = props.handleConnect as ()=>null;
    return (
        <div className="hub-controls">
            <div className='puzzle-controls'>
                <div className="puzzle-controls">
                    <Box component="div" className="puzzle-control-row"></Box>
                    <Box component="div" ref={buttonsRef} className="puzzle-control-row">
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TheButton handleClick={handleConnect} isLoading={isLoading} state={hudState}/>
                            </Grid>
                        </Grid>
                    </Box>
                </div>
            </div>
        </div>
    );
}

export interface HUDState {
    enabled: boolean,
    icon: JSX.Element,
    puzzleIcon: JSX.Element,
    text: string,
    puzzleIconColor: ST_COLORS,
    puzzleThemeColor: ST_THEME_COLORS,
    themeColor?: ST_THEME_COLORS,
    textColor?: ST_COLORS,
    overrideThemeColor?: ST_THEME_COLORS,
    overrideTextColor?: ST_COLORS,
    showingOnStart?: boolean,
}
export const CONNECT_STATE: HUDState = {
    enabled: true,
    icon: (<WalletIcon />),
    puzzleIcon: (<PuzzleIcon />),
    text: "Connect Wallet",
    puzzleThemeColor: ST_THEME_COLORS.disabled,
    puzzleIconColor: ST_COLORS.enabledTextColor,
    overrideThemeColor: ST_THEME_COLORS.disabled,
    showingOnStart: false,
} 
export const MINT_STATE: HUDState = {
    enabled: true,
    icon: (<HeartIcon />),
    puzzleIcon: (<LogoutIcon />),
    text: "Mint A Reminder",
    puzzleThemeColor: ST_THEME_COLORS.disabled,
    puzzleIconColor: ST_COLORS.enabledTextColor,
    overrideThemeColor: ST_THEME_COLORS.disabled,
    showingOnStart: false,
} 


export function STHUD(props: any) {
    const buttonsRef = React.useRef<HTMLDivElement>(null);

    const {
        isLoading: [isLoading],
        globalState: [globalState],
        logout: [logout],
    } = React.useContext(StoreContext)

    const connect = () => { props.connect(); }
    const mint = () =>    { props.mint(); }

    if( globalState === YALState.Connected ){
        return <HudControls 
            buttonsRef={buttonsRef}
            hudState={MINT_STATE}
            isLoading={isLoading}
            handleMint={mint}
            handleLogout={logout}
        />
    }

    return <OneButtonHUD 
        isLoading={isLoading} 
        hudState={CONNECT_STATE}
        buttonsRef={buttonsRef}
        handleConnect={connect}
    />;
}



