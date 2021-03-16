import React, {PureComponent, useState} from 'react';
import {RNCamera, FaceDetector} from 'react-native-camera';

import Icon from 'react-native-vector-icons/dist/FontAwesome';
import {
    TouchableOpacity, 
    Alert, 
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight
} from 'react-native';


export default function Camera({props}) {

    const [camera, setCamera] = useState(null);
    const [imgUri, setImgUri] = useState(null);

    const takePicture = async () => {
        if (camera) {
            
            const options = { quality: 0.5, base64: true };
            const { uri } = await camera.takePictureAsync(options);
            setImgUri(uri);
        }
    }

    const onFaceDetectedEvent = (obj) => {
        if(obj && obj.faces && obj.faces.length > 0){
            console.log(obj.faces[0].noseBasePosition);
        }
        
    }
    
    return (
            <View style={styles.container}>
                {!imgUri ? 
                    <RNCamera 
                        ref={ref => {
                            setCamera(ref);
                        }}
                        captureAudio={false}
                        style={styles.preview}
                        type={RNCamera.Constants.Type.front}
                        onFacesDetected={onFaceDetectedEvent}
                        faceDetectionLandmarks= {RNCamera.Constants.FaceDetection.Landmarks.all}
                        // faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.accurate}
                        faceDetectionClassifications={RNCamera.Constants.faceDetectionClassifications}
                    />
                        
                    :

                    <View style={styles.preview}>
                        <Image source={{uri : imgUri}} style={{ 
                            flex : 1
                            }}/>
                      
                    </View>
                }
                

                <View style={styles.captureBox}>
                    {   
                        !imgUri?
                        <TouchableOpacity style= {styles.capture} onPress={takePicture}>
                            <Text>Snap</Text>   
                        </TouchableOpacity>

                        :

                        <TouchableOpacity style= {styles.capture} onPress={()=>{
                            setImgUri(null);
                        }}>
                            <Text>Go back</Text>   
                        </TouchableOpacity>
                    }
                    
                </View>
                
            </View>

    )

}



const styles = StyleSheet.create({
    container : {
        flex : 1,
        flexDirection : "column",
        backgroundColor : "white"
    },

    preview : {
        flex : 9,
        flexDirection : "column"
    },

    captureBox : {
        flex: 1,
        backgroundColor: "white",
        justifyContent : "center"
    },
    capture: {
        flex: 0,
        backgroundColor: '#dddddd',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 15,
        alignSelf: "center",
        margin : 10
    }
})