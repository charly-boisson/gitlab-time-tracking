import * as vscode from 'vscode';
import { StatusBar } from './views/statusbar/StatusBar';
import { GitLabService, TimeTracking } from './services';

export function activate(context: vscode.ExtensionContext) {

  const gitLabService = new GitLabService();
  const statusBar = new StatusBar(context);
  const init = (): void  => {
    console.log('Congratulations, your extension "gitlab-time-tracking" is now active!');

    if(gitLabService.checkConfig()){
      statusBar.initTracking();
    }else{
      statusBar.initConfig();
    }
  }

  init()

  const timeTracking = new TimeTracking();
  const callbackInterval = (value: string) => {
    statusBar.actionItem.updateText(`$(stop) (${value})`);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('gitlab-time-tracking.calculateTimeSpent', async () => {
      init()
      if (!timeTracking.getIsTracking()) {
        timeTracking.startTracking(callbackInterval).then(() => {
          statusBar.actionItem.updateText('$(stop) (00:00:00) ');
          statusBar.actionItem.updateTooltip('Stop Time Tracking');
        });
      } else {
        timeTracking.stopTracking().then(() => {
          statusBar.actionItem.updateText('$(play) Start tracking');
          statusBar.actionItem.updateTooltip('Start Time Tracking');
          // Appeler la fonction pour récupérer les tickets assignés
          gitLabService.getAssignedIssues().then(() => {
            gitLabService.showIssueList().then((selectedIssue: any) => {
              const selectedIssueId = selectedIssue.issueId; // Récupérer l'ID du ticket sélectionné
              const selectedIssueTitle = selectedIssue.label; // Récupérer le titre du ticket sélectionné
              const elapsedTime = timeTracking.calculateElapsedTime();
              const elapsedTimeString = timeTracking.elapsedTimeToString(elapsedTime);
              vscode.window.showInformationMessage(`Selected issue: ${selectedIssueTitle} (ID: ${selectedIssueId})\nElapsed Time: ${elapsedTimeString}`);
              // Appeler la fonction pour ajouter le temps au ticket
              gitLabService.addTimeToIssue(selectedIssue.issue, elapsedTime);
            });
          });
        });
      }
    }),
    vscode.commands.registerCommand('gitlab-time-tracking.setConfig', async () => {
      gitLabService.showGitLabConfigurationDialog()
      statusBar.initTracking();
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
