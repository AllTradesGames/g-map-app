import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpModule, JsonpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MapComponent } from './components';
import { InfoPanelComponent } from './components';
import { GoogleMapsGeocodingService } from './services';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    InfoPanelComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    JsonpModule,
    FormsModule
  ],
  providers: [
    GoogleMapsGeocodingService
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
