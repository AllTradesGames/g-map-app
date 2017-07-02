import { Component, OnInit, AfterViewInit } from '@angular/core';
import { } from '@types/googlemaps';
import { FormsModule } from '@angular/forms';

import { Pin } from '../../models';

@Component({
  selector: 'map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  // geocoder: google.maps.Geocoder;
  // infowindow: google.maps.InfoWindow;
  map: google.maps.Map;
  latLong: google.maps.LatLng = new google.maps.LatLng(39.5501, -105.7821);
  // geocodeResults: google.maps.GeocoderResult[];
  isCreatingPin: boolean;
  markers: google.maps.Marker[];
  newMarkerInfoWindowContent: string;
  newMarkerInfowindow: google.maps.InfoWindow = new google.maps.InfoWindow();
  markerInfoWindowContent: string;
  markerInfowindow: google.maps.InfoWindow = new google.maps.InfoWindow();;

  constructor() { }

  ngOnInit() {
    this.isCreatingPin = false;
    // this.geocoder = new google.maps.Geocoder();
    // this.infowindow = new google.maps.InfoWindow();
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 11,
      center: this.latLong
    });
    var thisRef = this;
    this.map.addListener('click', function ($event) {
      console.log("map was clicked");
      thisRef.onMapClick($event);
    });

    /*this.geocoder.geocode({ 'location': this.latLong }, (results, status) => {
      if (status.toString() === 'OK') {
        this.geocodeResults = results;
        console.log(results);
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });*/

    this.initInfoWindowContent();
    this.initEasyDataMarkers();

  }

  ngAfterViewInit() {
    var thisRef = this;
    window.addEventListener('message', thisRef.handleParentMessages, false); 
    window.parent.postMessage({
      "eventType": "AppLoaded"
    }, '*');
  }

  handleParentMessages(event){
    switch (event.data.eventType) {
                case "InitialData":
                    console.log(event.data.data);
                    break;
            }
  }

  initEasyDataMarkers(){
    // TODO load Activities and Dispositions from EASYDATATRACKER
    this.markers = new Array<google.maps.Marker>();
  }

  useGeocode() {
    console.log("useGeocode()");
    /*if (this.geocodeResults[1]) {
      this.map.setZoom(11);
      this.map.setCenter(this.latLong);
      var marker = new google.maps.Marker({
        position: this.latLong,
        map: this.map
      });
      this.infowindow.setContent(this.geocodeResults[1].formatted_address);
      this.infowindow.open(this.map, marker);
    } else {
      window.alert('No results found');
    }*/
  }

  onMapClick($event) {
    console.log($event);
    if (this.isCreatingPin == true) {
      this.createNewPin($event.latLng.lat(), $event.latLng.lng());
      this.isCreatingPin = false;
    }

  }

  onSliderChange() {
    console.log(this.isCreatingPin);
  }

  createNewPin(inputLat: number, inputLng: number) {
    var latLong = new google.maps.LatLng(inputLat, inputLng);
    this.markers.push(new google.maps.Marker({
        position: latLong,
        map: this.map
    }));
    this.newMarkerInfowindow.setContent(this.newMarkerInfoWindowContent);
    this.newMarkerInfowindow.open(this.map, this.markers[this.markers.length-1])
  }

  initInfoWindowContent()
  {
    this.newMarkerInfoWindowContent = `
    <div>
      <input #newMarkerName type="text" placeholder="Name">
      <input type="text" placeholder="Address">
      <input type="text" placeholder="Phone Number">
      <input type="text" placeholder="Email (optional)">
    </div>
    <div>
      <input type="button" value="Save">
    </div>
    `;

    this.markerInfoWindowContent = `
    <p>Marker Info Window</p>
    <div>
      <input type="button" value="test1">
      <input type="button" value="test2">
      <input type="button" value="test3">
    </div>
    `;
  }

}
