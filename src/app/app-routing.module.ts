import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuideFormComponent } from './components/guide-form/guide-form.component';
import { GuidePreviewComponent } from './components/guide-preview/guide-preview.component';

export const routes: Routes = [
  { path: '', component: GuideFormComponent },
  { path: 'preview', component: GuidePreviewComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 