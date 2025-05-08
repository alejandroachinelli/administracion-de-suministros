import { Routes } from '@angular/router';

export const routes: Routes = [
    {
      path: '',
      redirectTo: 'suministros',
      pathMatch: 'full'
    },
    {
      path: 'suministros',
      loadComponent: () =>
        import('../../features/components/suministros/suministros.component').then(
          (m) => m.SuministrosComponent
        )
    }
];
