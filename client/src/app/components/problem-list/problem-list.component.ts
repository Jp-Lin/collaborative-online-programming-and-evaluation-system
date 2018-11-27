import { Component, OnInit } from '@angular/core';
import {Problem} from '../../models/problem.model';
import {PROBLEMS} from '../../problems.mock';
@Component({
  selector: 'app-problem-list',
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.css']
})
export class ProblemListComponent implements OnInit {

  problems: Problem[];

  constructor() { }

  ngOnInit() {
    this.problems = PROBLEMS;
  }

}
