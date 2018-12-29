import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormControl } from '@angular/forms';
import { SearchService } from 'src/app/services/search.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  title = 'COJ';
  username = '';
  searchValue = new FormControl('');
  subscriptiosSearchValue: Subscription;

  constructor(private authService: AuthService,
    private searchService: SearchService,
    private router: Router) {
    authService.handleAuthentication();
  }

  ngOnInit() {
    // if (this.authService.isAuthenticated()) {
    // this.authService.renewSession();
    // this.username = this.authService.getUser().nickname;
    // console.log(this.username);
    // console.log(this.authService.username);
    // }
    this.subscriptiosSearchValue = this.searchValue
      .valueChanges
      .pipe(debounceTime(200))
      .subscribe(
        (term: string) => { this.searchService.setInput(term); }
      );
  }

  ngOnDestroy() {
    this.subscriptiosSearchValue.unsubscribe();
  }

  searchProblem() {
    this.router.navigate(['/problems']);
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }
}
