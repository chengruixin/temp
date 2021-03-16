import {useEffect, useState} from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import ThreeJsCanvas from './ThreeJsCanvas';



const VIDEO_WIDTH = 400;
const VIDEO_HEIGHT = 650;

const cheak = [330, 347,346, 264, 447, 366,376,411,427,425];

let setPredictionsData;
function ARFilter () {
    const [predictionsData, setData] = useState(null);
    setPredictionsData = setData;

    useEffect(()=>{
        initialization();
    },[]);

    // useEffect(()=>{
    //     console.log(predictionsData);
    // },[predictionsData])
    return (
        <div style={{
            display : "flex",
            justifyContent : "center"
        }}>  
            <div>
                <video id="video" style={{ display : "none", transform : "scaleX(-1)"}}></video>
                <canvas id="canvas"></canvas>
            </div>
            
            <ThreeJsCanvas predictions={predictionsData}/>
            
        </div>
    )
}

async function initialization(){
    //starting executing long time task
    let setupCameraPromise = setupCamera("video");
    let loadPackagePromise = faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
        );

    
    let video = await setupCameraPromise;
    video.play();
    let canvas = document.querySelector("#canvas");
    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;
    let ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    let model = await loadPackagePromise;
    canvasRendering(canvas, ctx, video, model);


    

}

async function setupCamera(queryDom) {
    let video = document.querySelector(queryDom);
    
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
          facingMode: 'user',
          // Only setting the video to a specified size in order to accommodate a
          // point cloud, so on mobile devices accept the default size.
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT
        },
      });
      video.srcObject = stream;
    
    return new Promise((resolve) => {
        // video.onloadedmetadata = () => {
        //     resolve(video);
        // };
        video.onloadeddata = () => {
            resolve(video);
        }
    });
}

async function canvasRendering (canvas, ctx, video, model) {
    const predictions = await model.estimateFaces({
        input: video,
        returnTensors: false,
        flipHorizontal: false
    });

    //Update predictions
    setPredictionsData([...predictions]);
    
    ctx.drawImage(
        video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height
    );
    
    // drawLogo(ctx, predictions);
    // console.log(predictions);
    for (let i = 0; i < predictions.length; i++) {
        let keypoints = predictions[i].scaledMesh;
        // let keypoints = cheak.map( item => predictions[i].scaledMesh[item]);
        // let keypoints = [
        //     ...predictions[i].annotations.leftEyeIris,
        //     ...predictions[i].annotations.rightEyeIris
        // ];

        
        for(let j = 0; j < keypoints.length; j++){
            const x = keypoints[j][0];
            const y = keypoints[j][1];

            ctx.beginPath();
            ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
            ctx.fill();
            
        }
    }
    requestAnimationFrame(canvasRendering.bind(null, canvas, ctx, video, model));
}


export default ARFilter;