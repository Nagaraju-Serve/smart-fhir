import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import FHIR from 'fhirclient';
import { fhirclient } from 'fhirclient/lib/types';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  public codeParam = '';
  myApp: any = {};

  ngOnInit(): void {
  //     FHIR.oauth2.ready()
  //       .then((client) => {
  //         debugger;
  //         this.myApp.smart = client;
  //         this.doRequests();
  //       })
  //       .then(console.log)
  //       .catch(console.error);

  }

  // async doRequests() {
  //   let loincs = [encodeURIComponent('http://loinc.org|4548-4')];
  //   let obs = await fetch(this.myApp.smart.state.serverUrl + "/Observation?patient="
  //     + this.myApp.patient.id + "&limit=50&code=" + loincs.join(','), {
  //     headers: {
  //       "Accept": "application/json-fhir",
  //       "Authorization": "Bearer" + this.myApp.smart.state.tokenResponse.access_token
  //     }
  //   }).then((data) => {
  //     console.log(data, 'ddddddreq');
  //     return data;
  //   })

  //   let response = await obs.json();

  //   console.log(response, 'response');

  //   let toInsert = "";


  //   if (!response.entry[0]) {
  //     toInsert += "we could not find you were tested HgAIC at this provider.";
  //   } else {
  //     toInsert += "Your HgAIC was tested on " + response.entry[0].resource.effectiveDateTime + "<br><br/>"
  //     toInsert += `<a href="'https:en.wikipedia.org/wiki/Glycated_hemoglobin'">According to wikipedia </a>, Alc is Measured`;

  //     const main = document.getElementById('main');
  //     if (main) {
  //       main.innerHTML = toInsert;
  //     }
  //   }
  // }

}
