import { useEffect } from "react";
import {getDistance} from './ThreeJsCanvas';
const point1 = [3,4,-3];
const point2 = [4,-5,7];
const point3 = [-2,2,0];

function Test() {
    useEffect(()=>{
        main();
    },[]);

    return <>

    </>
}

function main(){
    let incenter = getIncenterPoint(point1, point2, point3);

    let targetLength = 20;

    let expectedPoint = getVecticalPoint(point1, point2, incenter, targetLength);

    console.log(expectedPoint);
}

function getIncenterPoint(a, b, c) {
    let ab = getDistance(a, b);
    let ac = getDistance(a, c);
    let bc = getDistance(b, c);

    let perimeter = ab + ac + bc;

    let ox = (bc * a[0] + ac * b[0] + ab * c[0]) / perimeter;
    let oy = (bc * a[1] + ac * b[1] + ab * c[1]) / perimeter;
    let oz = (bc * a[2] + ac * b[2] + ab * c[2]) / perimeter;

    return [ox, oy, oz];
}

function getVecticalPoint(point1 , point2, incenter, targetLength ){
    let vecticalLine1 = getDistance(point1, incenter);
    let vecticalLine2 = getDistance(point2, incenter);

    let distance_point1_target = Math.sqrt(vecticalLine1 ** 2 + targetLength ** 2);
    let distance_point2_target = Math.sqrt(vecticalLine2 ** 2 + targetLength ** 2)
    let target = computeVecticalPoint(
        point1[0], point1[1], point1[2], //p1 : a,b,c
        point2[0], point2[1], point2[2], //p2 : d,e,f
        incenter[0], incenter[1], incenter[2], //p3 : h,i,j
        distance_point1_target, // k
        distance_point2_target, // l
        targetLength // m
    ) 

    return target;
}


function computeVecticalPoint(a, b, c, d, e, f, h, i, j, k, l, m) {

    return mappingComputation(
        2 * a - 2 * d,
        2 * b - 2 * e,
        2 * c - 2 * f,
        2 * a - 2 * h,
        2 * b - 2 * i,
        2 * c - 2 * j,
        2 * d - 2 * h,
        2 * e - 2 * i,
        2 * f - 2 * j,
        a ** 2 + b ** 2 + c ** 2 - d ** 2 - e ** 2 - f ** 2,
        a ** 2 + b ** 2 + c ** 2 - h ** 2 - i ** 2 - j ** 2,
        d ** 2 + e ** 2 + f ** 2 - h ** 2 - i ** 2 - j ** 2
    )
}

function mappingComputation(a, b, c, d, e, f, g, h, i, k, l, m){
    let Z1 = 
        ( (a * e - b * d) * (a * m - g * k) - (a * l - d * k) * (a * h - g * b) ) 
        / 
        ( (a * e - b * d) * (a * i - g * c) - (a * f - c * d) * ( a * h - g * b) )

    let Y1 = ((a * l - d * k) - (a * f - c * d) * Z1) / (a * e - b * d);

    let X1 = (k - b * Y1 - c * Z1) / d;

    return [X1, Y1, Z1];

}
export default Test;