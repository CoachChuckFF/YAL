import { Camera, Vector3 } from 'three';
import { lerp } from 'three/src/math/MathUtils';

// MODELS -----------------
// export const BlueKeyGLB = "models/sol/blue_key.glb";
// export const HeartGLB = "models/heart.glb";
export const HeartGLB = "https://shdw-drive.genesysgo.net/6P6WznKbJ2nEMCfrXZDQvipCgCSx45SXxjWMWvqfPtyJ/yal_model.glb";


export const VimlandFont = 'https://shdw-drive.genesysgo.net/6P6WznKbJ2nEMCfrXZDQvipCgCSx45SXxjWMWvqfPtyJ/yal_font_vimland.woff';
export const VimlandChars = 'abcdefghijklmnopqrstuvwxyz';

// MATHS ------------------
const PI = Math.PI;
const TRI = Math.sqrt(3)/2;

const HubRadius = 5.5;
const HexTheta = (2*PI/6);
const Thirty = HexTheta / 2;
const HubZ = Math.sin(Thirty) * (TRI * HubRadius)
const HubX = Math.cos(Thirty) * (TRI * HubRadius)

// GLOBALS -----------------
export const SupernovaStart = 5;
export const SupernovaMinScale = 0.01;
export const SupernovaMaxScale = 400;
export const SupernovaDuration = 60;

export const EyeLevel = 1.21;

//Lights
export const PointLightIntensity = 0.11;
export const PointLightHeight = EyeLevel + 3;
export const PointLightDistanceBehind = 0.8;

//Camera
export const Fov = 60;

//Scales
export const scaleChest = 0.5;
export const scaleLock = 0.55;
export const scaleMiniLock = 0.13;
export const keyScale = 0.013;

//Times
export const zoomInTime = 5000;
export const cheaterTime = 1000 * 60 * 10;

//Distances
export const superNovaDistance = 888

// Spaces
export const MainArea = new Vector3(0, 0, 0);
export const SecretArea = new Vector3(0x13, 0x34, 0x55);
export const GalleryArea = new Vector3(0x00, 0x00, superNovaDistance + 0x55);
export const CameraOffset = new Vector3(0, EyeLevel, 0);

export const NullSpace: STSpace = {pos: MainArea.clone(), rot: MainArea.clone()};

export const StartingCamera: STSpace = {pos: new Vector3(0, EyeLevel, superNovaDistance), rot: new Vector3(0, 0, 0)};
export const MainCamera: STSpace = {pos: new Vector3(0, EyeLevel, 0).add(MainArea), rot: new Vector3(0, 0, 0) };
export const SecretCamera: STSpace = {pos: new Vector3(0, EyeLevel, 0).add(SecretArea), rot: new Vector3(0, 0, 0) };
export const GalleryCamera: STSpace = {pos: new Vector3(0, EyeLevel, 0).add(GalleryArea), rot: new Vector3(0, 0, 0) };

export const HubIndex0: STSpace = {pos: new Vector3(0, 0, -HubRadius), rot: new Vector3(0, 0, 0) };
export const HubIndex1: STSpace = {pos: new Vector3(HubX, 0, -HubZ), rot: new Vector3(0, -(HexTheta * 1), 0),};
export const HubIndex2: STSpace = {pos: new Vector3(HubX, 0, HubZ), rot: new Vector3(0, -(HexTheta * 2), 0),};
export const HubIndex3: STSpace = {pos: new Vector3(0, 0, HubRadius), rot: new Vector3(0, -(HexTheta * 3), 0),};
export const HubIndex4: STSpace = {pos: new Vector3(-HubX, 0, HubZ), rot: new Vector3(0, -(HexTheta * 4), 0),};
export const HubIndex5: STSpace = {pos: new Vector3(-HubX, 0, -HubZ), rot: new Vector3(0, -(HexTheta * 5), 0),};

