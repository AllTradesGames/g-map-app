import { Component, OnInit, AfterViewInit } from '@angular/core';
import { } from '@types/googlemaps';
import { FormsModule } from '@angular/forms';

import { Pin, Activity, ActivityStatus, User, UserStatus, Permission } from '../../models';

@Component({
  selector: 'info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.css']
})
export class InfoPanelComponent implements OnInit, AfterViewInit {

public currentPanel: number = 0;

  constructor() { }

  ngOnInit() {

  }
   ngAfterViewInit() {

   }
}
