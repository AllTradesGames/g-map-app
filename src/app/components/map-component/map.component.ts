import { Component, OnInit } from '@angular/core';
import { } from '@types/googlemaps';
import { FormsModule } from '@angular/forms';

import { Pin } from '../../models';

@Component({
  selector: 'map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  geocoder: google.maps.Geocoder;
  infowindow: google.maps.InfoWindow;
  map: google.maps.Map;
  latLong: google.maps.LatLng = new google.maps.LatLng(39.5501, -105.7821);
 // mouseMarker: google.maps.Point;
  geocodeResults: google.maps.GeocoderResult[];
  isCreatingPin: boolean;
 // mouseLatLng: google.maps.Data = new google.maps.Data.Geometry.get(): LatLng;

  constructor() { }

  ngOnInit() {
    this.isCreatingPin = false;
    this.geocoder = new google.maps.Geocoder();
    this.infowindow = new google.maps.InfoWindow();
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: this.latLong
    });

    this.geocoder.geocode({ 'location': this.latLong }, (results, status) => {
      if (status.toString() === 'OK') {
        this.geocodeResults = results;
        console.log(results);
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });

  }

  useGeocode() {
    console.log("useGeocode()");
    if (this.geocodeResults[1]) {
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
        }
  }
//Mouse click to call setNewPin()

  onMapClicked(){
    if (this.isCreatingPin == true){

      var marker = new google.maps.Marker();
      
    }
  }

  onSliderChanged(){
    console.log(this.isCreatingPin);
  }
}
