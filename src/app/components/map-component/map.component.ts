import { Component, OnInit, AfterViewInit } from '@angular/core';
import { } from '@types/googlemaps';
import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs/Rx';

import { Pin, Activity, ActivityStatus, User, UserStatus, Permission } from '../../models';

@Component({
  selector: 'map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  isTrackingUserLocation: boolean = false;
  isLocationUpdated: boolean = false;
  userLocationPin: google.maps.Marker;
  loggedInUser: User = { status: UserStatus.ENABLED, logonName: "zach", permissions: [] }; // TODO remove this initialization later
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
  easyDataImgPath: string = "http://localhost:53312/WebApplication/img/";
  newMarkerAddress: string;
  markerAddress: string;
  clickedMarkerIndex: number;


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

    // Set the infowindow html content vars
    this.initInfoWindowContent();
  }



  ngAfterViewInit() {
    var thisRef = this;
    window.addEventListener('message', thisRef.handleParentMessages.bind(this), false);
  }


  getLoggedInUser(): User {
    // TODO grab real info from EASYDATATRACKER
    let user: User = {
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
    console.log("PARENT_MESSAGE: " + event.data.type);
    console.log(event.data);
    switch (event.data.type) {

      case "webpackOk":
        console.log("Send to Parent: AppLoaded");
        window.parent.postMessage({
          "type": "AppLoaded"
        }, '*'); // TODO (SECURITY) Change '*' to actual domain name of final site
        break;

      case "InitialData":
        var dataArray = event.data.data;
        this.activities = dataArray.map((inputActivity) => {
          return inputActivity;
        });
        this.initializeMarkers();
        break;

    }
  }

  // Creates the Marker array and fills it with Markers made from the Activity list
  initializeMarkers() {
    console.log("initializeMarkers()")
    this.markers = new Array<google.maps.Marker>();
    for (let ii: number = 0; ii < this.activities.length; ii++) {
      this.createMarkerFromActivity(ii);
    }

    // Sets the interval to update User location
    Observable.interval(1000).subscribe(x => {
      this.checkUserLocationCheckbox();
    });
  }

  // Creates a corresponding Marker for an Activity, given the Activity's index in the activities array
  createMarkerFromActivity(index: number) {
    this.geocoder.geocode({ 'address': this.activities[index].contactAddress }, (results, status) => {
      if (status.toString() === 'OK') {
        this.markers[index] = new google.maps.Marker({
          position: results[0].geometry.location,
          map: this.map,
          icon: this.easyDataImgPath + this.activities[index].dispositionName.toLowerCase() + ".png",
          title: this.activities[index].contactName,
          clickable: true
        });
        var thisRef = this;
        this.markers[index].addListener('click', function () {
          //thisRef.clickedMarkerIndex = index;
          thisRef.openMarkerInfowindow(index);
          console.log("marker " + index + " clicked");
        });
      }
      else {
        console.log('Geocode was not successful for the following reason: ' + status);
      }
    });
    // TODO Set zoom so that all pins are in view
    // TODO Set center of map at relative center to all pins
  }

  // Handles map clicks for creating a new pin
  onMapClick($mapClick) {
    if (this.isCreatingPin == true) {
      var latLong = new google.maps.LatLng($mapClick.latLng.lat(), $mapClick.latLng.lng());
      this.markers.push(new google.maps.Marker({
        position: latLong,
        map: this.map,
        icon: this.easyDataImgPath + "newpin.png",
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

  // Calls "codeAddress" when the enter key is pressed
  keypressEvent(event) {
    var key = event.which || event.keyCode;
    if (key === 13) { // 13 is enter
      this.codeAddress();
    }
  }

  // Geocodes the address in the search box and creates a new Marker for that address
  codeAddress() {
    var searchBoxEl: HTMLInputElement = <HTMLInputElement>document.getElementById("search-box");
    this.newMarkerAddress = searchBoxEl.value;
    this.geocoder.geocode({ 'address': this.newMarkerAddress }, (results, status) => {
      if (status.toString() === 'OK') {
        searchBoxEl.value = results[0].formatted_address;
        this.newMarkerAddress = results[0].formatted_address;
        this.map.setCenter(results[0].geometry.location);
        // TODO make this zoom value dynamic based on the closest geocode result
        this.map.setZoom(17);
        if (this.isCreatingPin) {
          this.markers.push(new google.maps.Marker({
            position: results[0].geometry.location,
            map: this.map,
            icon: this.easyDataImgPath + "newpin.png",
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
      thisRef.newMarkerSave(thisRef.markers.length - 1);
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
    <div id="newMarkerInfoWindow">
      <!--<input _ngcontent-c1 id="newMarkerName" title="New Customer Name" type="text" placeholder="Name"></br>-->
      <input _ngcontent-c1 id="newMarkerAddress" title="New Customer Address" type="text" placeholder="Address" value=""></br>
      <select _ngcontent-c1 id="newMarkerDisposition" title="New Customer Disposition">
        <option value="Not Set" selected="selected">Not Set</option>
        <option value="Appt Set">Appt Set</option>
        <option value="Moved In">Moved In</option>
        <option value="Followup Call">Followup Call</option>
        <option value="Jump Appt">Jump Appt</option>
      </select>
      <!--<input _ngcontent-c1 id="newMarkerPhone" title="New Customer Phone Number" type="text" placeholder="Phone Number">-->
      <!--<input _ngcontent-c1 id="newMarkerEmail" title="New Customer Email Address" type="text" placeholder="Email (optional)">-->
      <button _ngcontent-c1 style="float: right" class="button-blue" title="Save" id="newMarkerSave"><i class="material-icons">save</i></button>
    </div>
    `;

    this.markerInfoWindowContent = `
    <div>
     <button _ngcontent-c1 class="button-blue" title="Open Directions" id="openExternalMaps"><i class="material-icons">navigation</i></button>
     <button _ngcontent-c1 class="button-blue" title="Customer Info" id="dispositionInfo"><i class="material-icons">person</i></button>
     <button _ngcontent-c1 class="button-blue" title="Call Customer" id="callCustomer"><i class="material-icons">phone</i></button>
    </div>
    `;
  }

  // Takes info entered by user in the newMarkerInfoWindowContent and creates a new activity
  newMarkerSave(index) {
    //var nameField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerName");
    var addressField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerAddress");
    var dispositionField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerDisposition");
    //var phoneField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerPhone");
    //var emailField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerEmail");

    this.activities.push({
      id: -1,
      ownerName: this.loggedInUser.logonName,
      contactName: "",//nameField.value,
      contactAddress: addressField.value,
      contactEmail: "",//emailField.value,
      contactPhones: [],//[phoneField.value],
      leadType: "testLead",
      status: ActivityStatus.LEAD,
      dispositionName: "Not Set",
      notes: "",
      latLng: new google.maps.LatLng(0, 0) // TODO Get actual lat long from Marker
    });
    var thisRef = this;
    this.markers[index].addListener('click', function () {
      thisRef.openMarkerInfowindow(index);
    });
    //console.log(this.activities[this.activities.length - 1])

    // Clear the new marker content
    this.newMarkerInfowindow.setContent(this.newMarkerInfoWindowContent);
    this.newMarkerInfowindow.close();
    this.openMarkerInfowindow(index);

    // TODO Push the newest activity to the EasyDataTracker side
  }

  openExternalMaps(index: number) {
    window.open("google.navigation:q=" + this.markers[index].getPosition().lat() + "," + this.markers[index].getPosition().lng());
    console.log("Navigating to : " + this.markers[index].getPosition().lat() + "," + this.markers[index].getPosition().lng());
  }
  dispositionInfo(index: number) {
    window.parent.location.href = "http://localhost:53312/WebApplication/SalesManageActivity.aspx?id=" + this.activities[index].id;
  }
  callCustomer(index: number) {
    if (this.activities[index].contactPhones[0] != null) {
      window.open("tel:" + this.activities[index].contactPhones[0]);
      console.log("Calling : " + this.activities[index].contactPhones[0]);
    }
  }

  openMarkerInfowindow(index: number) {
    this.markerInfowindow.setContent(this.markerInfoWindowContent);
    this.markerInfowindow.open(this.map, this.markers[index]);
    var thisRef = this;
    document.getElementById("openExternalMaps").addEventListener("click", function () {
      thisRef.openExternalMaps(index);
    });
    document.getElementById("dispositionInfo").addEventListener("click", function () {
      thisRef.dispositionInfo(index);
    });
    document.getElementById("callCustomer").addEventListener("click", function () {
      thisRef.callCustomer(index);
    });
  }

  updateUserLocation(thisRef: any) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        if (!thisRef.isLocationUpdated) {
          thisRef.map.setCenter(pos);
          thisRef.map.setZoom(17);
          thisRef.isLocationUpdated = true;
        }
        if (thisRef.userLocationPin) {
          thisRef.userLocationPin.setPosition(pos);
        }
        else {
          thisRef.userLocationPin = new google.maps.Marker({
            position: pos,
            map: thisRef.map,
            icon: thisRef.easyDataImgPath + "user dot.png"
          })
        }
      }, function () {
        thisRef.handleLocationError(true, thisRef);
      });
    } else {
      // Browser doesn't support Geolocation
      thisRef.handleLocationError(false, thisRef);
    }
  }

  handleLocationError(browserHasGeolocation, thisRef) {
    window.alert(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
    thisRef.isTrackingUserLocation = false;
  }

  checkUserLocationCheckbox() {
    if (this.isTrackingUserLocation) {
      if (this.userLocationPin && (this.userLocationPin.getMap() == null)) {
        this.userLocationPin.setMap(this.map);
      }
      this.updateUserLocation(this);
    }
    else if (this.userLocationPin) {
      this.userLocationPin.setMap(null);
      this.isLocationUpdated = false;
    }
  }

  userLocationCheckboxChange() {
    this.checkUserLocationCheckbox();
  }

}
