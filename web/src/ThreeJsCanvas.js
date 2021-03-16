import {useEffect, useState} from 'react';
import * as Three from 'three';
import './index.css';
import getMiddlePointsWithTranslate , {
    getIncenter,
    getPerimeter
} from './getMiddlePointsWithTranslate';

const VIDEO_WIDTH = 400;
const VIDEO_HEIGHT = 650;

const faceLocation = {
    leftHorn : [54, 103, 68],
    rightHorn : [284, 332, 298],
    noseTip : [220,440,195],
    middle : [4]
}
function ThreeJsCanvas({predictions}){
    // console.log("1");
    const [rightEyeIris, setRightEyeIris] = useState(null);
    const [leftEyeIris, setLeftEyeIris] = useState(null);
    const [rightCone, setRightCone] = useState(null);
    const [leftCone, setLeftCone] = useState(null);

    const [leftHorn, setLeftHorn] = useState(null);
    const [rightHorn, setRightHorn] = useState(null);
    const [noseTip, setNoseTip] = useState(null);
    const [confidence, setCon] = useState(null);
    const [scale, setScale] = useState(null);
    const [depth, setDepth] = useState(null);
    //start 3d canvas and save two cone meshes, for displaying as horns over people's head
    useEffect(()=>{
        let canvas = initiateCanvas("#canvas-3d");
        
        const [rightConeMesh, leftConeMesh] = initiateThreeJS(canvas, rightEyeIris, leftEyeIris);
        setRightCone(rightConeMesh);
        setLeftCone(leftConeMesh);
    },[])

    //Update predictions data
    useEffect(()=>{
        
        /**
         * For the time being,
         * we only consider the first prediction. 
         * That is the first person appeared in screen
         */
        if(!predictions || predictions.length === 0) return;
        // console.log(predictions[0].annotations.rightEyeIris[0]);
        setRightEyeIris(predictions[0].annotations.rightEyeIris);
        setLeftEyeIris(predictions[0].annotations.leftEyeIris);
        setLeftHorn(
            faceLocation.leftHorn.map( item => predictions[0].scaledMesh[item])
        );

        setRightHorn(
            faceLocation.rightHorn.map( item => predictions[0].scaledMesh[item])
        )

        setNoseTip(
            faceLocation.noseTip.map( item => predictions[0].scaledMesh[item])
        );
        // console.log(predictions);
        setCon(predictions[0].faceInViewConfidence);

        setDepth(predictions[0].scaledMesh[0][2]);
        
    },[predictions]);


    //update meshes location, rotation and scale
    useEffect(()=>{
        if(rightHorn && leftHorn ) {
            if(rightCone && leftCone){
                // let rightHornCenter = getPivot(rightHorn[0], rightHorn[1]);
                // let leftHornCenter = getPivot(leftHorn[0], leftHorn[1]);
                const configureHorns = (hornLocations, distanceUnits, coneObject, rotateX, rotateZ)=>{
                    let hornCenter = getIncenter(hornLocations[0], hornLocations[1], hornLocations[2]);

                    let translatedPoint = getMiddlePointsWithTranslate(hornLocations[0], hornLocations[1], hornLocations[2], distanceUnits)[0];

                    coneObject.position.set(translatedPoint[0], translatedPoint[1] - 100, translatedPoint[2]);

                    coneObject.lookAt(hornCenter[0], hornCenter[1], hornCenter[2]);
                    

                    {
                        
                        let scaleRate = getPerimeter(hornLocations[0], hornLocations[1], hornLocations[2])/2 / 35;
                        //35, 120, 10
                        coneObject.geometry.copy(new Three.ConeGeometry(35 * scaleRate, 120 * scaleRate, 10))
                        
                    }
                    // console.log(coneObject.scale);
                    // setScale(coneObject.scale);
                    if(rotateX) {
                        coneObject.rotateX(rotateX);
                    }
                    if(rotateZ) {
                        coneObject.rotateZ(rotateZ);
                    }
                    // coneObject.rotateZ(-Math.PI/4);
                }
                
                // console.log(rightCone.geometry.attributes);
                configureHorns(rightHorn, 10 , rightCone, -Math.PI/2 - 0.8, -0.1);
                configureHorns(leftHorn, 10 , leftCone, -Math.PI/2 - 0.8, 0.1);
               
            }
        }   
    }, [rightHorn, leftHorn])
    
    return (
        <>
        <div className="test">
                <canvas id="canvas-3d"></canvas>
        </div>
        <div
            style={{
                position : "absolute",
                top : "0",
                left : "0"
            }}
        >
            <li>Confidence : {confidence}</li>
            <li>Depth : {depth}</li>
        </div>

        </>
        
    )
}

