import { Component, OnInit, OnDestroy } from '@angular/core';
import { Problem } from 'src/app/models/problem.model';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

const DEFAULT_PROBLEM: Problem = Object.freeze({
  id: 0,
  name: '',
  desc: '',
  difficulty: 'default'
});


@Component({
  selector: 'app-new-problem',
  templateUrl: './new-problem.component.html',
  styleUrls: ['./new-problem.component.css']
})
export class NewProblemComponent implements OnInit {

  public difficulties = ['Easy', 'Medium', 'Hard', 'Super'];
  newProblem: Problem = Object.assign({}, DEFAULT_PROBLEM);

  constructor(private dataServie: DataService, private authService: AuthService) {}

  ngOnInit() {
  }

  addProblem(): void {
    console.log(this.newProblem);
    this.dataServie.addProblem(this.newProblem).catch(err => console.log(err._body));
    this.newProblem = Object.assign({}, DEFAULT_PROBLEM);
  }
}
