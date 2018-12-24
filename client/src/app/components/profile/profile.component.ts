import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  resetMessage: string;
  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  resetPassword() {
    this.authService.resetPassword().subscribe(
    res => {
      this.resetMessage = res.text();
    }
    );
  }

}
