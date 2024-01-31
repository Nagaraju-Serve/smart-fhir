import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientComponent } from './patient/patient.component';

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
  clientId = '42f3b173-16a8-4c50-a3ea-0269294cb869'; // Replace with your client id 6961cae0-e756-4706-a6ac-6e82aaf0a2aa
  redirect = 'http://localhost:3000';

  constructor(public dialog: MatDialog, private route: ActivatedRoute, private router: Router, private http: HttpClient) { }

  get authorizeLink(): string {
    return `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?response_type=code&redirect_uri=${this.redirect}&client_id=${this.clientId}&state=1234&scope=patient.read patient.search`;
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

  ngOnInit(): void {
    const loc = location.href.replace('/?', '?');
    const url = new URL(loc);
    this.code = url.searchParams.get('code');


    this.router.navigate([this.redirect], { replaceUrl: true })
    console.log(this.router);

    if (this.code) {
      const params = new URLSearchParams();
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
            this.patient = response.patient;
          });
    }

  }

  getPatientData = (token: string, patient: string) => {
    return this.http.get(`https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/${patient}`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) })
      .subscribe(
        (response: any) => {
          this.patientdata = response;
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