import * as React from "react";
import { 
    useGLTF, 
    Stars, 
} from "@react-three/drei";
import {
    Group,
    Vector3,
    PointLight,
} from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { STControls } from "../controllers/worldController";
import { preloadFont } from "troika-three-text";

import { StoreContext } from "../controllers/store";
import * as STS from "../models/space";
import * as STStore from "../controllers/store";

import { TextWoraround } from "../controllers/renderers";
import { ST_COLORS } from "../models/theme";

const PI = Math.PI;

// Builders -----------------
interface GLBParams {
    file: string,
    objRef: React.MutableRefObject<Group | undefined>,
    space: STS.STSpace,
    cb?: ()=>null
    url?: string,
    canHighlight?: boolean,
    highlightScaleFactor?: number,
}
function STGLBFile(props:any){
    const params = props.params as GLBParams;
    const { scene } = useGLTF(params.file);
    const scaleFactor = params.highlightScaleFactor ?? 1.1;

    const pointerOver = () => {
        if( params.canHighlight ) {
            if(params.objRef.current){
                params.objRef.current.scale.x *= scaleFactor;
                params.objRef.current.scale.y *= scaleFactor;
                params.objRef.current.scale.z *= scaleFactor;
            }
        }
    }

    const pointerOut = () => {
        if( params.canHighlight ) {
            if(params.objRef.current){
                params.objRef.current.scale.x *= 1/scaleFactor;
                params.objRef.current.scale.y *= 1/scaleFactor;
                params.objRef.current.scale.z *= 1/scaleFactor;
            }
        }
    }

    const handleClick = () => {
        if(params.url){
            window.open(params.url, '_blank');
        } else if(params.cb){
            params.cb();
        }
    }

    return (
        <React.Suspense fallback={null}>
            <primitive 
                object={ scene.clone() } 
                onClick={()=>{ handleClick() }} 
                onPointerOver={() => { pointerOver() }} 
                onPointerOut={() => { pointerOut() }} 
                ref={ params.objRef } 
                scale={ params.space.scale ?? 1.0 } 
                position={ params.space.pos.toArray() } 
                rotation={ params.space.rot.toArray() }
            />
        </React.Suspense>);
}


interface TextParams {
    text: string,
    objRef: React.MutableRefObject<any>,
    space: STS.STSpace,
    fontSize?: number, 
    maxWidth?: number,
    lineHeight?: number,
    letterspacing?: number,
    color?: string,
    anchorX?: string, //left, center, right
    anchorY?: string, //top, top-baseline, middle, bottom-baseline, bottom
}
function STText(props:any) {
    const params = props.params as TextParams;

    return (
            <TextWoraround
                objRef={ params.objRef }
                position={ params.space.pos.toArray() } 
                rotation={ params.space.rot.toArray() }
                fontSize={ params.fontSize ?? 0.34 }
                maxWidth={ params.maxWidth ?? 5 }
                lineHeight={ params.lineHeight ?? 1.55 }
                letterspacing={ params.letterspacing ?? 0 }
                color={ params.color ?? ST_COLORS.white }
                text={ params.text }
                anchorX={ params.anchorX }
                anchorY={ params.anchorY }
            />
    )
}

// GLB FILES ---------------
function Title(props:any) { 
    const ref = React.useRef<any>();

    useFrame(({ clock, camera }) => { 
        if(
            props.globalState === STStore.YALState.NotConnected
        ){
            if(ref.current){
                ref.current.position.copy( camera.position );
                ref.current.rotation.copy( camera.rotation );
                ref.current.updateMatrix();
                ref.current.translateZ(-3);
                ref.current.translateY( Math.sin(clock.getElapsedTime()) * 0.1);
            }
        }
    });

    return (
        <STText params={{
            text: "You are loved.",
            objRef: ref,
            space: STS.StartingCamera,
            anchorX: "center",
            anchorY: "middle",
        } as TextParams}/>
    );
}

