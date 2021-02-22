import { GpxWriter } from './gpx-writer.js';
import { GpxReader } from './gpx-reader.js';
import { reorder } from './helpers.js';

export class Controller {

    constructor() {
        this.map = L.map('mapid');
        this.map.setView([47.58333, 12.16667], 8);
        this.map.pm.addControls({
            drawCircle: false,
            drawCircleMarker: false,
            drawRectangle: false,
            drawPolyline: false,
            drawMarker: false
        });
        window.map = this.map;

        this.inputName = document.querySelector('#gpx-track-name');
        this.inputDensity = document.querySelector('#gpx-coordinate-density');
        this.exportButton = document.querySelector('#button-export-gpx');
        this.importButton = document.querySelector('#button-import-gpx');
        this.importFile = document.querySelector('#file-import-gpx');

        this.density = 100;
        this.loadedTrack = [];
    }

    loadMap() {
        L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 17,
            subdomains: ['a', 'b', 'c']
        }).addTo(this.map);
    }

    loadTrack(track) {
        this.loadedTrack = [];
        this.inputName.setAttribute('value', track.name);
        
        // let first = true;
        for (const trackSegment of track.trackSegments) {
            const latLngs = [];
            for (let p = 0; p < trackSegment.length; p++) {
                latLngs.push({
                    lat: trackSegment[p].lat,
                    lng: trackSegment[p].lon
                });
            }
            this.loadedTrack.push(latLngs);
        }        
    }

    loadTrackOnMap() {
        this.map.pm.disableGlobalEditMode(); // disable editing for Geoman
        const featureGroup = this.map.pm.getGeomanLayers(true);
        const layers = featureGroup.getLayers();
        for (const layer of layers) {
            layer.remove();
        }

        if (this.loadedTrack) {
            let first = true;
            let skip = this.density / 10 >= 10 ? 0 : this.density / 10;
            let latLngs = [];

            for (const segment of this.loadedTrack) {
                for (let i = 0; i < segment.length; i++) {
                    if (i > 0 && i%skip == 0) {
                        continue;
                    }
                    latLngs.push(segment[i]);
                }

                L.marker(latLngs[0])
                    .addTo(this.map);

                const polyline = L.polyline(latLngs, {color: 'red', opacity:.5})
                    .addTo(this.map);

                if (first) {
                    this.map.fitBounds(polyline.getBounds());
                    first = false;
                }
            }            
        }
    }

    getSegments() {
        const segments = [];
        const featureGroup = this.map.pm.getGeomanLayers(true); // L.featureGroup
        const layers = featureGroup.getLayers(); // layers inside feature group
        let startMarker = null;

        for (const layer of layers) {
            let latLngs = null;
            
            if (layer instanceof L.Polygon && !layer.isEmpty()) {                
                latLngs = layer.getLatLngs()[0];
                latLngs.push(latLngs[0]); // add first point as last                
            } else if (layer instanceof L.Polyline && !layer.isEmpty()) {
                latLngs = layer.getLatLngs();
            } else if (layer instanceof L.Marker && layer.getLatLng()) {
                startMarker = {
                    lat: layer.getLatLng().lat,
                    lon: layer.getLatLng().lng
                };
            }

            if (latLngs && Array.isArray(latLngs)) {
                const segment = [];
                for (const latLng of latLngs) {
                    segment.push({
                        lat: latLng.lat,
                        lon: latLng.lng
                    });
                }

                if (startMarker) {
                    segments.push(reorder(segment, startMarker));
                } else {
                    segments.push(segment);
                }                
            }
        }
        return segments;
    }

    bind() {       
        this.exportButton.addEventListener('click', () => {
            const name = this.inputName.nodeValue || "Default Name";
            const segments = this.getSegments();

            const gpxWriter = new GpxWriter();
            gpxWriter.setName(name);
            
            for (const segment of segments) {
                gpxWriter.addTrackSegment();
                for (const trackpoint of segment) {                    
                    gpxWriter.addTrackpoint(trackpoint.lat, trackpoint.lon)
                }
            }
            this.download('mytrack.gpx', gpxWriter.write(), 'application/gpx+xml')
        });

        this.importButton.addEventListener('click', () => {
            this.importFile.click();
        });

        this.importFile.addEventListener('change', () => {
            const fileReader = new FileReader();
            const file = this.importFile.files[0];
            const gpxReader = new GpxReader();

            fileReader.addEventListener('load', () => {
                gpxReader.read(fileReader.result);
                this.loadTrack({
                    "name": gpxReader.name,
                    "trackSegments": gpxReader.trackSegments
                });
                this.loadTrackOnMap();
            });

            fileReader.readAsText(file);
        });

        this.inputDensity.addEventListener('change', () => {
            this.density = parseInt(this.inputDensity.value);
            this.loadTrackOnMap();
        });
    }

    download(file, text, mime) {               
        const element = document.createElement('a'); 
        element.setAttribute('href', 'data:' + mime + ';charset=utf-8, ' + encodeURIComponent(text)); 
        element.setAttribute('download', file);             
        document.body.appendChild(element);       
        element.click();       
        document.body.removeChild(element); 
    } 

    start() {
        this.loadMap();     
        this.bind();
    }

}