import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  inputSubject = new BehaviorSubject<string>('');

  constructor() { }

  setInput(term: string) {
    this.inputSubject.next(term);
  }

  getInput() {
    return this.inputSubject.asObservable();
  }
}