function numberToShort(value:string) {
    const newValue = parseInt(value);
    let newValueString = newValue.toString();
    if (newValue >= 1000) {
        let suffixes = ["", "K", "M", "B","T"];
        let suffixNum = Math.floor( (""+value).length/3 );
        let shortValue = 0;
        let shortValueString = '';
        for (let precision = 3; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum != 0 ? (newValue / Math.pow(1000,suffixNum)) : parseInt(value)).toPrecision(precision));
            let dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 3) { break; }
        }
        if (shortValue % 1 != 0)  shortValueString = shortValue.toFixed(2);
        newValueString = shortValue+suffixes[suffixNum];
    }
    return newValueString;
}

function Heart(props:any) { 
    const heartRef = React.useRef<Group>();
    const youAreRef = React.useRef<any>();
    const lovedRef = React.useRef<any>();
    const remindersRef = React.useRef<any>();

    const getOffset = (isY?:boolean) => {
        return (isY ? 
            (Math.sin(Date.now() / 1000 / 2) * 0.13) : 
            (Math.sin(Date.now()/1000)) * 0.021);
    }  
    
    const getYRot = () => {
        return  Date.now()/5000
    }

    const getItemPos = (xOffset:number, yOffset:number, x:number, y:number, z:number, index?:number) => {
        let basePos = STS.NullSpace;
        return new Vector3(
            (basePos.pos.x) + xOffset + x,
            (basePos.pos.y + STS.EyeLevel * 1.1) + yOffset + y,
            (basePos.pos.z) + z,
        );
    }

    useFrame(() => {
        let xOffset = getOffset(false);
        let yOffset = getOffset(true);

        if(heartRef.current){
            const heartPos = getItemPos(xOffset, yOffset, 0,0,0);
            heartRef.current.position.x = heartPos.x;
            heartRef.current.position.y = heartPos.y;
            heartRef.current.position.z = heartPos.z;

            heartRef.current.rotation.y = getYRot();
        }

        if(youAreRef.current){
            const heartPos = getItemPos(xOffset, yOffset + 0.89, 0,0,0);
            youAreRef.current.position.x = heartPos.x;
            youAreRef.current.position.y = heartPos.y;
            youAreRef.current.position.z = heartPos.z;

            youAreRef.current.rotation.y = getYRot();
        }
        
        if(lovedRef.current){
            const heartPos = getItemPos(xOffset, yOffset - 1.15, 0,0,0);
            lovedRef.current.position.x = heartPos.x;
            lovedRef.current.position.y = heartPos.y;
            lovedRef.current.position.z = heartPos.z;

            lovedRef.current.rotation.y = getYRot();
        }

        if(remindersRef.current){
            const heartPos = getItemPos(xOffset, yOffset + 0.8, 0,0,0);
            remindersRef.current.position.x = heartPos.x;
            remindersRef.current.position.y = heartPos.y;
            remindersRef.current.position.z = heartPos.z;

            remindersRef.current.rotation.y = getYRot() + PI;
        }
    });

    return (
        <group>
            {/* <Timer bomb={props.bomb} opened={false} run={props.run} state={props.state} puzzleState={props.puzzleState}/> */}
            <STText params={{
                objRef: youAreRef,
                text: "You are",
                color: "#FFFFFF",
                fontSize: 0.89,
                space: {
                    ...STS.NullSpace,
                    rot: new Vector3(0, getYRot(), 0),
                    pos: getItemPos(getOffset(false), getOffset(true), 0.21, 0.8, 0.89, 3),
                    scale: 0.55
                }
            } as TextParams}/>
            <STText params={{
                objRef: lovedRef,
                text: "Loved.",
                color: "#FFFFFF",
                fontSize: 0.8,
                space: {
                    ...STS.NullSpace,
                    rot: new Vector3(0, getYRot(), 0),
                    pos: getItemPos(getOffset(false), getOffset(true), 0.21, 0.8, 0.89, 3),
                    scale: 0.55
                }
            } as TextParams}/>
            <STText params={{
                objRef: remindersRef,
                text: numberToShort(props.loveCount ?? 1234) + " Reminded",
                color: "#FFFFFF",
                fontSize: 0.55,
                space: {
                    ...STS.NullSpace,
                    rot: new Vector3(0, getYRot() + PI, 0),
                    pos: getItemPos(getOffset(false), getOffset(true), 0.21, 0.8, 0.89, 3),
                    scale: 0.55
                }
            } as TextParams}/>
            <STGLBFile 
                params={{
                    file: STS.HeartGLB,
                    objRef: heartRef,
                    space: {
                        ...STS.NullSpace,
                        rot: new Vector3(0, getYRot(), 0),
                        pos: getItemPos(getOffset(false), getOffset(true), 0.21, 0.8, 0.89, 3),
                        scale: 0.55
                    },
                } as GLBParams}
            />
        </group>
    );
}


