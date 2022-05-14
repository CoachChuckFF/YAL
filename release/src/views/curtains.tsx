import { Stack } from '@mui/material';
import * as React from 'react';
import { StoreContext } from '../controllers/store';
import './../App.css' 
import TestButton from './hud';

export interface CurtainsInfo {
    showing: boolean,
    clickToDismiss: boolean,
    message: string,
    cb?: () => void,
};

export const NULL_CURTAINS: CurtainsInfo = {
    showing: false,
    clickToDismiss: false,
    message: "",
};

export function TestCurtains() {
    const [ count, setCount ] = React.useState(0);
    const {
        curtains: [state, drawCurtains],
    } = React.useContext(StoreContext)

    const sceneChange = () => {
        setCount(count + 1);

        drawCurtains(
            count.toString(),
            false,
            () => {console.log("test curtains done")}
        );
    };

    return (
        <Stack direction="row" spacing={2}>
            <TestButton onClick={sceneChange}>And scene!</TestButton>
        </Stack>
    );
}

export function STCurtains() {
    const ref = React.useRef<HTMLDivElement>(null);
    const {
        curtains: [state, drawCurtains, setCurtains],
    } = React.useContext(StoreContext)


    React.useEffect(() => {
        if( state.showing ){
            if( ref.current ){
                ref.current.className = "scene-change";
            }
                setTimeout(()=>{
                    if( state.cb ) state.cb();
                }, 999);
                setTimeout(()=>{
                    setCurtains(NULL_CURTAINS);
                }, 1999);
        } else {
            if( ref.current ){
                ref.current.className = "scene-overlay";
            }
        }

        return () => {}; //On Unmount
    }, [state.showing]);

    if(!state.showing) return null;
    return (
        <div ref={ref} className="scene-overlay" >
            <div className="message">
                {state.message}
            </div>
        </div>
    );
}
