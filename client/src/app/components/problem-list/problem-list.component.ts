import { Component, OnInit } from '@angular/core';
import {Problem} from '../../models/problem.model';
import { DataService } from 'src/app/services/data.service';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
@Component({
  selector: 'app-problem-list',
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.css']
})
export class ProblemListComponent implements OnInit {

  problems: Problem[];
  searchTerm = '';
  subscriptionProblems: Subscription;
  subscriptionSearchTerm: Subscription;

  constructor(private dataService: DataService,
    private searchService: SearchService) {  }

  ngOnInit() {
    this.getProblems();
    this.getSearchTerm();
  }

  getProblems(): void {
    this.subscriptionProblems = this.dataService
    .getProblems().subscribe(problems => {
      return this.problems = problems;
    });
    }

  getSearchTerm() {
    this.subscriptionSearchTerm = this.searchService.getInput().subscribe(
      term => {this.searchTerm = term; }
    );
  }

}
