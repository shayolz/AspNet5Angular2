import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './AuthGard';
import { GhigoComponent } from './home-page/ghigo/ghigo.component';
import { MainContainerComponent } from './home-page/main-container/main-container.component';
import { SimoComponent } from './home-page/simo/simo.component';

const routes: Routes = [

  {
    path: 'login',
    loadChildren:() => import('./login/login.module').then(m=>m.LoginModule),
  },
  {path: '', component: MainContainerComponent, canActivate:[AuthGuard],
    children: [
      { path: 'ghigo', component: GhigoComponent },
      { path: 'simo', component: SimoComponent },
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
