import { Component, OnInit, Output } from '@angular/core';
import { CollaborationService } from 'src/app/services/collaboration.service';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

declare var ace: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  editor: any;
  languages = ['Java', 'Python2.7', 'C++'];
  language = 'Java';
  sessionId: string;
  output: string;

  defaultContent = {
    'Java': `public class Example {
      public static void main(String[] args) {
          // Type your Java code here
        }
    }`,

    'Python2.7': `class Solution:
    def example():
    # Type your Python 2.7 code here
    `,

    'C++': `#include <iostream>
    using namespace std;
    int mian() {
      //Type your C++ code here
      return 0;
    }
    `
  };

  constructor(private collaborationService: CollaborationService,
    private dataService: DataService,
    private activateRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activateRoute.params.subscribe(params => {
      this.sessionId = params['id'];
      this.initEditor();
    });
  }

  initEditor() {
    this.editor = ace.edit('editor');
    this.editor.setTheme('ace/theme/eclipse');
    this.resetEditor();
    document.getElementsByTagName('textarea')[0].focus();

    this.editor.lastAppliedChange = null;
    this.collaborationService.init(this.editor, this.sessionId);
    this.editor.on('change', e => {
      // console.log('editor changes: ' + JSON.stringify(e));
      if (this.editor.lastAppliedChange !== e) {
        this.collaborationService.change(JSON.stringify(e));
      }
    });
    this.editor.getSession().getSelection().on('changeCursor', () => {
      const cursor = this.editor.getSession().getSelection().getCursor();
      this.collaborationService.cursorMove(JSON.stringify(cursor));
    });
    this.collaborationService.restoreBuffer();
  }

  setLanguage(language: string): void {
    this.language = language;
    this.resetEditor();
  }

  resetEditor(): void {
    let lang: string;
    switch (this.language) {
      case 'Python2.7': lang = 'python'; break;
      case 'C++': lang = 'c_cpp'; break;
      default: lang = this.language;
    }
    this.editor.getSession().setMode('ace/mode/' + lang.toLowerCase());
    this.editor.setValue(this.defaultContent[this.language]);
    this.output = '';
  }

  submit(): void {
    const userCode = this.editor.getValue();
    const data = {
      user_code: userCode,
      lang: this.language.toLowerCase()
    };
    this.dataService.buildAndRun(data).then(res => {
      console.log(res);
      this.output = res.text;
    });
  }
}
