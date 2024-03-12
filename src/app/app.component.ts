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

    return `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?response_type=code&redirect_uri=${this.redirect}&iss=${this.aud}&aud=${this.aud}&client_id=${this.clientId}&state=1234&scope=launch/patient user/*.* patient/*.read patient.read patient.search servicerequest.read servicerequest.serach`;
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
            this.getMedicationRequestData(response.access_token, response.patient)
            this.getServiceData(response.access_token, response.patient)
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
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ezE671a8rDyzbjJs.2Gff446vd8Mq4lgwSAj.Regu8-M3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ezE671a8rDyzbjJs.2Gff446vd8Mq4lgwSAj.Regu8-M3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "ezE671a8rDyzbjJs.2Gff446vd8Mq4lgwSAj.Regu8-M3",
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
                      "value": "794401"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/e3W5ur-tGNofDnjqfk8IyzNtVio3L6wbGxqfeBN3rKxY3",
                      "display": "SPUTUM CULTURE"
                  }
              ],
              "status": "active",
              "intent": "order",
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
              "authoredOn": "2011-06-30T13:03:58Z",
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
                      "reference": "Specimen/e-EIxtgIKDZ4MtMTXRP8CBQ3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e5piVCDCPsvJU2ZgXgN2.wGwbWurRF9q9Q.bLBWAUIyo3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e5piVCDCPsvJU2ZgXgN2.wGwbWurRF9q9Q.bLBWAUIyo3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e5piVCDCPsvJU2ZgXgN2.wGwbWurRF9q9Q.bLBWAUIyo3",
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
                      "value": "794450"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "5",
                              "display": "Imaging"
                          }
                      ],
                      "text": "Imaging"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "33476"
                      }
                  ],
                  "text": "XR CHEST PA OR AP"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ez1jLLknrPbEi9709pWkKgA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "177"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2008-10-24T05:00:00Z"
              },
              "authoredOn": "2008-10-24T14:31:43Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "235595009",
                              "display": "Gastroesophageal reflux disease (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "530.81",
                              "display": "GERD (gastroesophageal reflux disease)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "K21.9",
                              "display": "GERD (gastroesophageal reflux disease)"
                          }
                      ],
                      "text": "GERD (gastroesophageal reflux disease)"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/em9QTDtwBKjI9jrvqDI76MsFcgJss6u7WY1NQNz2nqQ43"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/em9QTDtwBKjI9jrvqDI76MsFcgJss6u7WY1NQNz2nqQ43",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "em9QTDtwBKjI9jrvqDI76MsFcgJss6u7WY1NQNz2nqQ43",
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
                      "value": "794432"
                  }
              ],
              "status": "active",
              "intent": "original-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "5",
                              "display": "Imaging"
                          }
                      ],
                      "text": "Imaging"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "73560",
                          "display": "CHG X-RAY KNEE 1 OR 2 VIEW"
                      }
                  ],
                  "text": "XR KNEE 1 OR 2 VW LEFT"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/e48oiSFLwQPTpX6CFuh0C7Q3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "165"
                  },
                  "display": "Emergency"
              },
              "occurrencePeriod": {
                  "start": "2009-05-12T23:05:30Z",
                  "end": "2009-05-13T04:59:00Z"
              },
              "authoredOn": "2009-05-12T23:06:21Z",
              "requester": {
                  "reference": "Practitioner/e8bM9BibcJ25SLe6lJi5i9Q3",
                  "type": "Practitioner",
                  "display": "Attending Physician Emergency, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "127279002",
                              "display": "Injury of lower extremity (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "844.9",
                              "display": "Sprain and strain of unspecified site of knee and leg"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "IMO0002",
                              "display": "Sprain and strain of unspecified site of knee and leg"
                          }
                      ],
                      "text": "Sprain and strain of unspecified site of knee and leg"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eMr1IRDBqerHuPyTewt5Ss98K87BlpxpahMrGTcSHpow3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eMr1IRDBqerHuPyTewt5Ss98K87BlpxpahMrGTcSHpow3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eMr1IRDBqerHuPyTewt5Ss98K87BlpxpahMrGTcSHpow3",
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
                      "value": "794366"
                  }
              ],
              "status": "active",
              "intent": "original-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "5",
                              "display": "Imaging"
                          }
                      ],
                      "text": "Imaging"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "71020",
                          "display": "CHG CHEST X-RAY 2 VW"
                      },
                      {
                          "system": "http://loinc.org",
                          "code": "36643-5",
                          "display": "XR Chest 2 Views"
                      }
                  ],
                  "text": "XR CHEST PA AND LATERAL"
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
                  "start": "2011-06-30T12:37:21Z",
                  "end": "2011-07-01T04:59:00Z"
              },
              "authoredOn": "2011-06-30T12:38:13Z",
              "requester": {
                  "reference": "Practitioner/e8bM9BibcJ25SLe6lJi5i9Q3",
                  "type": "Practitioner",
                  "display": "Attending Physician Emergency, MD"
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eg.RzF7tmfaEZTDe2oNQnvmC0Bn7aw0oqySMx74bMtMg3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eg.RzF7tmfaEZTDe2oNQnvmC0Bn7aw0oqySMx74bMtMg3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eg.RzF7tmfaEZTDe2oNQnvmC0Bn7aw0oqySMx74bMtMg3",
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
                      "value": "794382"
                  }
              ],
              "status": "active",
              "intent": "original-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "5",
                              "display": "Imaging"
                          }
                      ],
                      "text": "Imaging"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "71020",
                          "display": "CHG CHEST X-RAY 2 VW"
                      },
                      {
                          "system": "http://loinc.org",
                          "code": "36643-5",
                          "display": "XR Chest 2 Views"
                      }
                  ],
                  "text": "XR CHEST PA AND LATERAL"
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
                  "start": "2011-06-30T13:03:42Z",
                  "end": "2011-07-01T04:59:00Z"
              },
              "asNeededBoolean": true,
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e5LLB.6IaIsmNUm0cWs83g58OJX-duv7qv-H.kNcLO583"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e5LLB.6IaIsmNUm0cWs83g58OJX-duv7qv-H.kNcLO583",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e5LLB.6IaIsmNUm0cWs83g58OJX-duv7qv-H.kNcLO583",
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
                      "value": "794443"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84450",
                          "display": "TRANSFERASE ASPARTATE AMINO (AST) (SGOT)"
                      }
                  ],
                  "text": "AST"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ez1jLLknrPbEi9709pWkKgA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "177"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2008-10-24T05:00:00Z"
              },
              "authoredOn": "2008-10-24T14:31:43Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/e2CDlnQZuKjzi4p5W6dJAVQ3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/exyqp1VcAZQPts2EChFQNfNGis6jg.tBQ69YXhHeojC83"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/exyqp1VcAZQPts2EChFQNfNGis6jg.tBQ69YXhHeojC83",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "exyqp1VcAZQPts2EChFQNfNGis6jg.tBQ69YXhHeojC83",
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
                      "value": "794444"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80061",
                          "display": "CHG LIPID PANEL"
                      }
                  ],
                  "text": "LIPID PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ez1jLLknrPbEi9709pWkKgA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "177"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2008-10-24T05:00:00Z"
              },
              "authoredOn": "2008-10-24T14:31:43Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eh7gIK8OlyNCG0awg9--Bhg3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eAYo.ZHriXFcr.hklPxAxi6DdthBLxA.Vn5mmVrmWro43"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eAYo.ZHriXFcr.hklPxAxi6DdthBLxA.Vn5mmVrmWro43",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eAYo.ZHriXFcr.hklPxAxi6DdthBLxA.Vn5mmVrmWro43",
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
                      "value": "794445"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "26604007",
                          "display": "CBC"
                      }
                  ],
                  "text": "CBC"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ez1jLLknrPbEi9709pWkKgA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "177"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2008-10-24T05:00:00Z"
              },
              "authoredOn": "2008-10-24T14:31:43Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eNWnb31A3YsKkUnS0QP3b8g3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/etb1XgzMJ3JUPvUE.pBSlGBCMXNtByF8.acMS7S1Cbi03"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/etb1XgzMJ3JUPvUE.pBSlGBCMXNtByF8.acMS7S1Cbi03",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "etb1XgzMJ3JUPvUE.pBSlGBCMXNtByF8.acMS7S1Cbi03",
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
                      "value": "794446"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "27171005",
                          "display": "URINALYSIS AUTO ONLY"
                      }
                  ],
                  "text": "URINALYSIS"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ez1jLLknrPbEi9709pWkKgA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "177"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2008-10-24T05:00:00Z"
              },
              "authoredOn": "2008-10-24T14:31:43Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eUXgLbR0yKT4PW1dRZ.sWKw3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eOTYzY7tMS-OlOXrz8hGq3IMH6z863fhXwGSySEjYy143"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eOTYzY7tMS-OlOXrz8hGq3IMH6z863fhXwGSySEjYy143",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eOTYzY7tMS-OlOXrz8hGq3IMH6z863fhXwGSySEjYy143",
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
                      "value": "794447"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84443",
                          "display": "CHG ASSAY THYROID STIM HORMONE"
                      }
                  ],
                  "text": "TSH"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ez1jLLknrPbEi9709pWkKgA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "177"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2008-10-24T05:00:00Z"
              },
              "authoredOn": "2008-10-24T14:31:43Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eaSyZ9Ibh.w6ur225m85kQw3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eCvXteJ7uGK8Ngdm6GGmeK7CFt07747K8rt9l6CdKAFk3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eCvXteJ7uGK8Ngdm6GGmeK7CFt07747K8rt9l6CdKAFk3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eCvXteJ7uGK8Ngdm6GGmeK7CFt07747K8rt9l6CdKAFk3",
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
                      "value": "794448"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80051",
                          "display": "CHG ELECTROLYTE PANEL"
                      }
                  ],
                  "text": "ELECTROLYTE PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ez1jLLknrPbEi9709pWkKgA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "177"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2008-10-24T05:00:00Z"
              },
              "authoredOn": "2008-10-24T14:31:43Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "235595009",
                              "display": "Gastroesophageal reflux disease (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "530.81",
                              "display": "GERD (gastroesophageal reflux disease)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "K21.9",
                              "display": "GERD (gastroesophageal reflux disease)"
                          }
                      ],
                      "text": "GERD (gastroesophageal reflux disease)"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/e-3s3dqYxhEji.0qs-cSWBA3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eymKKlFmyDGISD3AMrg3bm1rigfM8FUOhkZBb-6.HxGM3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eymKKlFmyDGISD3AMrg3bm1rigfM8FUOhkZBb-6.HxGM3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eymKKlFmyDGISD3AMrg3bm1rigfM8FUOhkZBb-6.HxGM3",
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
                      "value": "794449"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "43396009",
                          "display": "HEMOGLOBIN A1C"
                      },
                      {
                          "system": "http://loinc.org",
                          "code": "4548-4",
                          "display": "Hemoglobin A1c/Hemoglobin.total in Blood"
                      }
                  ],
                  "text": "HEMOGLOBIN A1C"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ez1jLLknrPbEi9709pWkKgA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "177"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2008-10-24T05:00:00Z"
              },
              "authoredOn": "2008-10-24T14:31:43Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eEDnj8dEXfC4lUIbZQZ-8Lg3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eV9uXHrrtOCcytunY6mFiPkl71O0RVE7RXP4pBqp-xPk3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eV9uXHrrtOCcytunY6mFiPkl71O0RVE7RXP4pBqp-xPk3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eV9uXHrrtOCcytunY6mFiPkl71O0RVE7RXP4pBqp-xPk3",
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
                      "value": "794439"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84443",
                          "display": "CHG ASSAY THYROID STIM HORMONE"
                      }
                  ],
                  "text": "TSH"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eOMMdvXsA8e5ZSJBUjmy5Fw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "168"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-02-08T06:00:00Z"
              },
              "authoredOn": "2009-02-08T23:41:11Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/ekzOJYUFQDW1sBsUQbwS1RQ3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eNW59t64AdqeiMZmtyTEKzI2n-gIgUZzAgHv.8EKWmRs3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eNW59t64AdqeiMZmtyTEKzI2n-gIgUZzAgHv.8EKWmRs3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eNW59t64AdqeiMZmtyTEKzI2n-gIgUZzAgHv.8EKWmRs3",
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
                      "value": "794440"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80051",
                          "display": "CHG ELECTROLYTE PANEL"
                      }
                  ],
                  "text": "ELECTROLYTE PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eOMMdvXsA8e5ZSJBUjmy5Fw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "168"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-02-08T06:00:00Z"
              },
              "authoredOn": "2009-02-08T23:41:11Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "235595009",
                              "display": "Gastroesophageal reflux disease (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "530.81",
                              "display": "GERD (gastroesophageal reflux disease)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "K21.9",
                              "display": "GERD (gastroesophageal reflux disease)"
                          }
                      ],
                      "text": "GERD (gastroesophageal reflux disease)"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eM6knIUawBDiTepjdhFIvxA3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eF1f2KJ6n0GFtH3NUElm8OLpP0UdGExLgC-EiGllmbHc3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eF1f2KJ6n0GFtH3NUElm8OLpP0UdGExLgC-EiGllmbHc3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eF1f2KJ6n0GFtH3NUElm8OLpP0UdGExLgC-EiGllmbHc3",
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
                      "value": "794437"
                  }
              ],
              "status": "revoked",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "doNotPerform": true,
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84443",
                          "display": "CHG ASSAY THYROID STIM HORMONE"
                      }
                  ],
                  "text": "TSH"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eOMMdvXsA8e5ZSJBUjmy5Fw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "168"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-02-08T06:00:00Z"
              },
              "authoredOn": "2009-02-08T23:32:49Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "specimen": [
                  {
                      "reference": "Specimen/e9p83FFPS8jbZMtdZAJ-frA3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eocdQNP6LPJqu1AXG2Nh1cGqnM0MiA7.IPS0mQr5e5qk3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eocdQNP6LPJqu1AXG2Nh1cGqnM0MiA7.IPS0mQr5e5qk3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eocdQNP6LPJqu1AXG2Nh1cGqnM0MiA7.IPS0mQr5e5qk3",
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
                      "value": "794438"
                  }
              ],
              "status": "revoked",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "doNotPerform": true,
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80051",
                          "display": "CHG ELECTROLYTE PANEL"
                      }
                  ],
                  "text": "ELECTROLYTE PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eOMMdvXsA8e5ZSJBUjmy5Fw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "168"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-02-08T06:00:00Z"
              },
              "authoredOn": "2009-02-08T23:32:49Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "specimen": [
                  {
                      "reference": "Specimen/eWG-QtgIy9VQlgII9N3NJig3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/efZwaXJ8Ep5NJX-8UBLYNSPnJC9mbMpYvFbYcyAdXiig3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/efZwaXJ8Ep5NJX-8UBLYNSPnJC9mbMpYvFbYcyAdXiig3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "efZwaXJ8Ep5NJX-8UBLYNSPnJC9mbMpYvFbYcyAdXiig3",
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
                      "value": "794430"
                  }
              ],
              "status": "revoked",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "doNotPerform": true,
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84443",
                          "display": "CHG ASSAY THYROID STIM HORMONE"
                      }
                  ],
                  "text": "TSH"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eDN25rwOoQ4nL4cUoi-B1Mg3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "163"
                  },
                  "display": "Orders Only"
              },
              "occurrencePeriod": {
                  "start": "2009-05-19T05:00:00Z"
              },
              "authoredOn": "2009-05-19T14:41:55Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "specimen": [
                  {
                      "reference": "Specimen/eF4xMIq.TFE79skxERNSF0A3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e5dwI8R82sxCgguZ1tCph0uoqKuTtuQEoHTSZy.qNxSg3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e5dwI8R82sxCgguZ1tCph0uoqKuTtuQEoHTSZy.qNxSg3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e5dwI8R82sxCgguZ1tCph0uoqKuTtuQEoHTSZy.qNxSg3",
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
                      "value": "794431"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84443",
                          "display": "CHG ASSAY THYROID STIM HORMONE"
                      }
                  ],
                  "text": "TSH"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eDN25rwOoQ4nL4cUoi-B1Mg3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "163"
                  },
                  "display": "Orders Only"
              },
              "occurrencePeriod": {
                  "start": "2009-05-19T05:00:00Z"
              },
              "authoredOn": "2009-05-19T14:42:46Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "40930008",
                              "display": "Hypothyroidism (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "244.9",
                              "display": "Unspecified hypothyroidism"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "E03.9",
                              "display": "Unspecified hypothyroidism"
                          }
                      ],
                      "text": "Unspecified hypothyroidism"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/e3sT4AYidcVxEUDbib9C9hg3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e6LdMcfgvW3QD9XqDTvjTcEUryjgXV.zbY32C84m2sQc3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e6LdMcfgvW3QD9XqDTvjTcEUryjgXV.zbY32C84m2sQc3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e6LdMcfgvW3QD9XqDTvjTcEUryjgXV.zbY32C84m2sQc3",
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
                      "value": "794421"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "26604007",
                          "display": "CBC"
                      }
                  ],
                  "text": "CBC"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eFMZOga-s.l5EzY5XVqWtAw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "156"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-11-11T06:00:00Z"
              },
              "authoredOn": "2009-11-11T16:40:18Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eNwznrGF7iMhm-O2n9ZjB9g3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eY-EsmpH0OO87pYU7bi.TJgXPHIz-V37MXml.NUc-fIg3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eY-EsmpH0OO87pYU7bi.TJgXPHIz-V37MXml.NUc-fIg3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eY-EsmpH0OO87pYU7bi.TJgXPHIz-V37MXml.NUc-fIg3",
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
                      "value": "794422"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84443",
                          "display": "CHG ASSAY THYROID STIM HORMONE"
                      }
                  ],
                  "text": "TSH"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eFMZOga-s.l5EzY5XVqWtAw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "156"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-11-11T06:00:00Z"
              },
              "authoredOn": "2009-11-11T16:40:18Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "40930008",
                              "display": "Hypothyroidism (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "244.9",
                              "display": "Unspecified hypothyroidism"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "E03.9",
                              "display": "Unspecified hypothyroidism"
                          }
                      ],
                      "text": "Unspecified hypothyroidism"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eegJPKj-165P8n1iHTMmeGA3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/egnfN6cr52fQNyVsjERh4rBxZFWxrlo6Vqij30FfkrEo3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/egnfN6cr52fQNyVsjERh4rBxZFWxrlo6Vqij30FfkrEo3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "egnfN6cr52fQNyVsjERh4rBxZFWxrlo6Vqij30FfkrEo3",
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
                      "value": "794423"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80051",
                          "display": "CHG ELECTROLYTE PANEL"
                      }
                  ],
                  "text": "ELECTROLYTE PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eFMZOga-s.l5EzY5XVqWtAw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "156"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-11-11T06:00:00Z"
              },
              "authoredOn": "2009-11-11T16:40:18Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eP5fNGkurNVJ1RrssCZcdqA3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eiuRaSpfeBSmaJj3H3gz6IDOTiMh3M9HCmau1m3XVCX03"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eiuRaSpfeBSmaJj3H3gz6IDOTiMh3M9HCmau1m3XVCX03",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eiuRaSpfeBSmaJj3H3gz6IDOTiMh3M9HCmau1m3XVCX03",
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
                      "value": "794424"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84450",
                          "display": "TRANSFERASE ASPARTATE AMINO (AST) (SGOT)"
                      }
                  ],
                  "text": "AST"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eFMZOga-s.l5EzY5XVqWtAw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "156"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-11-11T06:00:00Z"
              },
              "authoredOn": "2009-11-11T16:40:18Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eqDcvpxxrcVv0IhFQZutziQ3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eJGh1ZNLCdxQlQjxwVQUlIWViWT9yXBSHkaOoZJyvgQQ3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eJGh1ZNLCdxQlQjxwVQUlIWViWT9yXBSHkaOoZJyvgQQ3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eJGh1ZNLCdxQlQjxwVQUlIWViWT9yXBSHkaOoZJyvgQQ3",
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
                      "value": "794425"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "27171005",
                          "display": "URINALYSIS"
                      }
                  ],
                  "text": "URINALYSIS"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eFMZOga-s.l5EzY5XVqWtAw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "156"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-11-11T06:00:00Z"
              },
              "authoredOn": "2009-11-11T16:40:18Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eDPR.69092dLjsIBxn.VeDQ3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eA2mPw68-4S6fW4DAKdOhxQxPegLFf7P9CoJthF1MGUc3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eA2mPw68-4S6fW4DAKdOhxQxPegLFf7P9CoJthF1MGUc3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eA2mPw68-4S6fW4DAKdOhxQxPegLFf7P9CoJthF1MGUc3",
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
                      "value": "794426"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80061",
                          "display": "CHG LIPID PANEL"
                      }
                  ],
                  "text": "LIPID PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eFMZOga-s.l5EzY5XVqWtAw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "156"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-11-11T06:00:00Z"
              },
              "authoredOn": "2009-11-11T16:40:18Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/ef0XFuGWMeA9mD6TI5bBIuA3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eVtnT66J.QECYpYNUYyx7O4BX1mc84bpDP4366BkM7HE3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eVtnT66J.QECYpYNUYyx7O4BX1mc84bpDP4366BkM7HE3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eVtnT66J.QECYpYNUYyx7O4BX1mc84bpDP4366BkM7HE3",
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
                      "value": "794364"
                  }
              ],
              "status": "completed",
              "intent": "original-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "26604007",
                          "display": "CBC"
                      }
                  ],
                  "text": "CBC"
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
                  "start": "2011-06-30T12:45:00Z",
                  "end": "2011-07-01T04:59:59Z"
              },
              "authoredOn": "2011-06-30T12:38:13Z",
              "requester": {
                  "reference": "Practitioner/e8bM9BibcJ25SLe6lJi5i9Q3",
                  "type": "Practitioner",
                  "display": "Attending Physician Emergency, MD"
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
                      "reference": "Specimen/eFwCjFFxyxY2VO.N0CVB7Iw3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eadY4cE4UonM0XbQDJDadMg7YaNpvdM-2UYD6oy3Btsw3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eadY4cE4UonM0XbQDJDadMg7YaNpvdM-2UYD6oy3Btsw3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eadY4cE4UonM0XbQDJDadMg7YaNpvdM-2UYD6oy3Btsw3",
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
                      "value": "794365"
                  }
              ],
              "status": "completed",
              "intent": "original-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80048",
                          "display": "CHG BASIC METABOLIC PANEL CALCIUM TOTAL"
                      }
                  ],
                  "text": "BASIC METABOLIC PANEL"
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
                  "start": "2011-06-30T12:45:00Z",
                  "end": "2011-07-01T04:59:59Z"
              },
              "authoredOn": "2011-06-30T12:38:13Z",
              "requester": {
                  "reference": "Practitioner/e8bM9BibcJ25SLe6lJi5i9Q3",
                  "type": "Practitioner",
                  "display": "Attending Physician Emergency, MD"
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
                      "reference": "Specimen/ezJh8hG0ap8qMB54rXYfd1g3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/efGldv1ig7i3TISPNHcrLdkmgp-XLImtzyfaZkzaliJg3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/efGldv1ig7i3TISPNHcrLdkmgp-XLImtzyfaZkzaliJg3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "efGldv1ig7i3TISPNHcrLdkmgp-XLImtzyfaZkzaliJg3",
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
                      "value": "794368"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eadY4cE4UonM0XbQDJDadMg7YaNpvdM-2UYD6oy3Btsw3",
                      "display": "BASIC METABOLIC PANEL"
                  }
              ],
              "status": "active",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80048",
                          "display": "CHG BASIC METABOLIC PANEL CALCIUM TOTAL"
                      }
                  ],
                  "text": "BASIC METABOLIC PANEL"
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
                  "start": "2011-06-30T12:45:00Z",
                  "end": "2011-07-01T04:59:59Z"
              },
              "authoredOn": "2011-06-30T12:38:19Z",
              "requester": {
                  "reference": "Practitioner/e8bM9BibcJ25SLe6lJi5i9Q3",
                  "type": "Practitioner",
                  "display": "Attending Physician Emergency, MD"
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
                      "reference": "Specimen/enfd9z9mL6xh4GyLedFNVzA3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ek35L2pi3c9wdB.GM87sp8IDrC7tzCp-Z4fEsKUs8CB43"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ek35L2pi3c9wdB.GM87sp8IDrC7tzCp-Z4fEsKUs8CB43",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "ek35L2pi3c9wdB.GM87sp8IDrC7tzCp-Z4fEsKUs8CB43",
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
                      "value": "794367"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eVtnT66J.QECYpYNUYyx7O4BX1mc84bpDP4366BkM7HE3",
                      "display": "CBC"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "26604007",
                          "display": "CBC"
                      }
                  ],
                  "text": "CBC"
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
                  "start": "2011-06-30T12:45:00Z",
                  "end": "2011-07-01T04:59:59Z"
              },
              "authoredOn": "2011-06-30T12:38:19Z",
              "requester": {
                  "reference": "Practitioner/e8bM9BibcJ25SLe6lJi5i9Q3",
                  "type": "Practitioner",
                  "display": "Attending Physician Emergency, MD"
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
                      "reference": "Specimen/e0hwC5-qca8sbLPAFF5U5iw3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e9M-Tc48XxM1siSXCXRdvt9gwNoyRfPB.Ae0dxdyjZyc3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e9M-Tc48XxM1siSXCXRdvt9gwNoyRfPB.Ae0dxdyjZyc3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e9M-Tc48XxM1siSXCXRdvt9gwNoyRfPB.Ae0dxdyjZyc3",
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
                      "value": "794353"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84443",
                          "display": "CHG ASSAY THYROID STIM HORMONE"
                      }
                  ],
                  "text": "TSH"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ezvr6nnFJ7GR4cx50X2x11g3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "137"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2011-07-06T05:00:00Z"
              },
              "authoredOn": "2011-07-06T15:42:17Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eShQzSGwiEcIriKtrZcPOTw3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ed55m5kzIFkmrzkybtMP8BaU4PMP17T1wROgHkG1BLmQ3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ed55m5kzIFkmrzkybtMP8BaU4PMP17T1wROgHkG1BLmQ3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "ed55m5kzIFkmrzkybtMP8BaU4PMP17T1wROgHkG1BLmQ3",
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
                      "value": "794350"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "26604007",
                          "display": "CBC"
                      }
                  ],
                  "text": "CBC"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ezvr6nnFJ7GR4cx50X2x11g3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "137"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2011-07-06T05:00:00Z"
              },
              "authoredOn": "2011-07-06T15:42:17Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eNMUrbNTSGvYW2ItaeFtJ9Q3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eRpZHtCpyAVsiNrOxruYJMtWKXR-hIOymGwfJLQfITr83"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eRpZHtCpyAVsiNrOxruYJMtWKXR-hIOymGwfJLQfITr83",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eRpZHtCpyAVsiNrOxruYJMtWKXR-hIOymGwfJLQfITr83",
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
                      "value": "794351"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80061",
                          "display": "CHG LIPID PANEL"
                      }
                  ],
                  "text": "LIPID PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ezvr6nnFJ7GR4cx50X2x11g3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "137"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2011-07-06T05:00:00Z"
              },
              "authoredOn": "2011-07-06T15:42:17Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "13644009",
                              "display": "Hypercholesterolemia (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "272.0",
                              "display": "Hypercholesteremia"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "E78.00",
                              "display": "Hypercholesteremia"
                          }
                      ],
                      "text": "Hypercholesteremia"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/e6egdqwQj4tIZDwJj.0JSzw3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e4zo5a4uZph7zhxWyTwKElhooyWrmSerJb.sZhr09AmM3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e4zo5a4uZph7zhxWyTwKElhooyWrmSerJb.sZhr09AmM3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e4zo5a4uZph7zhxWyTwKElhooyWrmSerJb.sZhr09AmM3",
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
                      "value": "794352"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80051",
                          "display": "CHG ELECTROLYTE PANEL"
                      }
                  ],
                  "text": "ELECTROLYTE PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/ezvr6nnFJ7GR4cx50X2x11g3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "137"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2011-07-06T05:00:00Z"
              },
              "authoredOn": "2011-07-06T15:42:17Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "235595009",
                              "display": "Gastroesophageal reflux disease (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "530.81",
                              "display": "GERD (gastroesophageal reflux disease)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "K21.9",
                              "display": "GERD (gastroesophageal reflux disease)"
                          }
                      ],
                      "text": "GERD (gastroesophageal reflux disease)"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "13644009",
                              "display": "Hypercholesterolemia (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "272.0",
                              "display": "Hypercholesteremia"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "E78.00",
                              "display": "Hypercholesteremia"
                          }
                      ],
                      "text": "Hypercholesteremia"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/e1xYxQAebC6NERx8AqQCWDQ3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eRELKptYDQsgA98vV8N.n4hF5C06kaqS0nJDHecDUzGs3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eRELKptYDQsgA98vV8N.n4hF5C06kaqS0nJDHecDUzGs3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eRELKptYDQsgA98vV8N.n4hF5C06kaqS0nJDHecDUzGs3",
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
                      "value": "794345"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84450",
                          "display": "CHG TRANSFERASE ASPARTATE AMINO (AST) (SGOT)"
                      }
                  ],
                  "text": "AST"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/e2azQuJzUuyq04iEmlk.6bQ3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "135"
                  },
                  "display": "Orders Only"
              },
              "occurrencePeriod": {
                  "start": "2011-09-24T05:00:00Z"
              },
              "authoredOn": "2011-09-24T16:20:17Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "13644009",
                              "display": "Hypercholesterolemia (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "272.0",
                              "display": "Hypercholesteremia"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "E78.00",
                              "display": "Hypercholesteremia"
                          }
                      ],
                      "text": "Hypercholesteremia"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/e3xWwBlV2ShbWixqdH-VbiA3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ewU57AFRegUvyb7WSopw-rrvDM5WKk0b7ndi4fMxVieo3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ewU57AFRegUvyb7WSopw-rrvDM5WKk0b7ndi4fMxVieo3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "ewU57AFRegUvyb7WSopw-rrvDM5WKk0b7ndi4fMxVieo3",
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
                      "value": "794344"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80061",
                          "display": "CHG LIPID PANEL"
                      }
                  ],
                  "text": "LIPID PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/e2azQuJzUuyq04iEmlk.6bQ3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "135"
                  },
                  "display": "Orders Only"
              },
              "occurrencePeriod": {
                  "start": "2011-09-24T05:00:00Z"
              },
              "authoredOn": "2011-09-24T16:20:17Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "13644009",
                              "display": "Hypercholesterolemia (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "272.0",
                              "display": "Hypercholesteremia"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "E78.00",
                              "display": "Hypercholesteremia"
                          }
                      ],
                      "text": "Hypercholesteremia"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/emAlIcUTiBsxkPx-XstqhPQ3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eQfy8hOb8IeYw84EiWUOJozb3hPzcz2JRCHn-VMLRaRg3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eQfy8hOb8IeYw84EiWUOJozb3hPzcz2JRCHn-VMLRaRg3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eQfy8hOb8IeYw84EiWUOJozb3hPzcz2JRCHn-VMLRaRg3",
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
                      "value": "794339"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "26604007",
                          "display": "CBC"
                      }
                  ],
                  "text": "CBC"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eN0M-5hz4M.qAkrlkU-AmEA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "133"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2012-06-09T05:00:00Z"
              },
              "authoredOn": "2012-06-09T16:29:52Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "267432004",
                              "display": "Pure hypercholesterolemia (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "272.0",
                              "display": "Pure hypercholesterolemia"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "E78.00",
                              "display": "Pure hypercholesterolemia"
                          }
                      ],
                      "text": "Pure hypercholesterolemia"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "235595009",
                              "display": "Gastroesophageal reflux disease (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "530.81",
                              "display": "GERD (gastroesophageal reflux disease)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "K21.9",
                              "display": "GERD (gastroesophageal reflux disease)"
                          }
                      ],
                      "text": "GERD (gastroesophageal reflux disease)"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "110483000",
                              "display": "Tobacco user (finding)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "305.1",
                              "display": "Tobacco use disorder"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "F17.200",
                              "display": "Tobacco use disorder"
                          }
                      ],
                      "text": "Tobacco use disorder"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/edMo6xRgtrMuZYs0KPwUvMw3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eGZQw45xOg72Y8egVBw-fUu9qcgGn1Zvef0na7Ws5KGg3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eGZQw45xOg72Y8egVBw-fUu9qcgGn1Zvef0na7Ws5KGg3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eGZQw45xOg72Y8egVBw-fUu9qcgGn1Zvef0na7Ws5KGg3",
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
                      "value": "794340"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "84443",
                          "display": "CHG ASSAY THYROID STIM HORMONE"
                      }
                  ],
                  "text": "TSH"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eN0M-5hz4M.qAkrlkU-AmEA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "133"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2012-06-09T05:00:00Z"
              },
              "authoredOn": "2012-06-09T16:29:52Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "267432004",
                              "display": "Pure hypercholesterolemia (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "272.0",
                              "display": "Pure hypercholesterolemia"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "E78.00",
                              "display": "Pure hypercholesterolemia"
                          }
                      ],
                      "text": "Pure hypercholesterolemia"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "235595009",
                              "display": "Gastroesophageal reflux disease (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "530.81",
                              "display": "GERD (gastroesophageal reflux disease)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "K21.9",
                              "display": "GERD (gastroesophageal reflux disease)"
                          }
                      ],
                      "text": "GERD (gastroesophageal reflux disease)"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "110483000",
                              "display": "Tobacco user (finding)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "305.1",
                              "display": "Tobacco use disorder"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "F17.200",
                              "display": "Tobacco use disorder"
                          }
                      ],
                      "text": "Tobacco use disorder"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/e7ucLRbMn-ZlmfR37FeBiow3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eb73CqQo9FcJlQWX.YGA5IxYfwFG1LKSWXeOMqnWoGRw3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eb73CqQo9FcJlQWX.YGA5IxYfwFG1LKSWXeOMqnWoGRw3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eb73CqQo9FcJlQWX.YGA5IxYfwFG1LKSWXeOMqnWoGRw3",
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
                      "value": "794341"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80051",
                          "display": "CHG ELECTROLYTE PANEL"
                      }
                  ],
                  "text": "ELECTROLYTE PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eN0M-5hz4M.qAkrlkU-AmEA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "133"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2012-06-09T05:00:00Z"
              },
              "authoredOn": "2012-06-09T16:29:52Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "267432004",
                              "display": "Pure hypercholesterolemia (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "272.0",
                              "display": "Pure hypercholesterolemia"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "E78.00",
                              "display": "Pure hypercholesterolemia"
                          }
                      ],
                      "text": "Pure hypercholesterolemia"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "235595009",
                              "display": "Gastroesophageal reflux disease (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "530.81",
                              "display": "GERD (gastroesophageal reflux disease)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "K21.9",
                              "display": "GERD (gastroesophageal reflux disease)"
                          }
                      ],
                      "text": "GERD (gastroesophageal reflux disease)"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "110483000",
                              "display": "Tobacco user (finding)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "305.1",
                              "display": "Tobacco use disorder"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "F17.200",
                              "display": "Tobacco use disorder"
                          }
                      ],
                      "text": "Tobacco use disorder"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eMUZgUegiXUjiEI.iaIlOkQ3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eRsD4SX6MN-YsVFBeXCVwUvPX7NIt6Busq0jGuytS34c3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eRsD4SX6MN-YsVFBeXCVwUvPX7NIt6Busq0jGuytS34c3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eRsD4SX6MN-YsVFBeXCVwUvPX7NIt6Busq0jGuytS34c3",
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
                      "value": "794342"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "80061",
                          "display": "CHG LIPID PANEL"
                      }
                  ],
                  "text": "LIPID PANEL"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eN0M-5hz4M.qAkrlkU-AmEA3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "133"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2012-06-09T05:00:00Z"
              },
              "authoredOn": "2012-06-09T16:29:52Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "267432004",
                              "display": "Pure hypercholesterolemia (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "272.0",
                              "display": "Pure hypercholesterolemia"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "E78.00",
                              "display": "Pure hypercholesterolemia"
                          }
                      ],
                      "text": "Pure hypercholesterolemia"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "235595009",
                              "display": "Gastroesophageal reflux disease (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "530.81",
                              "display": "GERD (gastroesophageal reflux disease)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "K21.9",
                              "display": "GERD (gastroesophageal reflux disease)"
                          }
                      ],
                      "text": "GERD (gastroesophageal reflux disease)"
                  },
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "110483000",
                              "display": "Tobacco user (finding)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "305.1",
                              "display": "Tobacco use disorder"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "F17.200",
                              "display": "Tobacco use disorder"
                          }
                      ],
                      "text": "Tobacco use disorder"
                  }
              ],
              "specimen": [
                  {
                      "reference": "Specimen/eHDKdnApdPKy4evedYOckrw3"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eWJSlD6vNdLy4bDUXuuGDyVAUfEITY6kkKGpOARHR3eE3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eWJSlD6vNdLy4bDUXuuGDyVAUfEITY6kkKGpOARHR3eE3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eWJSlD6vNdLy4bDUXuuGDyVAUfEITY6kkKGpOARHR3eE3",
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
                      "value": "1065546"
                  }
              ],
              "status": "active",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "26604007",
                          "display": "CBC"
                      }
                  ],
                  "text": "CBC"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/es1LPiX3Roaql2o2yZcLVGQ3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "27534"
                  },
                  "display": "Hospital Encounter"
              },
              "occurrencePeriod": {
                  "start": "2019-05-10T05:00:00Z"
              },
              "authoredOn": "2019-05-10T16:25:55Z",
              "requester": {
                  "reference": "Practitioner/e9s-IdXQOUVywHOVoisd6xQ3",
                  "type": "Practitioner",
                  "display": "Attending Physician Inpatient, MD"
              },
              "specimen": [
                  {
                      "reference": "Specimen/ev.qTZU4qvAg3iCEPpJyvQYBkUWvUu0BZkPrGu8alYs03"
                  }
              ],
              "note": [
                  {
                      "text": "This order was created through External Result Entry"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eD2w75cxdXOBl9bQmdnH.RHo7kk.pRcVhMCdl1-Zcbgo3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eD2w75cxdXOBl9bQmdnH.RHo7kk.pRcVhMCdl1-Zcbgo3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eD2w75cxdXOBl9bQmdnH.RHo7kk.pRcVhMCdl1-Zcbgo3",
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
                      "value": "1065547"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "9564003",
                          "display": "CBC AND DIFFERENTIAL"
                      }
                  ],
                  "text": "CBC and differential"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/es1LPiX3Roaql2o2yZcLVGQ3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "27534"
                  },
                  "display": "Hospital Encounter"
              },
              "occurrencePeriod": {
                  "start": "2019-05-10T05:00:00Z"
              },
              "authoredOn": "2019-05-10T16:25:55Z",
              "requester": {
                  "reference": "Practitioner/e9s-IdXQOUVywHOVoisd6xQ3",
                  "type": "Practitioner",
                  "display": "Attending Physician Inpatient, MD"
              },
              "specimen": [
                  {
                      "reference": "Specimen/ey-FKkAWYINMr1pqrco25f9pZETbSX-zx-c1vdBzbqG03"
                  }
              ],
              "note": [
                  {
                      "text": "This order was created through External Result Entry"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ezmNCq9H0KAeFdTO7d9vvH8WCH.omQVKilfG8izYI-Yg3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ezmNCq9H0KAeFdTO7d9vvH8WCH.omQVKilfG8izYI-Yg3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "ezmNCq9H0KAeFdTO7d9vvH8WCH.omQVKilfG8izYI-Yg3",
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
                      "value": "1065548"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "26604007",
                          "display": "CBC"
                      }
                  ],
                  "text": "CBC"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/es1LPiX3Roaql2o2yZcLVGQ3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "27534"
                  },
                  "display": "Hospital Encounter"
              },
              "occurrencePeriod": {
                  "start": "2019-05-20T05:00:00Z"
              },
              "authoredOn": "2019-05-20T20:46:32Z",
              "requester": {
                  "reference": "Practitioner/e2qocqJm-DdjHLS0Not4qjA3",
                  "type": "Practitioner",
                  "display": "Historical Provider, MD"
              },
              "specimen": [
                  {
                      "reference": "Specimen/eAVdUqIltNYDppsbR2NR4RABWEU1zk1UOkUUBa4aup843"
                  }
              ],
              "note": [
                  {
                      "text": "This order was created through External Result Entry"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e1XDcrDcHOTG4qNlaQybTDHZKAcGui73r1HVfzrx.c0k3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e1XDcrDcHOTG4qNlaQybTDHZKAcGui73r1HVfzrx.c0k3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e1XDcrDcHOTG4qNlaQybTDHZKAcGui73r1HVfzrx.c0k3",
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
                      "value": "1065549"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "7",
                              "display": "Lab"
                          }
                      ],
                      "text": "Lab"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://snomed.info/sct",
                          "code": "26604007",
                          "display": "CBC"
                      }
                  ],
                  "text": "CBC"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/es1LPiX3Roaql2o2yZcLVGQ3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "27534"
                  },
                  "display": "Hospital Encounter"
              },
              "occurrencePeriod": {
                  "start": "2019-05-20T05:00:00Z"
              },
              "authoredOn": "2019-05-20T20:47:51Z",
              "requester": {
                  "reference": "Practitioner/e2qocqJm-DdjHLS0Not4qjA3",
                  "type": "Practitioner",
                  "display": "Historical Provider, MD"
              },
              "specimen": [
                  {
                      "reference": "Specimen/eNj.yorfUAzxGY7Pu9iKnU.dkFzp5rj36kEaTe6yrkNQ3"
                  }
              ],
              "note": [
                  {
                      "text": "This order was created through External Result Entry"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
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
                      "value": "794379"
                  }
              ],
              "status": "active",
              "intent": "original-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-06-30T15:00:00Z"
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e6QuDcX6QF7KIyD2-Dc4nuAwAXHg0Wxi3KQjW4osqyAk3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e6QuDcX6QF7KIyD2-Dc4nuAwAXHg0Wxi3KQjW4osqyAk3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e6QuDcX6QF7KIyD2-Dc4nuAwAXHg0Wxi3KQjW4osqyAk3",
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
                      "value": "794380"
                  }
              ],
              "status": "active",
              "intent": "original-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38887",
                          "display": "ABG DRAW"
                      }
                  ],
                  "text": "ABG"
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ewo4Iqpu40Dph3WZjc7GnZFTwPWdJA7ob4.IeDNyKMPM3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ewo4Iqpu40Dph3WZjc7GnZFTwPWdJA7ob4.IeDNyKMPM3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "ewo4Iqpu40Dph3WZjc7GnZFTwPWdJA7ob4.IeDNyKMPM3",
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
                      "value": "794391"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-06-30T15:00:00Z",
                  "end": "2011-07-01T04:59:59Z"
              },
              "authoredOn": "2011-06-30T13:03:57Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ecV2qJVGkU1.R0pKxP90JCYSGCHIBQm.lWXb7jSur7KQ3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ecV2qJVGkU1.R0pKxP90JCYSGCHIBQm.lWXb7jSur7KQ3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "ecV2qJVGkU1.R0pKxP90JCYSGCHIBQm.lWXb7jSur7KQ3",
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
                      "value": "794392"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-06-30T19:00:00Z",
                  "end": "2011-07-01T04:59:59Z"
              },
              "authoredOn": "2011-06-30T13:03:57Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/exZ1HhY14pKJPIfNzjuHrQgmBO9kkFr6hV2ZKhhhO9kA3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/exZ1HhY14pKJPIfNzjuHrQgmBO9kkFr6hV2ZKhhhO9kA3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "exZ1HhY14pKJPIfNzjuHrQgmBO9kkFr6hV2ZKhhhO9kA3",
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
                      "value": "794393"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-06-30T23:00:00Z",
                  "end": "2011-07-01T04:59:59Z"
              },
              "authoredOn": "2011-06-30T13:03:57Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eRoTYn4NabuARB6SCkFjIRRwYL5eRwHmHdLZkA6EU3fI3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eRoTYn4NabuARB6SCkFjIRRwYL5eRwHmHdLZkA6EU3fI3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eRoTYn4NabuARB6SCkFjIRRwYL5eRwHmHdLZkA6EU3fI3",
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
                      "value": "794394"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-01T03:00:00Z",
                  "end": "2011-07-01T04:59:59Z"
              },
              "authoredOn": "2011-06-30T13:03:57Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eqk2hTp0u7h.SmvfPG9d9C5dNbXuSxpnWcfmK26HtCVs3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eqk2hTp0u7h.SmvfPG9d9C5dNbXuSxpnWcfmK26HtCVs3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eqk2hTp0u7h.SmvfPG9d9C5dNbXuSxpnWcfmK26HtCVs3",
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
                      "value": "794395"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-01T11:00:00Z",
                  "end": "2011-07-02T04:59:59Z"
              },
              "authoredOn": "2011-06-30T13:03:58Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eKUYPrQd77xOP9xZAW6QmaWMaKuW6TWyOonD.EBhDOk43"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eKUYPrQd77xOP9xZAW6QmaWMaKuW6TWyOonD.EBhDOk43",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eKUYPrQd77xOP9xZAW6QmaWMaKuW6TWyOonD.EBhDOk43",
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
                      "value": "794396"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "completed",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-01T15:00:00Z",
                  "end": "2011-07-02T04:59:59Z"
              },
              "authoredOn": "2011-06-30T13:03:58Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eoIP0I0SxIRvdesaUR3yg7gP7pD1zmhGL6ZC86T6WGBQ3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eoIP0I0SxIRvdesaUR3yg7gP7pD1zmhGL6ZC86T6WGBQ3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eoIP0I0SxIRvdesaUR3yg7gP7pD1zmhGL6ZC86T6WGBQ3",
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
                      "value": "794397"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "completed",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-01T19:00:00Z",
                  "end": "2011-07-02T04:59:59Z"
              },
              "authoredOn": "2011-06-30T13:03:58Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eiPabYBeAfDgtV27UD3860d69cRiGyAvXojfI3BtU.xs3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eiPabYBeAfDgtV27UD3860d69cRiGyAvXojfI3BtU.xs3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eiPabYBeAfDgtV27UD3860d69cRiGyAvXojfI3BtU.xs3",
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
                      "value": "794398"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "completed",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-01T23:00:00Z",
                  "end": "2011-07-02T04:59:59Z"
              },
              "authoredOn": "2011-06-30T13:03:58Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eInG0wFLPsULYSRBEEKUwRFeOTYgnPfH.FCFMG1rWJvo3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eInG0wFLPsULYSRBEEKUwRFeOTYgnPfH.FCFMG1rWJvo3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eInG0wFLPsULYSRBEEKUwRFeOTYgnPfH.FCFMG1rWJvo3",
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
                      "value": "794399"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "completed",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-02T03:00:00Z",
                  "end": "2011-07-02T04:59:59Z"
              },
              "authoredOn": "2011-06-30T13:03:58Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eHSKHLs9vxqL-mAIPJ2SC6vTgOoPJhCuR0Zu-r22msiU3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eHSKHLs9vxqL-mAIPJ2SC6vTgOoPJhCuR0Zu-r22msiU3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eHSKHLs9vxqL-mAIPJ2SC6vTgOoPJhCuR0Zu-r22msiU3",
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
                      "value": "794400"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/e6QuDcX6QF7KIyD2-Dc4nuAwAXHg0Wxi3KQjW4osqyAk3",
                      "display": "ABG"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38887",
                          "display": "ABG DRAW"
                      }
                  ],
                  "text": "ABG"
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
              "authoredOn": "2011-06-30T13:03:58Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e5r28NI1XB3Q4WZF8ZZCfbzyzrqN6A37WUKDLxImdWJg3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e5r28NI1XB3Q4WZF8ZZCfbzyzrqN6A37WUKDLxImdWJg3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e5r28NI1XB3Q4WZF8ZZCfbzyzrqN6A37WUKDLxImdWJg3",
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
                      "value": "794405"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-02T11:00:00Z",
                  "end": "2011-07-03T04:59:59Z"
              },
              "authoredOn": "2013-08-23T16:39:49Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/erYLzodqN6ePdrTWqy9uHmSbz5ySELAfnDXOHOfSc1mg3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/erYLzodqN6ePdrTWqy9uHmSbz5ySELAfnDXOHOfSc1mg3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "erYLzodqN6ePdrTWqy9uHmSbz5ySELAfnDXOHOfSc1mg3",
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
                      "value": "794406"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-02T15:00:00Z",
                  "end": "2011-07-03T04:59:59Z"
              },
              "authoredOn": "2013-08-23T16:39:49Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eZtdU3zhcrv-BgD6uDjJKPvfdvI6eSTHSq7wHm77zLY83"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eZtdU3zhcrv-BgD6uDjJKPvfdvI6eSTHSq7wHm77zLY83",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eZtdU3zhcrv-BgD6uDjJKPvfdvI6eSTHSq7wHm77zLY83",
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
                      "value": "794407"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-02T19:00:00Z",
                  "end": "2011-07-03T04:59:59Z"
              },
              "authoredOn": "2013-08-23T16:39:49Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eaKo4RKRek1a7CbUR7FzY6qU2dQH0fRsZz7xAUHXlJ603"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eaKo4RKRek1a7CbUR7FzY6qU2dQH0fRsZz7xAUHXlJ603",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eaKo4RKRek1a7CbUR7FzY6qU2dQH0fRsZz7xAUHXlJ603",
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
                      "value": "794408"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-02T23:00:00Z",
                  "end": "2011-07-03T04:59:59Z"
              },
              "authoredOn": "2013-08-23T16:39:49Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eD7GJj-2oPsr.-R6w3rEXWajpqGpIVyR197ApGtbDJSo3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eD7GJj-2oPsr.-R6w3rEXWajpqGpIVyR197ApGtbDJSo3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eD7GJj-2oPsr.-R6w3rEXWajpqGpIVyR197ApGtbDJSo3",
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
                      "value": "794409"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-03T03:00:00Z",
                  "end": "2011-07-03T04:59:59Z"
              },
              "authoredOn": "2013-08-23T16:39:49Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ebqBSe.t54TnC2CSnMjZi9lIpgtwx8umzOWScL0ylUCE3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/ebqBSe.t54TnC2CSnMjZi9lIpgtwx8umzOWScL0ylUCE3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "ebqBSe.t54TnC2CSnMjZi9lIpgtwx8umzOWScL0ylUCE3",
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
                      "value": "794410"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-03T11:00:00Z",
                  "end": "2011-07-04T04:59:59Z"
              },
              "authoredOn": "2013-08-23T16:39:49Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e4VAHLnKj3wQGSVWPhSMhm4p8e83wkvHqRnUQ0V4odCY3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e4VAHLnKj3wQGSVWPhSMhm4p8e83wkvHqRnUQ0V4odCY3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e4VAHLnKj3wQGSVWPhSMhm4p8e83wkvHqRnUQ0V4odCY3",
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
                      "value": "794411"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-03T15:00:00Z",
                  "end": "2011-07-04T04:59:59Z"
              },
              "authoredOn": "2013-08-23T16:39:49Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e7FwLbTb6-1u6i0XBXyGAQSkIAs1TwGcv3exR1se9COw3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e7FwLbTb6-1u6i0XBXyGAQSkIAs1TwGcv3exR1se9COw3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e7FwLbTb6-1u6i0XBXyGAQSkIAs1TwGcv3exR1se9COw3",
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
                      "value": "794412"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-03T19:00:00Z",
                  "end": "2011-07-04T04:59:59Z"
              },
              "authoredOn": "2013-08-23T16:39:49Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e7axXQLyrJsJVnm1mnzzwSDfO9cY9YAcQZasBn-sj.SM3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/e7axXQLyrJsJVnm1mnzzwSDfO9cY9YAcQZasBn-sj.SM3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "e7axXQLyrJsJVnm1mnzzwSDfO9cY9YAcQZasBn-sj.SM3",
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
                      "value": "794413"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-03T23:00:00Z",
                  "end": "2011-07-04T04:59:59Z"
              },
              "authoredOn": "2013-08-23T16:39:49Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/edZBt3V7ODKwcGWjLWnoyQAXaeOSLCIAu9HvMP.OZLko3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/edZBt3V7ODKwcGWjLWnoyQAXaeOSLCIAu9HvMP.OZLko3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "edZBt3V7ODKwcGWjLWnoyQAXaeOSLCIAu9HvMP.OZLko3",
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
                      "value": "794414"
                  }
              ],
              "basedOn": [
                  {
                      "reference": "ServiceRequest/eBfSjgJblWDiJGFVh2J-PVlPdF9AXnxOkNUWolTB0lWk3",
                      "display": "SIMPLE FACE MASK OXYGEN"
                  }
              ],
              "status": "active",
              "intent": "filler-order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "18",
                              "display": "Respiratory Care"
                          }
                      ],
                      "text": "Respiratory Care"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.696580",
                          "code": "38911",
                          "display": "SIMPLE FACE MASK OXYGEN"
                      }
                  ],
                  "text": "SIMPLE FACE MASK OXYGEN"
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
                  "start": "2011-07-04T03:00:00Z",
                  "end": "2011-07-04T04:59:59Z"
              },
              "authoredOn": "2013-08-23T16:39:49Z",
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
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "link": [
              {
                  "relation": "self",
                  "url": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eUlBQBsyTAMN3kjDMGEMV0VhFanaGTT2hJDT13xOI0iU3"
              }
          ],
          "fullUrl": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ServiceRequest/eUlBQBsyTAMN3kjDMGEMV0VhFanaGTT2hJDT13xOI0iU3",
          "resource": {
              "resourceType": "ServiceRequest",
              "id": "eUlBQBsyTAMN3kjDMGEMV0VhFanaGTT2hJDT13xOI0iU3",
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
                      "value": "794427"
                  }
              ],
              "status": "completed",
              "intent": "order",
              "category": [
                  {
                      "coding": [
                          {
                              "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.798268.30",
                              "code": "26",
                              "display": "Point of Care Testing"
                          }
                      ],
                      "text": "Point of Care Testing"
                  }
              ],
              "code": {
                  "coding": [
                      {
                          "system": "http://www.ama-assn.org/go/cpt",
                          "code": "81002",
                          "display": "CHG URINALYSIS NONAUTO W/O SCOPE"
                      }
                  ],
                  "text": "POCT URINALYSIS DIPSTICK"
              },
              "quantityQuantity": {
                  "value": 1
              },
              "subject": {
                  "reference": "Patient/eAvUWfcu91leGT9WRXi93zQ3",
                  "display": "Link, John"
              },
              "encounter": {
                  "reference": "Encounter/eFMZOga-s.l5EzY5XVqWtAw3",
                  "identifier": {
                      "use": "usual",
                      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8",
                      "value": "156"
                  },
                  "display": "Office Visit"
              },
              "occurrencePeriod": {
                  "start": "2009-11-11T06:00:00Z"
              },
              "authoredOn": "2009-11-11T16:40:18Z",
              "requester": {
                  "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
                  "type": "Practitioner",
                  "display": "Physician Family Medicine, MD"
              },
              "reasonCode": [
                  {
                      "coding": [
                          {
                              "system": "http://snomed.info/sct",
                              "code": "59621000",
                              "display": "Essential hypertension (disorder)"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-9-cm",
                              "code": "401.9",
                              "display": "Essential hypertension"
                          },
                          {
                              "system": "http://hl7.org/fhir/sid/icd-10-cm",
                              "code": "I10",
                              "display": "Essential hypertension"
                          }
                      ],
                      "text": "Essential hypertension"
                  }
              ]
          },
          "search": {
              "mode": "match"
          }
      },
      {
          "fullUrl": "urn:uuid:6fcb971b-4d33-4946-9517-841658599c0f",
          "resource": {
              "resourceType": "OperationOutcome",
              "issue": [
                  {
                      "severity": "warning",
                      "code": "suppressed",
                      "details": {
                          "coding": [
                              {
                                  "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.657369",
                                  "code": "59204",
                                  "display": "The authenticated client's search request applies to a sub-resource that the client is not authorized for. Results of this sub-type will not be returned."
                              }
                          ],
                          "text": "The authenticated client's search request applies to a sub-resource that the client is not authorized for. Results of this sub-type will not be returned."
                      },
                      "diagnostics": "Client not authorized for ServiceRequest - Community Resource ServiceRequest. Search results of this type have not been included."
                  },
                  {
                      "severity": "warning",
                      "code": "suppressed",
                      "details": {
                          "coding": [
                              {
                                  "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.657369",
                                  "code": "59204",
                                  "display": "The authenticated client's search request applies to a sub-resource that the client is not authorized for. Results of this sub-type will not be returned."
                              }
                          ],
                          "text": "The authenticated client's search request applies to a sub-resource that the client is not authorized for. Results of this sub-type will not be returned."
                      },
                      "diagnostics": "Client not authorized for ServiceRequest - Dental Procedure. Search results of this type have not been included."
                  },
                  {
                      "severity": "warning",
                      "code": "suppressed",
                      "details": {
                          "coding": [
                              {
                                  "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.657369",
                                  "code": "59204",
                                  "display": "The authenticated client's search request applies to a sub-resource that the client is not authorized for. Results of this sub-type will not be returned."
                              }
                          ],
                          "text": "The authenticated client's search request applies to a sub-resource that the client is not authorized for. Results of this sub-type will not be returned."
                      },
                      "diagnostics": "Client not authorized for ServiceRequest - Pregnancy Plans. Search results of this type have not been included."
                  }
              ]
          },
          "search": {
              "mode": "outcome"
          }
      }
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
          this.orders = response;
          console.log(response);
        }
      );
  }
}

