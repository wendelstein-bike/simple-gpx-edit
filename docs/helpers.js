export function reorder(points, start) {
    const output = [];
    const startIndex = findNearestNeighbour(points, start);
    
    for (let i = startIndex; i < points.length + startIndex; i++) {
        output[i - startIndex] = points[i % (points.length - 1)];
    }

    return output;
}

export function findNearestNeighbour(points, point) {
    let lowIndex = 0;
    let lowDistance = distance(points[0], point);

    for (let i = 1; i < points.length; i++) {
        const d = distance(points[i], point);
        if (lowDistance > d) {
            lowIndex = i;
            lowDistance = d;
        }
    }
    return lowIndex;
}

export function distance(pointA, pointB) {
    return Math.sqrt( 
        Math.pow(pointA.lat - pointB.lat, 2) + Math.pow(pointA.lon - pointB.lon, 2)
    );
}