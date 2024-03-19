import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientComponent } from './patient/patient.component';
import FHIR from 'fhirclient';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  code: string | null = null; // 42f3b173-16a8-4c50-a3ea-0269294cb869
  accesstoken = '';
  patient = '';
  patientdata: any = {};
  clientId = '058ab5b5-c78d-4b3b-91a1-8bd1daabc049'; // Replace with your client id 6961cae0-e756-4706-a6ac-6e82aaf0a2aa
  redirect = 'https://localhost:4200';
  response: any;
  orders: any;

  constructor(public dialog: MatDialog, private route: ActivatedRoute, private router: Router, private http: HttpClient) { }
  aud = 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';

  get authorizeLink(): string {
    // FHIR.oauth2.authorize({
    //   'clientId': this.clientId,
    //   'scope': 'patient.read patient.search observation.search servicerequest.search launch openid patient/*.read',
    //   'redirectUri': this.redirect,
    //   'iss': this.aud
    // })

    return `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?response_type=code&redirect_uri=${this.redirect}&iss=${this.aud}&aud=${this.aud}&client_id=${this.clientId}&state=1234&scope=launch/patient user/*.* patient/*.read patient.read patient.search servicerequest.read servicerequest.serach coverage.read`;
  }

  openModal(): void {
    const dialogRef = this.dialog.open(PatientComponent, {
      width: '100%', // Adjust width as needed
      // other configuration options
    });

    // Handle modal close event if needed
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  // ngOnInit(): void {
  //   FHIR.oauth2.ready().then((client) => {
  //     const access_token = client.state.tokenResponse?.access_token ?? "";
  //     this.doRequests(access_token);
  //   })
  // }

  // async doRequests(accessToken: string) {
  //   const patientID: string = "egqBHVfQlt4Bw3XGXoxVxHg3"; // Testing with sample patient from Epic's sandbox test data
  //   const obs = await fetch("https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/AllergyIntolerance?patient=" + patientID, {
  //     headers: {
  //       "Accept": "application/json+fhir",
  //       "Authorization": "Bearer " + accessToken
  //     }
  //   }).then(function (data) {
  //     console.log(data, '@@@@@@@@@@@@@@@');
      
  //     return data
  //   });
  // }

  ngOnInit(): void {
    const loc = location.href.replace('/?', '?');
    const url = new URL(loc);
    this.code = url.searchParams.get('code');


    // this.router.navigate([this.redirect], { replaceUrl: true })
    // console.log(this.router);
    const params = new URLSearchParams();
    // this.code = params.get('code');
    if (this.code) {
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', this.redirect);
      params.append('code', this.code);
      params.append('client_id', this.clientId);
      params.append('state', '1234');

      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      this.http.post('https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token', params.toString(), { headers })
        .subscribe(
          (response: any) => {
            console.log(response);
            this.accesstoken = response.access_token;
            this.getPatientData(response.access_token, response.patient)
            this.getServiceData(response.access_token, response.patient)
            this.getCoverageData(response.access_token, response.patient)
            this.patient = response.patient;
          });
    }

   const data = [
    {
        "link": [
            {
                "relation": "self",
                "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e3W5ur-tGNofDnjqfk8IyzNtVio3L6wbGxqfeBN3rKxY3"
            }
        ],
        "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e3W5ur-tGNofDnjqfk8IyzNtVio3L6wbGxqfeBN3rKxY3",
        "resource": {
            "resourceType": "ServiceRequest",
            "id": "e3W5ur-tGNofDnjqfk8IyzNtVio3L6wbGxqfeBN3rKxY3",
            "identifier": [
                {
                    "use": "usual",
                    "type": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                                "code": "PLAC",
                                "display": "Placer Identifier"
                            }
                        ],
                        "text": "Placer Identifier"
                    },
                    "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.798268",
                    "value": "794381"
                }
            ],
            "status": "active",
            "intent": "original-order",
            "category": [
                {
                    "coding": [
                        {
                            "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                            "code": "3",
                            "display": "Microbiology"
                        }
                    ],
                    "text": "Microbiology"
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://www.ama-assn.org/go/cpt",
                        "code": "87070",
                        "display": "CHG CULTURE SPEC, BACTERIA, NOT URINE,STOOL,BLOOD"
                    }
                ],
                "text": "SPUTUM CULTURE"
            },
            "quantityQuantity": {
                "value": 1
            },
            "subject": {
                "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                "display": "Link, John"
            },
            "encounter": {
                "reference": "Encounter/eFXLvVoOoA4UoHK7clPD4uA3",
                "identifier": {
                    "use": "usual",
                    "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                    "value": "139"
                },
                "display": "Hospital Encounter"
            },
            "occurrencePeriod": {
                "start": "2011-06-30T13:15:00Z",
                "end": "2011-07-01T04:59:59Z"
            },
            "authoredOn": "2011-06-30T13:03:47Z",
            "requester": {
                "reference": "Practitioner/e9s-IdXQOUVywHOVoisd6xQ3",
                "type": "Practitioner",
                "display": "Attending Physician Inpatient, MD"
            },
            "reasonCode": [
                {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "312342009",
                            "display": "Infective pneumonia (disorder)"
                        },
                        {
                            "system": "http://hl7.org/fhir/sid/icd-9-cm",
                            "code": "486",
                            "display": "Pneumonia, organism unspecified"
                        },
                        {
                            "system": "http://hl7.org/fhir/sid/icd-10-cm",
                            "code": "J18.9",
                            "display": "Pneumonia, organism unspecified"
                        }
                    ],
                    "text": "Pneumonia, organism unspecified"
                }
            ],
            "specimen": [
                {
                    "reference": "Specimen/eBGQdShdfP5AJpvw9JQa.0w3"
                }
            ]
        },
        "search": {
            "mode": "match"
        }
    },
   ]
    
    const filteredData = data.filter(item => item.resource.status === "active")
    .filter(item => item.resource.category && item.resource.category[0].coding[0].code === '7')
    .map(item => {
      const obj = {
          code: '',
          text: item.resource?.code?.text,
          display: ''
      };
      
      if (item.resource.reasonCode && item.resource.reasonCode.length > 0) {
          const icd10Code = item.resource.reasonCode[0].coding.find(code => code.system === "http://hl7.org/fhir/sid/icd-10-cm");
          if (icd10Code) {
              obj.code = icd10Code.code;
              obj.display = item.resource.reasonCode[0].text;
          } else {
              obj.code = 'no diagnosis associated';
              obj.display = 'no diagnosis associated';
          }
      } else {
          obj.code = 'no diagnosis associated';
          obj.display = 'no diagnosis associated';
      }
      
      return obj;
  });
  
  console.log(filteredData);

  }

  getMedicationRequestData = (token: string, patient: string) => {
    return this.http.get(`https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/MedicationRequest?patient=${patient}`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) })
      .subscribe(
        (response: any) => {
          this.response = response;
          console.log(response);
        }
      );
  }

  getPatientData = (token: string, patient: string) => {
    return this.http.get(`https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient?patient=${patient}`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) })
      .subscribe(
        (response: any) => {
          // this.response = response;
          console.log(response);
        }
      );
  }

  getServiceData = (token: string, patient: string) => {
    return this.http.get(`https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest?patient=${patient}`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) })
      .subscribe(
        (response: any) => {
          console.log(response);
        //   const filteredData = data.filter(item => item.resource.status === "active")
        //   .filter(item => item.resource.category && item.resource.category[0].coding[0].code === '7')
        //   .map(item => {
        //     const obj = {
        //         code: '',
        //         text: item.resource?.code?.text,
        //         display: ''
        //     };
            
        //     if (item.resource.reasonCode && item.resource.reasonCode.length > 0) {
        //         const icd10Code = item.resource.reasonCode[0].coding.find(code => code.system === "http://hl7.org/fhir/sid/icd-10-cm");
        //         if (icd10Code) {
        //             obj.code = icd10Code.code;
        //             obj.display = item.resource.reasonCode[0].text;
        //         } else {
        //             obj.code = 'no diagnosis associated';
        //             obj.display = 'no diagnosis associated';
        //         }
        //     } else {
        //         obj.code = 'no diagnosis associated';
        //         obj.display = 'no diagnosis associated';
        //     }
            
        //     return obj;
        // });
        }
      );
  }

  getCoverageData = (token: string, patient: string) => {
    return this.http.get(`https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Coverage?patient=${patient}`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) })
      .subscribe(
        (response: any) => {
          console.log(response);
        }
      );
  }
}
