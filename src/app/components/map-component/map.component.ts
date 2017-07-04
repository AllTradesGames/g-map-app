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
  map: google.maps.Map;
  latLong: google.maps.LatLng = new google.maps.LatLng(39.5501, -105.7821);
  isCreatingPin: boolean;
  saveMarkerData: boolean;
  markers: google.maps.Marker[] = [];
  activities: Activity[] = [];
  newMarkerInfoWindowContent: string;
  newMarkerInfowindow: google.maps.InfoWindow = new google.maps.InfoWindow();
  markerInfoWindowContent: string;
  markerInfowindow: google.maps.InfoWindow = new google.maps.InfoWindow();
  markerBeachFlag = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
  newMarkerAddress: string;
  markerAddress: string;

  constructor() { }

  ngOnInit() {
    // Initialize google maps vars
    this.isCreatingPin = false;
    this.geocoder = new google.maps.Geocoder();
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 5,
      center: this.latLong
    });
    var thisRef = this;

    // Add a click listener to the map
    this.map.addListener('click', function ($mapClick) {
      thisRef.onMapClick($mapClick);
    });
    // Set the info window html content vars
    this.initInfoWindowContent();
    // Load and create markers from EasyDataTracker
    this.initEasyDataMarkers();
    // Load logged in user info from EasyDataTracker
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


  onMapClick($mapClick) {
    if (this.isCreatingPin == true) {
      var latLong = new google.maps.LatLng($mapClick.latLng.lat(), $mapClick.latLng.lng());
      this.markers.push(new google.maps.Marker({
        position: latLong,
        map: this.map,
        icon: this.markerBeachFlag,
        animation: google.maps.Animation.DROP,
      }));
      this.geocoder.geocode({ 'location': $mapClick.latLng }, (results, status) => {
        if (status.toString() === 'OK') {
          this.newMarkerAddress = results[0].formatted_address;
          this.newMarkerWindowContent();
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
      this.isCreatingPin = false;
    }
  }

  keypressEvent(event) {
    var key = event.which || event.keyCode;
    if (key === 13) { // 13 is enter
      this.codeAddress();
    }
  }


  codeAddress() {
    var searchBoxEl: HTMLInputElement = <HTMLInputElement>document.getElementById("search-box");
    this.newMarkerAddress = searchBoxEl.value;
    this.geocoder.geocode({ 'address': this.newMarkerAddress }, (results, status) => {
      if (status.toString() === 'OK') {
        searchBoxEl.value = results[0].formatted_address;
        this.newMarkerAddress = results[0].formatted_address;
        this.map.setCenter(results[0].geometry.location);
        // TODO make this zoom value dynamic based on the closest geocode result
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
    var newMarkerAddressEl: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerAddress");
    newMarkerAddressEl.value = thisRef.newMarkerAddress;
    google.maps.event.addListener(thisRef.newMarkerInfowindow, 'closeclick', function () {
      thisRef.markers[thisRef.markers.length - 1].setMap(null); //removes the marker from map
      thisRef.markers.pop(); //removes the marker from array
    });
  }

  initInfoWindowContent() {
    this.newMarkerInfoWindowContent = `
    <div>
      <input _ngcontent-c1 id="newMarkerName" title="New Customer Name" type="text" placeholder="Name">
      <input _ngcontent-c1 id="newMarkerAddress" title="New Customer Address" type="text" placeholder="Address" value="">
      <input _ngcontent-c1 id="newMarkerPhone" title="New Customer Phone Number" type="text" placeholder="Phone Number">
      <input _ngcontent-c1 id="newMarkerEmail" title="New Customer Email Address" type="text" placeholder="Email (optional)">
    </div>
    <div>
      <button _ngcontent-c1 class="button-blue" title="Save" id="newMarkerSave"><i class="material-icons">save</i></button>
    </div>
    `;

    this.markerInfoWindowContent = `
    <div>
     <button _ngcontent-c1 class="button-blue" title="Open Directions" id="openExternalMaps"><i class="material-icons">navigation</i></button>
     <button _ngcontent-c1 class="button-blue" title="Disposition Info" id="dispositionInfo"><i class="material-icons">people</i></button>
     <button _ngcontent-c1 class="button-blue" title="Call Customer" id="callCustomer"><i class="material-icons">phone_iphone</i></button>
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
      id: -1,
      ownerName: this.loggedInUser.logonName,
      contactName: nameField.value,
      contactAddress: addressField.value,
      contactEmail: emailField.value,
      contactPhones: [phoneField.value],
      leadType: "testLead",
      status: ActivityStatus.LEAD,
      dispositionName: "testDisposition",
      dispositionColor: "000000",
      notes: ""
    });
    //console.log(this.activities[this.activities.length - 1])

    // Clear the new marker content
    this.newMarkerInfowindow.setContent(this.newMarkerInfoWindowContent);
    this.newMarkerInfowindow.close();
    this.lastSavedMarkerWindow();

    // TODO Push the newest activity to the EasyDataTracker side
  }

  openExternalMaps(){
    console.log("Set a default application for opening maps");
  }
  dispositionInfo(){
    console.log("The Disposition window has not yet been set");
  }
  callCustomer(){
    console.log("Set a default application for making phone calls");
  }

  lastSavedMarkerWindow(){
    this.markerInfowindow.setContent(this.markerInfoWindowContent);
    this.markerInfowindow.open(this.map, this.markers[this.markers.length - 1]);
    var thisRef = this;
    document.getElementById("openExternalMaps").addEventListener("click", function () {
      thisRef.openExternalMaps();
    });
     document.getElementById("dispositionInfo").addEventListener("click", function () {
      thisRef.dispositionInfo();
    });
     document.getElementById("callCustomer").addEventListener("click", function () {
      thisRef.callCustomer();
    });
  }
}
