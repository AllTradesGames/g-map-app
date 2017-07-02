import { Component, OnInit, AfterViewInit } from '@angular/core';
import { } from '@types/googlemaps';
import { FormsModule } from '@angular/forms';

import { Pin, Activity, ActivityStatus, User, UserStatus, Permission } from '../../models';

@Component({
  selector: 'map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  loggedInUser: User;
  geocoder: google.maps.Geocoder;
  // infowindow: google.maps.InfoWindow;
  map: google.maps.Map;
  latLong: google.maps.LatLng = new google.maps.LatLng(39.5501, -105.7821);
  geocodeResults: google.maps.GeocoderResult[];
  isCreatingPin: boolean;
  saveMarkerData: boolean;
  markers: google.maps.Marker[] = [];
  activities: Activity[] = [];
  newMarkerInfoWindowContent: string;
  newMarkerInfowindow: google.maps.InfoWindow = new google.maps.InfoWindow();
  markerInfoWindowContent: string;
  markerInfowindow: google.maps.InfoWindow = new google.maps.InfoWindow();
  address: string;

  newMarkerAddress: string;



  constructor() { }

  ngOnInit() {
    this.isCreatingPin = false;
    this.geocoder = new google.maps.Geocoder();
    // this.infowindow = new google.maps.InfoWindow();
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 5,
      center: this.latLong
    });
    var thisRef = this;
    this.map.addListener('click', function ($mapClick) {
      //console.log("map was clicked");
      thisRef.onMapClick($mapClick);
    });

    this.initInfoWindowContent();
    this.initEasyDataMarkers();
    this.loggedInUser = this.getLoggedInUser();
  }

  ngAfterViewInit() {
    var thisRef = this;
    window.addEventListener('message', thisRef.handleParentMessages, false);
    window.parent.postMessage({
      "eventType": "AppLoaded"
    }, '*');

  }

  getLoggedInUser(): User {
    // TODO grab real info from EASYDATATRACKER
    var user = {
      status: UserStatus.ENABLED,
      logonName: "testUser",
      permissions: [{
        id: 0,
        name: "testPermission",
        sysPermission: true
      }]
    };
    return user;
  }

  handleParentMessages(event) {
    switch (event.data.eventType) {
      case "InitialData":
        break;
    }
    console.log("PARENT_MESSAGE: " + event.data.eventType);
  }

  initEasyDataMarkers() {
    // TODO load Activities and Dispositions from EASYDATATRACKER
    this.markers = new Array<google.maps.Marker>();
  }

  useGeocode() {
    /*this.geocoder.geocode({ 'location': this.latLong }, (results, status) => {
          if (status.toString() === 'OK') {
            this.geocodeResults = results;
            console.log(results);
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }
        });*/



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

  onMapClick($mapClick) {
    //console.log($mapClick);
    if (this.isCreatingPin == true) {
      this.createNewPin($mapClick.latLng.lat(), $mapClick.latLng.lng());
      this.geocoder.geocode({ 'location': $mapClick.latLng }, (results, status) => {
        if (status.toString() === 'OK') {
          this.geocodeResults = results;
          //console.log(results);
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
      this.isCreatingPin = false;
    }
  }

  onSliderChange() {
    //console.log(this.isCreatingPin);
  }

  createNewPin(inputLat: number, inputLng: number) {
    var latLong = new google.maps.LatLng(inputLat, inputLng);
    this.markers.push(new google.maps.Marker({
      position: latLong,
      map: this.map
    }));
    this.newMarkerWindowContent();
  }

  codeAddress() {
    var address = document.getElementById('address');
    this.geocoder.geocode({ 'address': this.address }, (results, status) => {
      if (status.toString() === 'OK') {
        this.geocodeResults = results;
        //console.log(results);
        this.map.setCenter(results[0].geometry.location);
        this.map.setZoom(11);
        if (this.isCreatingPin) {
          this.markers.push(new google.maps.Marker({
            position: results[0].geometry.location,
            map: this.map
          }));
          this.newMarkerWindowContent();
        }
      }
      else {
        window.alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  newMarkerWindowContent() {
    this.newMarkerInfowindow.setContent(this.newMarkerInfoWindowContent);
    this.newMarkerInfowindow.open(this.map, this.markers[this.markers.length - 1]);
    var thisRef = this;
    document.getElementById("newMarkerSave").addEventListener("click", function () {
      thisRef.newMarkerSave();
    });
    var newMarkerAddress: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerAddress");
    newMarkerAddress.value = thisRef.address;
    //console.log(newMarkerAddress.value);
    google.maps.event.addListener(thisRef.newMarkerInfowindow, 'closeclick', function () {
      thisRef.markers[thisRef.markers.length - 1].setMap(null); //removes the marker from map
      thisRef.markers.pop(); //removes the marker from array
    });
  }

  initInfoWindowContent() {
    this.newMarkerInfoWindowContent = `
    <div>
      <input _ngcontent-c1 id="newMarkerName" type="text" placeholder="Name">
      <input _ngcontent-c1 id="newMarkerAddress" type="text" placeholder="Address" value="">
      <input _ngcontent-c1 id="newMarkerPhone" type="text" placeholder="Phone Number">
      <input _ngcontent-c1 id="newMarkerEmail" type="text" placeholder="Email (optional)">
    </div>
    <div>
      <button _ngcontent-c1 class="button-green" id="newMarkerSave">Save</button>
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

  newMarkerSave() {
    var nameField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerName");
    var addressField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerAddress");
    var phoneField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerPhone");
    var emailField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerEmail");

    // Add a new Activity to the activities array
    this.activities.push({
      ownerName: this.loggedInUser.logonName,
      contactName: nameField.value,
      leadType: "testLead",
      status: ActivityStatus.LEAD,
      dispositionName: "testDisposition"
    });
    //console.log(this.activities[this.activities.length - 1])

    // Clear the new marker content
    this.newMarkerInfowindow.setContent(this.newMarkerInfoWindowContent);
    this.newMarkerInfowindow.close();

    // TODO Push the newest activity to the EasyDataTracker side
  }

  /*
  Notes for Zach
  Add places autocomplete for a choice of places based on keywords
  When typing the address, we should be able to use the enter button on the keyboard
  The markers shouldnt stay unless you hit save
  Zoom is clumsy, could be a variable for easier use
  When you close the info window, the pin toggle should go back to true for quicker use
   */
}
