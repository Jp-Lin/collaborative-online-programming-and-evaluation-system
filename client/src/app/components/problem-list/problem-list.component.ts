import { Component, OnInit } from '@angular/core';
import {Problem} from '../../models/problem.model';
import { DataService } from 'src/app/services/data.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-problem-list',
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.css']
})
export class ProblemListComponent implements OnInit {

  problems: Problem[];
  subscriptionProblems: Subscription;

  constructor(private dataService: DataService) {  }

  ngOnInit() {
    this.getProblems();
  }

  getProblems(): void {
    this.subscriptionProblems = this.dataService
    .getProblems().subscribe(problems => {
      return this.problems = problems;
    });
    }

}
