import * as vscode from 'vscode';
import { StatusBar } from './views/statusbar/StatusBar';
import { GitLabService, TimeTracking, SettingService, ReminderService } from './services';

const timeTracking = new TimeTracking();
const settingService = new SettingService();
const gitLabService = new GitLabService();
const reminderService = new ReminderService();

export function activate(context: vscode.ExtensionContext) {

  const statusBar = new StatusBar(context);

  const checkStateExtension = (): void  => {
    console.log('Congratulations, your extension "gitlab-time-tracking" is now active!');
    if(!settingService.checkConfig()){
      statusBar.setConfig(); // set config
      return
    }
    const elapsedTime = settingService.getElapsedTimeTmp()
    if(elapsedTime){
      // Calculer la durée écoulée en millisecondes
      const elapsedTimeStamp = (elapsedTime.hours * 60 * 60 + elapsedTime.minutes * 60 + elapsedTime.seconds) * 1000;

      // Calculer le nouveau startTime en fonction de la durée écoulée
      const startTime = Date.now() - elapsedTimeStamp;

      // Mettre à jour la propriété startTime de la classe TimeTracking
      timeTracking.setStartTime(startTime);
      return
    }
    if (timeTracking.getIsTracking()) {
      statusBar.stopTracking(); // show btn stop

    }
    statusBar.startTracking();
    reminderService.startPopupIntervalIfNeeded(timeTracking.getIsTracking())
  }

  checkStateExtension()

  context.subscriptions.push(
    vscode.commands.registerCommand('gitlab-time-tracking.startTracking', async () => {
      reminderService.stopPopupInterval()
      const callbackInterval = (value: string) => {
        statusBar.setInterval(`$(stop) (${value})`);
      }
      timeTracking.startTracking(callbackInterval).then(() => {
        statusBar.stopTracking();
      });
    }),
    vscode.commands.registerCommand('gitlab-time-tracking.stopTracking', async () => {
      gitLabService.initApi()
      timeTracking.stopTracking().then(() => {
        // Appeler la fonction pour récupérer les tickets assignés
        gitLabService.getAssignedIssues().then(() => {
          gitLabService.showIssueList().then((selectedIssue: any) => {
            const elapsedTime = timeTracking.calculateElapsedTime();
            // Appeler la fonction pour ajouter le temps au ticket
            gitLabService.addTimeToIssue(selectedIssue.issue, elapsedTime);
          });
        });
        statusBar.startTracking();

      });
    }),
    vscode.commands.registerCommand('gitlab-time-tracking.setConfig', async () => {
      try {
        await settingService.showConfigurationDialog()
        statusBar.startTracking();
      }catch(error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    })
  );

}

// This method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
   if(!timeTracking.getIsTracking()){
    return
   }
   const elapsedTime = timeTracking.getTracking();
   vscode.workspace.getConfiguration().update('gitlab-time-tracking.elapsedTime', elapsedTime, vscode.ConfigurationTarget.Workspace);
   vscode.workspace
   .getConfiguration()
   .update('gitlab-time-tracking.elapsedTime', elapsedTime, vscode.ConfigurationTarget.Global);
}
