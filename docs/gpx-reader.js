export class GpxReader {

    constructor() {
        this.name = "";
        this.trackSegments = [];
    }

    read(xmlString) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, "application/xml");
        window.xml = xml;
        
        const trk = xml.querySelector('gpx > trk');
        const trkName = xml.querySelector('gpx > trk > name');
        const trksegs = trk.querySelectorAll('trkseg');

        if (trkName) {
            this.name = trkName.textContent;
        }
        if (trksegs.length > 0) {
            for (let i = 0; i < trksegs.length; i++) {
                const segment = [];
                
                const trkpts = trksegs[i].querySelectorAll('trkpt');
                for (let j = 0; j < trkpts.length; j++) {
                    segment.push({
                        lat: parseFloat(trkpts[j].getAttribute("lat")),
                        lon: parseFloat(trkpts[j].getAttribute("lon"))
                    })
                }

                this.trackSegments.push(segment);
            }
        }
    }

}