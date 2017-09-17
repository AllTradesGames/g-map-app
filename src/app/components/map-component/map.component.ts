declare var MarkerClusterer: any;

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { } from '@types/googlemaps';
import '../../../assets/utilities/marker-clusterer.js'
import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs/Rx';

import { Pin, Activity, ActivityStatus, User, UserStatus, Permission } from '../../models';

@Component({
  selector: 'map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css', '../../app.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  isProduction: boolean = false;
  isMobileDevice: boolean = false;
  isTrackingUserLocation: boolean = false;
  isLocationUpdated: boolean = false;
  userLocationPin: google.maps.Marker;
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
  easyDataParentPath: string = this.isProduction ? "https://www.abpworkspace.com" : "http://localhost:60385";
  easyDataImgPath: string = this.isProduction ? "https://www.abpworkspace.com/img/" : "http://localhost:60385/WebApplication/img/";
  newMarkerAddress: string;
  markerAddress: string;
  clickedMarkerIndex: number = -1;;

  infoPanelPinImg: string;

  markerClusterer: any;

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
    this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!this.isProduction) {
      console.log("Send to Parent: AppLoaded");
    }

    window.parent.postMessage({
      "type": "AppLoaded"
    }, this.easyDataParentPath);

    // Add Event listener to new marker info windo 'X' Button
    google.maps.event.addListener(thisRef.newMarkerInfowindow, 'closeclick', function () {
      if (!this.isProduction) {
        console.log("Before: " + thisRef.markers.length);
      }
      thisRef.markers[thisRef.markers.length - 1].setMap(null); //removes the marker from map
      thisRef.markers.pop(); //removes the marker from array
      if (!this.isProduction) {
        console.log("After: " + thisRef.markers.length);
      }
    });
  }


  handleParentMessages(event) {
    if (!this.isProduction) {
      console.log("PARENT_MESSAGE: " + event.data.type);
      console.log(event.data);
    }
    switch (event.data.type) {

      case "InitialActivities":
        var dataArray = event.data.data;
        this.activities = dataArray.map((inputActivity) => {
          return inputActivity;
        });
        this.initializeMarkers();
        break;

      case "InitialUser":
        this.loggedInUser = event.data.data;
        if (!this.isProduction) {
          console.log(this.loggedInUser.logonName + " is logged in.");
        }
        break;

      case "NewActID":
        if (!this.isProduction) {
          console.log("Received new act id: " + event.data + "from parent");
        }
        break;
    }
  }


  // Creates the Marker array and fills it with Markers made from the Activity list
  initializeMarkers() {
    if (!this.isProduction) {
      console.log("initializeMarkers()");
    }
    this.markers = new Array<google.maps.Marker>();
    for (let ii: number = 0; ii < this.activities.length; ii++) {
      this.createMarkerFromActivity(ii);
    }

    this.setUserLocUpdateInterval(1000);
  }


  setUserLocUpdateInterval(interval: number) {
    Observable.interval(interval).subscribe(x => {
      this.checkUserLocationCheckbox();
    });
  }


  zoomToFitMarkers(markers: google.maps.Marker[]) {
    var bounds = new google.maps.LatLngBounds();
    for (let marker of markers) {
      if (marker)
        bounds.extend(marker.getPosition());
    }
    this.map.fitBounds(bounds);
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
          thisRef.clickedMarkerIndex = index;
          thisRef.openMarkerInfowindow(index);
          if (!this.isProduction) {
            console.log("marker " + index + " clicked");
          }
        });
        // If this is the last marker, zoom the map to fit all the markers
        if (index == this.activities.length - 1) {
          this.zoomToFitMarkers(this.markers);

          // TODO Initialize the marker clusterer
          //this.markerClusterer = new MarkerClusterer(this.map, this.markers, {imagePath: this.easyDataImgPath + 'cluster'});
        }
      }
      else {
        if (!this.isProduction) {
          console.log('Geocode was not successful for the following reason: ' + status);
        }
        if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
          setTimeout(function (thisRef, inputIndex) {
            thisRef.createMarkerFromActivity(inputIndex);
          }, 1100, this, index);
        }
      }
    });
  }


  // Handles map clicks for creating a new pin
  onMapClick($mapClick) {
    if (this.isCreatingPin == true) {
      this.geocoder.geocode({ 'location': $mapClick.latLng }, (results, status) => {
        if (status.toString() === 'OK') {
          var latLong = new google.maps.LatLng($mapClick.latLng.lat(), $mapClick.latLng.lng());
          this.markers.push(new google.maps.Marker({
            position: latLong,
            map: this.map,
            icon: this.easyDataImgPath + "newpin.png",
            animation: google.maps.Animation.DROP,
          }));
          this.newMarkerAddress = results[0].formatted_address;
          this.newMarkerWindowContent();
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
      this.isCreatingPin = false;
    }
    this.markerInfowindow.close();
    this.clickedMarkerIndex = -1;
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
      thisRef.createActivity(thisRef.markers.length - 1);
    });
    var newMarkerAddressEl: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerAddress");
    newMarkerAddressEl.value = thisRef.newMarkerAddress;
  }


  initInfoWindowContent() { // TODO create disposition dropdown from server mapping
    this.newMarkerInfoWindowContent = `
    <div id="newMarkerInfoWindow">
      <!--<input _ngcontent-c1 id="newMarkerName" title="New Customer Name" type="text" placeholder="Name"></br>-->
      <label style="font: bold 14px 'Roboto'; color: #00a3da;">Address: </label>
      <input _ngcontent-c1 id="newMarkerAddress" title="New Customer Address" type="text" placeholder="Address" value=""></br>
      <label style="font: bold 14px 'Roboto'; color: #00a3da;">Disposition: </label>
      <select _ngcontent-c1 id="newMarkerDisposition" title="New Customer Disposition">
        <option value="9">Appt Set</option>
        <option value="41">Followup Call</option>
        <option value="44">New Build</option>
        <option value="1" selected="selected">Not Set</option>
        <option value="8">NMI</option>
        <option value="16">No Show</option>
        <option value="7">Moved In</option>
        <option value="15">Visit</option>    
      </select>
      <!--<input _ngcontent-c1 id="newMarkerPhone" title="New Customer Phone Number" type="text" placeholder="Phone Number">-->
      <!--<input _ngcontent-c1 id="newMarkerEmail" title="New Customer Email Address" type="text" placeholder="Email (optional)">-->
      <button _ngcontent-c1 style="float: right" class="button-blue" title="Save" id="newMarkerSave"><i class="material-icons">save</i></button>
    </div>
    `;

    this.markerInfoWindowContent = `
    <div>
     <button _ngcontent-c1 class="button-blue" title="Open Directions" id="openExternalMaps"><i class="material-icons">navigation</i></button>
     <button _ngcontent-c1 class="button-blue" title="Customer Info" id="customerInfo"><i class="material-icons">person</i></button>
     <button _ngcontent-c1 class="button-blue" title="Call Customer" id="callCustomer"><i class="material-icons">phone</i></button>
    </div>
    `;
  }


  // Takes info entered by user in the newMarkerInfoWindowContent and creates a new activity
  createActivity(index) {
    //var nameField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerName");
    var addressField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerAddress");
    let dispositionField: any = document.getElementById("newMarkerDisposition");
    //var phoneField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerPhone");
    //var emailField: HTMLInputElement = <HTMLInputElement>document.getElementById("newMarkerEmail");

    this.markers[index].setIcon(this.easyDataImgPath + dispositionField.options[dispositionField.selectedIndex].text.toLowerCase() + ".png");

    var newActivity = {
      id: -1,
      ownerName: this.loggedInUser.logonName,
      contactName: "",//nameField.value,
      contactAddress: addressField.value,
      contactEmail: "",//emailField.value,
      contactPhones: [],//[phoneField.value],
      leadType: "Not Set",
      status: ActivityStatus.LEAD,
      dispositionName: dispositionField.options[dispositionField.selectedIndex].text,
      dispositionId: parseInt(dispositionField.value),
      notes: "",
      latitude: this.markers[index].getPosition().lat(),
      longitude: this.markers[index].getPosition().lng(),
    };

    // Save the new activity to the activity array
    this.activities.push(newActivity);

    // Send the new activity to the EasyDataTracker side
    window.parent.postMessage({
      "type": "SaveActivity",
      "data": JSON.stringify(newActivity)
    }, this.easyDataParentPath);
    if (!this.isProduction) {
      console.log("Send Activity to Server");
      console.log(newActivity);
    }

    /*var thisRef = this;
    this.markers[index].addListener('click', function () {
      thisRef.openMarkerInfowindow(index);
      // TODO BUGFIX
    });

    // Clear the new marker content
    this.newMarkerInfowindow.setContent(this.newMarkerInfoWindowContent);
    this.newMarkerInfowindow.close();
    this.openMarkerInfowindow(index);*/
  }


  deleteActivity(index) {
    this.markers[index].setMap(null);
    this.markers.splice(index, 1);
    this.activities.splice(index, 1);

    // Send the new activity to the EasyDataTracker side
    window.parent.postMessage({
      "type": "DeleteActivity",
      "data": this.activities[index].id
    }, this.easyDataParentPath);
    if (!this.isProduction) {
      console.log("Send Delete Activity (id:" + this.activities[index].id + ") Message to Server");
    }
  }


  openExternalMaps(index: number) {
    var thisRef = this;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        // Open Google Maps navigation
        window.open("https://google.com/maps/dir/?api=1&destination=" + thisRef.markers[index].getPosition().lat() + "," + thisRef.markers[index].getPosition().lng());
      }, function () {
        // User didn't allow Geolocation
        thisRef.handleLocationError(true, thisRef);
      });
    } else {
      // Browser doesn't support Geolocation
      thisRef.handleLocationError(false, thisRef);
    }
    if (!this.isProduction) {
      console.log("Navigating to : " + this.markers[index].getPosition().lat() + "," + this.markers[index].getPosition().lng());
    }
  }


  customerInfo(index: number) {
    if (this.activities[index].id > -1) {
      window.parent.location.href = this.easyDataParentPath + (this.isProduction ? "" : "/WebApplication") + "/SalesManageActivity.aspx?id=" + this.activities[index].id;
    }
  }


  callCustomer(index: number) {
    if (this.activities[index].contactPhones[0] != null) {
      window.open("tel:" + this.activities[index].contactPhones[0]);
      if (!this.isProduction) {
        console.log("Calling : " + this.activities[index].contactPhones[0]);
      }
    }
  }


  openMarkerInfowindow(index: number) {
    this.markerInfowindow.setContent(this.markerInfoWindowContent);
    this.markerInfowindow.open(this.map, this.markers[index]);
    var thisRef = this;
    document.getElementById("openExternalMaps").addEventListener("click", function () {
      thisRef.openExternalMaps(index);
    });
    document.getElementById("customerInfo").addEventListener("click", function () {
      thisRef.customerInfo(index);
    });
    document.getElementById("callCustomer").addEventListener("click", function () {
      thisRef.callCustomer(index);
    });

    document.getElementById("infoPanelName").innerHTML = thisRef.activities[index].contactName;
    document.getElementById("infoPanelAddress").innerHTML = thisRef.activities[index].contactAddress;
    document.getElementById("infoPanelDisposition").innerHTML = thisRef.activities[index].dispositionName;
    thisRef.infoPanelPinImg = thisRef.easyDataImgPath + thisRef.activities[index].dispositionName.toLowerCase() + ".png"
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
