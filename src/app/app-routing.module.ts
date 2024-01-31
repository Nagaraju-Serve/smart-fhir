import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PatientComponent } from './patient/patient.component';
import { AppComponent } from './app.component';


const routes: Routes = [
  {
    path: '', component: AppComponent
  },
  {
    path: 'home', component: HomeComponent
  },
  {
    path: 'patient', component: PatientComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
