import { Injectable } from '@angular/core';
import { Problem } from '../models/problem.model';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private problemsSource = new BehaviorSubject<Problem[]>([]);

  constructor(private http: Http) {}

  getProblems(): Observable<Problem[]> {
    this.http.get('api/v1/problems')
    .toPromise()
    .then((res: Response) => {
      this.problemsSource.next(res.json());
    }).catch(this.handleError);

    return this.problemsSource.asObservable();

  }

  getProblem(id: number): Promise<Problem> {
    return this.http.get(`api/v1/problems/${id}`)
    .toPromise()
    .then((res: Response) => res.json())
    .catch(this.handleError);
  }

  addProblem( problem: Problem):  Promise<Problem> {
    const headers = new Headers({ 'content-type': 'application/json'});
    const options = new RequestOptions({headers: headers});

    return this.http.post('api/v1/problems', problem, options)
    .toPromise()
    .then((res: Response) => {
      this.getProblems();
      return res.json();
    })
    .catch(this.handleError);
  }

  buildAndRun(data: any): Promise<any> {
    const headers = new Headers({ 'content-type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/build_and_run', data, options)
    .toPromise()
    .then((res: Response) => {
      return res.json();
    })
    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.body || error);
  }
}
