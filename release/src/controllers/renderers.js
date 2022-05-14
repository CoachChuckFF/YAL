import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { extend } from '@react-three/fiber'
import { Text } from "troika-three-text";
import fonts from "../fonts/fonts";

extend({ TextGeometry })
extend({ Text });

export function TextWoraround(props) {
    return (
        <text
            ref={props.objRef}
            position={ props.position } 
            rotation={ props.rotation }
            fontSize={ props.fontSize}
            maxWidth={ props.maxWidth}
            lineHeight={ props.lineHeight }
            letterspacing={ props.letterspacing }
            text={ props.text }
            font={fonts['Vimland']}
            anchorX={ props.anchorX ?? "center" }
            anchorY={ props.anchorY ?? "middle" }
        >
            <meshPhongMaterial attach="material" color={props.color} />
        </text>
    );
}