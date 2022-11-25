import { Button, Stack, TextField } from '@mui/material';
import * as React from 'react';
import { StoreContext } from '../controllers/store';
import { ST_THEME_COLORS } from '../models/theme';
import './../App.css' 
import TestButton from './hud';
import { TerminalIcon } from './icons';

export function SettingsView() {
    const {
        settingsVisable: [settingsVisable, setSettingsVisable],
        rpc: [rpc, setRpc],
      } = React.useContext(StoreContext);

    const [rpcValue, setRpcValue] = React.useState<string>(rpc)

    React.useEffect(()=>{
        setRpcValue(rpc);
    }, [settingsVisable, rpc])

    const onChange = (e: any)=>{
        setRpcValue(e.text)
    }

    const onFinish = () => {
        setRpc(rpcValue
            )
            setSettingsVisable(false)
    }

    const renderForm = ()=>{
        if(!settingsVisable) return null;

        return <div style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100vh',
            backgroundColor: '#000000',
            // opacity: '0.88',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
        }}>

            <TextField sx={{width: '34%',}} id="outlined-basic" label="RPC Server" variant="outlined" value={rpcValue} onChange={onChange}/>
            <div style={{width: '100%', height: '10px'}}/>
            <Button
            onClick={onFinish}
            startIcon={TerminalIcon()}
            variant="contained"
            color={ST_THEME_COLORS.enabled as any}
            sx={{
                width: '34%',
                height: '5vh',
                margin: 0,
                color: 'white'
            }}
            disableElevation
        >Set RPC</Button>
        <p style={{
            color: '#ABABAB'
        }}>Questions? Hit up <a href='https://twitter.com/CoachChuckFF'>@CoachChuckFF</a> on twitter</p>
        </div>
    }

    const renderButton = ()=>{
        return <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 45
        }}>
        <Button
            onClick={()=>{setSettingsVisable(!settingsVisable)}}
            startIcon={TerminalIcon()}
            variant="contained"
            color={ST_THEME_COLORS.disabled as any}
            sx={{
                width: '100%',
                height: '5vh',
                margin: 0,
                color: '#ABABAB'
            }}
            disableElevation
        >Settings</Button>
        </div>;
    }


    return <div
        style={{
            zIndex: 40
        }}
    >
        {renderButton()}
        {renderForm()}
    </div>

}
