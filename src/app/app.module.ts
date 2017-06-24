import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule, JsonpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MapComponent } from './components';
import { GoogleMapsGeocodingService } from './services';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    JsonpModule
  ],
  providers: [
    GoogleMapsGeocodingService
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
