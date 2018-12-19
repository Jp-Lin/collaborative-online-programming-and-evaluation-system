import { Component, OnInit } from '@angular/core';
import { Problem } from 'src/app/models/problem.model';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-problem-detail',
  templateUrl: './problem-detail.component.html',
  styleUrls: ['./problem-detail.component.css']
})
export class ProblemDetailComponent implements OnInit {

  problem: Problem;
  constructor(private activatedRoute: ActivatedRoute, private dataService: DataService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe( params =>
      this.dataService.getProblem(+params['id']).then(
        problem => {
          console.log(problem[0]);
          this.problem = problem[0];
        }
      )
      );
  }

}
