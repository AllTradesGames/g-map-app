import { Injectable } from '@angular/core';
import { Http, Request, Headers } from '@angular/http';

import { GoogleMapsApiConfig } from '../../google-maps-api-config'

@Injectable()
export class GoogleMapsGeocodingService {

    constructor(private http: Http) {}

    public getAddressFromLatLong(lat: number, long: number) {
        let apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + long + '&key=' + GoogleMapsApiConfig.apiKey;

        return this.http.get(apiUrl);
    }

}