import * as vscode from 'vscode';
import { Gitlab } from 'gitlab';
import { StatusBar } from './views/statusbar';

export function activate(context: vscode.ExtensionContext) {

  const api = new Gitlab({
    url: 'https://git.ignimission.com',
    token: '4Xx2UU6Fp6dCn_i_mkY1'
  });

  StatusBar.initialize(context);
  console.log('Congratulations, your extension "gitlab-time-tracking" is now active!');


  context.subscriptions.push(
    vscode.commands.registerCommand('gitlab-time-tracking.calculateTimeSpent', () => {
      vscode.window.showInformationMessage('Hello, world!');
      // your logic to calculate and record time spent on a GitLab issue
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