export const SHubIndex0: STSpace = {pos: (HubIndex0.pos.clone()).add(SecretArea), rot: HubIndex0.rot};
export const SHubIndex1: STSpace = {pos: (HubIndex1.pos.clone()).add(SecretArea), rot: HubIndex1.rot};
export const SHubIndex2: STSpace = {pos: (HubIndex2.pos.clone()).add(SecretArea), rot: HubIndex2.rot};
export const SHubIndex3: STSpace = {pos: (HubIndex3.pos.clone()).add(SecretArea), rot: HubIndex3.rot};
export const SHubIndex4: STSpace = {pos: (HubIndex4.pos.clone()).add(SecretArea), rot: HubIndex4.rot};
export const SHubIndex5: STSpace = {pos: (HubIndex5.pos.clone()).add(SecretArea), rot: HubIndex5.rot};

export const GHubIndex0: STSpace = {pos: (HubIndex0.pos.clone()).add(GalleryArea), rot: HubIndex0.rot};
export const GHubIndex1: STSpace = {pos: (HubIndex1.pos.clone()).add(GalleryArea), rot: HubIndex1.rot};
export const GHubIndex2: STSpace = {pos: (HubIndex2.pos.clone()).add(GalleryArea), rot: HubIndex2.rot};
export const GHubIndex3: STSpace = {pos: (HubIndex3.pos.clone()).add(GalleryArea), rot: HubIndex3.rot};
export const GHubIndex4: STSpace = {pos: (HubIndex4.pos.clone()).add(GalleryArea), rot: HubIndex4.rot};
export const GHubIndex5: STSpace = {pos: (HubIndex5.pos.clone()).add(GalleryArea), rot: HubIndex5.rot};

export const MasterHubInfo = [
    HubIndex0,
    HubIndex1,
    HubIndex2,
    HubIndex3,
    HubIndex4,
    HubIndex5,
]

// Classes
export enum ST_CAMERA_SLOTS {
    devSlot = -2,
    nullSlot = -1,
    slot0 = 0,
    slot1 = 1,
    slot2 = 2,
    slot3 = 3,
    slot4 = 4,
    slot5 = 5,
    sslot0 = 6,
    sslot1 = 7,
    sslot2 = 8,
    sslot3 = 9,
    sslot4 = 10,
    sslot5 = 11,
}
export interface STSpace {
    pos: Vector3;
    rot: Vector3;
    scale?: number;
}

export interface STCurve {curve: (x: number)=>number};
export const LINEAR: STCurve = {curve: (x)=>{return x;}}
export const SQUARE: STCurve = {curve: (x)=>{return Math.pow(x, 2);}}
export const CUBE: STCurve = {curve: (x)=>{return Math.pow(x, 3);}}
export const SIN: STCurve = {curve: (x)=>{return Math.sin(x * PI/2);}}

export const lerpToNumber = (from: number, to: number, t: number, curve?: STCurve) => {
    let c = curve ?? LINEAR;
    return lerp(from, to, c.curve(Math.min(1.0, Math.abs(t))));
}
export const lerpToVector = (set: Vector3, from: Vector3, to: Vector3, t: number, curve?: STCurve) => {
    set.setX(lerpToNumber(from.x, to.x, t, curve));
    set.setY(lerpToNumber(from.y, to.y, t, curve));
    set.setZ(lerpToNumber(from.z, to.z, t, curve));
}

export const vectorToString = (vec: Vector3, dp?: number) => {
    return vec.x.toFixed(dp ?? 1) + ", " +
        vec.y.toFixed(dp ?? 1) + ", " +
        vec.z.toFixed(dp ?? 1);
}


export const vectorsMatch = (vec1: Vector3, vec2: Vector3, threshold?: number) => {
    let distance = vec1.distanceTo(vec2);
    return distance <= (threshold ?? 0.1);
}
export const isCameraAtPos = (camera: Vector3, space: STSpace, threshold?: number) => {
    let distance = camera.distanceTo(space.pos);
    return distance <= (threshold ?? 0.1);
}
