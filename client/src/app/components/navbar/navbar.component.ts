import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  title = 'COJ';
  username = '';

  constructor(private authService: AuthService) {
    authService.handleAuthentication();
  }

  ngOnInit() {
    // if (this.authService.isAuthenticated()) {
      // this.authService.renewSession();
      // this.username = this.authService.getUser().nickname;
      // console.log(this.username);
      // console.log(this.authService.username);
    // }
  }

  login() {
    this.authService.login();
}

logout() {
  this.authService.logout();
}
}
