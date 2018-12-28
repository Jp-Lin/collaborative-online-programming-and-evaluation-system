import { Injectable } from '@angular/core';
import { COLORS } from 'src/assets/colors';

declare var io: any;
declare var ace: any;

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
  collaborationSocket: any;
  clientsInfo = {};
  clientNum = 0;

  constructor() { }

  init(editor: any, sessionId: string): void {
    this.collaborationSocket = io(window.location.origin, { query: 'sessionId=' + sessionId });

    this.collaborationSocket.on('change', (delta: string) => {
      console.log('collaboration: editor changes by ' + delta);
      delta = JSON.parse(delta);
      editor.lastAppliedChange = delta;
      editor.getSession().getDocument().applyDeltas([delta]);
    });

    this.collaborationSocket.on('cursorMove', (cursor: string) => {
      console.log('cursor move: ' + cursor);
      const session = editor.getSession();
      cursor = JSON.parse(cursor);
      const x = cursor['row'];
      const y = cursor['column'];
      const changeClientId = cursor['socketId'];

      if (changeClientId in this.clientsInfo) {
        session.removeMarker(this.clientsInfo[changeClientId]['marker']);
      } else {
        this.clientsInfo[changeClientId] = {};
        const css = this.generateCursorStyle(changeClientId, this.clientNum);
        document.body.append(css);
        this.clientNum++;
      }

      const Range = ace.require('ace/range').Range;
      const newMarker = session.addMarker(
        new Range(x, y, x, y + 1), 'editor_cursor_' + changeClientId, true);
      this.clientsInfo[changeClientId]['marker'] = newMarker;
    });

    this.collaborationSocket.on('cursorDelete', (leaveClientId: string) => {
      const session = editor.getSession();
      console.log('socket: ' + leaveClientId + ' left.');
      if (leaveClientId in this.clientsInfo) {
        session.removeMarker(this.clientsInfo[leaveClientId]['marker']);
        delete this.clientsInfo[leaveClientId];
      }
    });
    // this.collaborationSocket.on('message', message => console.log('received: ' + message));
  }

  change(delta: string): void {
    this.collaborationSocket.emit('change', delta);
  }

  cursorMove(cursor: string): void {
    this.collaborationSocket.emit('cursorMove', cursor);
  }
  restoreBuffer(): void {
    this.collaborationSocket.emit('restoreBuffer');
  }

  generateCursorStyle(changeClientId: string, clientNum: number) {
    const css = document.createElement('style');
    css.type = 'text/css';
    css.innerHTML = '.editor_cursor_' + changeClientId
      + ' {position: absolute; background: ' + COLORS[clientNum] + ';'
      + 'z-index: 100; width: 3px !important; }';
    return css;
  }
}
