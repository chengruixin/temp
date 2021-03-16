
import { getDistance } from './ThreeJsCanvas';

function getTranslatedPoints(point1, point2, point3, distanceUnits){
    //a point on the plane: incenter point of a triangle plane
    const incenter = getIncenter(point1, point2, point3);
    
    //Used to represent the plane equation
    const normalVector = getNormalVector(point1, point2, point3);
    
    let scalar = distanceUnits / Math.sqrt(normalVector[0] ** 2 + normalVector[1] ** 2 + normalVector[2] ** 2);
    
    let p1 = [
        scalar * normalVector[0] + incenter[0],
        scalar * normalVector[1] + incenter[1],
        scalar * normalVector[2] + incenter[2]
    ]

    let p2 = [
        -1 * scalar * normalVector[0] + incenter[0],
        -1 * scalar * normalVector[1] + incenter[1],
        -1 * scalar * normalVector[2] + incenter[2]
    ]

    return p1[2] >= p2[2] ? [p1, p2] : [p2, p1];
}



export function getIncenter(a, b, c){
    let ab = getDistance(a, b);
    let ac = getDistance(a, c);
    let bc = getDistance(b, c);

    let p = ab + ac + bc;

    let x = (a[0] * bc + b[0] * ac + c[0] * ab) / p;
    let y = (a[1] * bc + b[1] * ac + c[1] * ab) / p;
    let z = (a[2] * bc + b[2] * ac + c[2] * ab) / p;

    return [x, y, z];
}

export function getPerimeter(a, b, c) {
    return getDistance(a, b) + getDistance(b, c) + getDistance(a, c);
}
function getNormalVector(point1, point2, point3){
    let vec_p1p2 = [point2[0] - point1[0], point2[1] - point1[1], point2[2] - point1[2]];
    let vec_p1p3 = [point3[0] - point1[0], point3[1] - point1[1], point3[2] - point1[2]];

    return [
        vec_p1p2[1] * vec_p1p3[2] - vec_p1p2[2] * vec_p1p3[1],
        vec_p1p2[2] * vec_p1p3[0] - vec_p1p2[0] * vec_p1p3[2],
        vec_p1p2[0] * vec_p1p3[1] - vec_p1p2[1] * vec_p1p3[0]
    ]
}



export default getTranslatedPoints;