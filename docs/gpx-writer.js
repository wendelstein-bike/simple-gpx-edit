export class GpxWriter {

    constructor() {
        this.name = "";
        this.trackSegments = [];
    }

    write() {
        const namespace = "http://www.topografix.com/GPX/1/1";
        const gpx = document.implementation.createDocument(namespace, 'gpx', null);

        const track = document.createElement('trk');
        gpx.documentElement.appendChild(track);

        const name = document.createElement("name");
        name.textContent = this.name;
        track.appendChild(name);

        for (let t = 0; t < this.trackSegments.length; t++) {
            const trackSegment = document.createElement('trkseg');
            track.appendChild(trackSegment);
    
            for (let trackingpoint of this.trackSegments[t]) {
                const trkpt = document.createElement('trkpt');
                trkpt.setAttribute("lat", trackingpoint.lat);
                trkpt.setAttribute("lon", trackingpoint.lon);
                trackSegment.appendChild(trkpt);
            }
        }      
                
        const writer = new XMLSerializer();
        return writer.serializeToString(gpx);
    }

    setName(name) {
        this.name = name;
    }

    addTrackSegment() {
        this.trackSegments.push([]);
    }

    addTrackpoint(lat, lon) {
        this.trackSegments[this.trackSegments.length-1].push({
            lat: lat,
            lon: lon
        });
    }

}