function STController(props:any){
    const lightRef = React.useRef<PointLight>();
    const { camera, gl: { domElement },} = useThree();
    const [controller, setController] = React.useState<STControls | null>(null);
    const [tick, setTick] = React.useState<number>(0);

    const [lastGlobalState, setLastGlobalState] = React.useState<STStore.YALState>(STStore.YALState.NotConnected);
    const [lastTargetPos, setLastTargetPos] = React.useState<Vector3>(STS.MainCamera.pos);

    // Init
    React.useEffect(() => {
        const controller = new STControls(camera, domElement, STS.MainCamera.pos.toArray());

        camera.lookAt(STS.MainCamera.pos);
        setController(controller);
        setTick(Date.now());

    }, []);

    useFrame(({ camera, clock }) => { 

        if(controller && lightRef.current){

            if(lastGlobalState !== props.globalState){
                setLastGlobalState( props.globalState );
                setTick(Date.now());
                return;
            }

            // Get Target Position
            let targetPos = STS.MainCamera.pos;

            if(!STS.vectorsMatch(lastTargetPos, targetPos)){
                controller.target = targetPos.clone();
                controller.update();
                setLastTargetPos(targetPos);
                setTick(Date.now());
                return;
            }

            let distance = targetPos.distanceTo(camera.position);
            let tock = Math.min(((Date.now() - tick) / STS.zoomInTime), 1.0);

            // Update Light
            lightRef.current.position.copy(camera.position);
            lightRef.current.intensity = Math.min(Math.sqrt(distance) + 0.05, 0.5);
            lightRef.current.updateMatrix();

            // Auto Rotate
            controller.autoRotate = false;


            // Move Camera
            switch(props.globalState){
                case STStore.YALState.NotConnected: 
                    controller.autoRotate = true;
                    if(distance < STS.superNovaDistance - 5){
                        camera.position.setZ(STS.lerpToNumber(
                            camera.position.z,
                            STS.superNovaDistance,
                            tock,
                        ));
                    }
                    break;
                case STStore.YALState.Connected: 
                    if(distance > 5){
                        STS.lerpToVector(
                            camera.position,
                            camera.position,
                            targetPos,
                            tock
                        );
                    }
                break;
            }


            if(controller.autoRotate){
                controller.update();
            }

        }
    });

    return <React.Suspense fallback={null}><pointLight ref={lightRef} intensity={0.1}/></React.Suspense>;
}

export function STWorld() {
    const [assetsLoaded, setAssetsLoaded] = React.useState(false);

    const {
        globalState: [globalState],
        loveCount: [loveCount]
    } = React.useContext(StoreContext);


    React.useEffect(() => {
        preloadFont({
            font: STS.VimlandFont,
            characters: 'abcdefghijklmnopqrstuvwxyz'
        }, ()=> {
            setAssetsLoaded(true);
        })
    }, []);

    if(!assetsLoaded) return null;

    return (
        <div className="scene-container">
            <Canvas 
                dpr={window.devicePixelRatio} 
                camera={{position: STS.StartingCamera.pos.toArray(), rotation: STS.StartingCamera.rot.toArray(), fov: STS.Fov}}
            >
                <React.Suspense fallback={null}>
                    <Title 
                        globalState={globalState}
                    />
                    <Stars
                        radius={100} // Radius of the inner sphere (default=100)
                        depth={100} // Depth of area where stars should fit (default=50)
                        count={5000} // Amount of stars (default=5000)
                        factor={10} // Size factor (default=4)
                        saturation={0.55} // Saturation 0-1 (default=0)
                        fade={true} // Faded dots (default=false)
                    />
                    <Heart loveCount={loveCount}/>
                    <EffectComposer multisampling={8} autoClear={false}>
                        <Bloom intensity={0.21} luminanceThreshold={0.08} luminanceSmoothing={0} />
                    </EffectComposer>
                </React.Suspense>
                <STController 
                    globalState={globalState}
                />
            </Canvas>
        </div>
    );
}