function initiateCanvas(el) {
    const canvas = document.querySelector(el);
    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;

    return canvas;
}

function initiateThreeJS (canvas, rightEyeIris, leftEyeIris) {
    const renderer = new Three.WebGLRenderer({
        canvas : canvas,
        alpha : true
    });

    renderer.setClearColor( 0x000000, 0 );

    /**Create Camera */
    const left = 0;
    const right = VIDEO_WIDTH;
    const top = 0;
    const bottom = VIDEO_HEIGHT;
    const near = -100;
    const far = 100;

    const camera = new Three.OrthographicCamera(left, right, top, bottom, near, far);
    camera.zoom = 1;
    
    /**Create Scene */
    const scene = new Three.Scene();
    
    /**Add Point Light */
    {
        const color = 0xffffff;
        const intensity = 0.8;
        const light = new Three.PointLight(color, intensity);
        light.position.set(VIDEO_WIDTH/2, VIDEO_HEIGHT/2, -200);
        scene.add(light);
    }
    
    /**Create Objects */
    let rightCone = ObjectFactory.createConeObject(35, 120, 10, 
            new Three.MeshToonMaterial({
                color : 0xffff00
            })
        )
        
    let leftCone = ObjectFactory.createConeObject(35, 120, 10, 
        new Three.MeshToonMaterial({
            color : 0xffff00
        })
    )
    
    const geometry = new Three.BoxGeometry( 50, 50, 50 );
    const material = new Three.MeshPhongMaterial( {
        color: 0x00ff00,
    } );
    // const m1 = new Three.Mesh(geometry, material);
    // m1.position.set(VIDEO_WIDTH/2, VIDEO_HEIGHT/2, 40);
    // scene.add(m1);

    scene.add( rightCone );
    scene.add( leftCone );
    
    /**Render function*/
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }


    function render () {

        if (resizeRendererToDisplaySize(renderer)) {
            camera.right = canvas.width;
            camera.bottom = canvas.height;
            camera.updateProjectionMatrix();
        }
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        // cone.rotation.x += 0.003;
        // cone.rotation.z += 0.003 * 2;
        
        
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
    
    return [rightCone, leftCone];
}

class ObjectFactory {
    static createConeObject(radius, height, radialSegments, material){
        if(!Three) return;

        const geometry = new Three.ConeGeometry(radius, height, radialSegments);

        return new Three.Mesh(geometry, material);
    }
}


export function getDistance(vec1, vec2) {
    if(vec1.length !== vec2.length) {
        throw new Error("unmatech length of vector");
    }

    let squareSum = 0;

    for(let i = 0; i < vec1.length; i++){
        squareSum += (vec1[i] - vec2[i]) ** 2;
    }

    return Math.sqrt(squareSum);

}

function getPivot(vec1, vec2) {
    if(vec1.length !== vec2.length) {
        throw new Error("unmatech length of vector");
    }

    let newVec = new Array(vec1.length);

    for(let i = 0; i < newVec.length; i++){
        newVec[i] = (vec1[i] + vec2[i]) / 2;
    }

    return newVec;

}
export default ThreeJsCanvas;