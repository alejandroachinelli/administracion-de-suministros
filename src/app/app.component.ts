import { Component } from '@angular/core';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, DashboardComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'storey-challenge-achinelli';
  isSidebarOpen = false;
  isMobileMenuOpen = false;

  onMenuToggled(isOpen: boolean) {
    this.isMobileMenuOpen = isOpen;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