const data = {
  "resourceType": "Patient",
  "id": "erXuFYUfucBZaryVksYEcMg3",
  "extension": [
    {
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "urn:oid:1.2.840.114350.1.13.0.1.7.10.698084.130.657370.19999000",
            "code": "female",
            "display": "female"
          }
        ]
      },
      "url": "http://open.epic.com/FHIR/StructureDefinition/extension/legal-sex"
    },
    {
      "extension": [
        {
          "valueCoding": {
            "system": "urn:oid:2.16.840.1.113883.6.238",
            "code": "2131-1",
            "display": "Other Race"
          },
          "url": "ombCategory"
        },
        {
          "valueString": "Other",
          "url": "text"
        }
      ],
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"
    },
    {
      "extension": [
        {
          "valueString": "Unknown",
          "url": "text"
        }
      ],
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"
    }
  ],
  "identifier": [
    {
      "use": "usual",
      "type": {
        "text": "EPIC"
      },
      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.5.737384.0",
      "value": "E4007"
    },
    {
      "use": "usual",
      "type": {
        "text": "EXTERNAL"
      },
      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.698084",
      "value": "Z6129"
    },
    {
      "use": "usual",
      "type": {
        "text": "FHIR"
      },
      "system": "http://open.epic.com/FHIR/StructureDefinition/patient-dstu2-fhir-id",
      "value": "TnOZ.elPXC6zcBNFMcFA7A5KZbYxo2.4T-LylRk4GoW4B"
    },
    {
      "use": "usual",
      "type": {
        "text": "FHIR STU3"
      },
      "system": "http://open.epic.com/FHIR/StructureDefinition/patient-fhir-id",
      "value": "erXuFYUfucBZaryVksYEcMg3"
    },
    {
      "use": "usual",
      "type": {
        "text": "INTERNAL"
      },
      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.698084",
      "value": "     Z6129"
    },
    {
      "use": "usual",
      "type": {
        "text": "EPI"
      },
      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.5.737384.14",
      "value": "203713"
    },
    {
      "use": "usual",
      "type": {
        "text": "MYCHARTLOGIN"
      },
      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.3.878082.110",
      "value": "FHIRCAMILA"
    },
    {
      "use": "usual",
      "type": {
        "text": "WPRINTERNAL"
      },
      "system": "urn:oid:1.2.840.114350.1.13.0.1.7.2.878082",
      "value": "736"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "text": "Camila Maria Lopez",
      "family": "Lopez",
      "given": [
        "Camila",
        "Maria"
      ]
    },
    {
      "use": "usual",
      "text": "Camila Maria Lopez",
      "family": "Lopez",
      "given": [
        "Camila",
        "Maria"
      ]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "469-555-5555",
      "use": "home"
    },
    {
      "system": "phone",
      "value": "469-888-8888",
      "use": "work"
    },
    {
      "system": "email",
      "value": "knixontestemail@epic.com",
      "rank": 1
    }
  ],
  "gender": "female",
  "birthDate": "1987-09-12",
  "deceasedBoolean": false,
  "address": [
    {
      "use": "home",
      "line": [
        "3268 West Johnson St.",
        "Apt 117"
      ],
      "city": "GARLAND",
      "district": "DALLAS",
      "state": "TX",
      "postalCode": "75043",
      "country": "US",
      "period": {
        "start": "2019-05-24"
      }
    },
    {
      "use": "old",
      "line": [
        "3268 West Johnson St.",
        "Apt 117"
      ],
      "city": "GARLAND",
      "district": "DALLAS",
      "state": "TX",
      "postalCode": "75043",
      "country": "US"
    }
  ],
  "maritalStatus": {
    "text": "Married"
  },
  "communication": [
    {
      "language": {
        "coding": [
          {
            "system": "urn:ietf:bcp:47",
            "code": "en",
            "display": "English"
          }
        ],
        "text": "English"
      },
      "preferred": true
    }
  ],
  "generalPractitioner": [
    {
      "reference": "Practitioner/eM5CWtq15N0WJeuCet5bJlQ3",
      "type": "Practitioner",
      "display": "Physician"
    }
  ],
  "managingOrganization": {
    "reference": "Organization/enRyWnSP963FYDpoks4NHOA3",
    "display": "EHS Service Area"
  }
}