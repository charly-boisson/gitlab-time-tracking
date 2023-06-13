import * as vscode from 'vscode';
import { Gitlab } from '@gitbeaker/node';
import { StatusBar } from './views/statusbar';
import fetch from 'node-fetch';
import { log } from 'console';

export function activate(context: vscode.ExtensionContext) {

  const api = new Gitlab({
    host: 'https://git.ignimission.com',
    token: '4Xx2UU6Fp6dCn_i_mkY1',
    camelize: true,
    requestTimeout: 3000
  });

  StatusBar.initialize(context);
  console.log('Congratulations, your extension "gitlab-time-tracking" is now active!');

  let isTracking = false;
  let timer: NodeJS.Timer | undefined;
  let startTime: number | undefined;
  let elapsedTime: { hours: number; minutes: number; seconds: number } | undefined;

  const startTracking = () => {
    isTracking = true;
    StatusBar.actionItem.updateText('$(stop) (00:00:00) ');
    StatusBar.actionItem.updateTooltip('Stop Time Tracking');
    startTime = Date.now(); // Enregistrer l'heure de démarrage
    timer = setInterval(() => {
      elapsedTime = calculateElapsedTime(startTime);
      StatusBar.actionItem.updateText(`$(stop) (${elapsedTimeToString(elapsedTime)})`);

      // Faire quelque chose à intervalles réguliers pendant le suivi du temps
    }, 1000);
  };

  const stopTracking = () => {
    isTracking = false;
    clearInterval(timer!);
    StatusBar.actionItem.updateText('$(play) Start tracking');
    StatusBar.actionItem.updateTooltip('Start Time Tracking');
    elapsedTime = calculateElapsedTime(startTime); // Calculer la durée écoulée
    getAssignedIssues(); // Appeler la fonction pour récupérer les tickets assignés
  };

  const calculateElapsedTime = (startTime: number | undefined): { hours: number; minutes: number; seconds: number } | undefined => {
    if (startTime) {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;

      const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
      const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    }
    return undefined;
  };

  const padZero = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  // Utilisation de l'API GitLab
  const getAssignedIssues = async () => {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Chargement des tickets...',
        cancellable: false
      },
      async (progress, token) => {
        try {
          const projectId = 138; // ID du projet GitLab
          const assigneeId = 39; // ID du user GitLab
          const fromDate = new Date();
          fromDate.setMonth(fromDate.getMonth() - 3); // Date d'il y a 3 mois
          const issues = await api.Issues.all({
            projectId,
            assigneeId,
            createdAfter: fromDate.toISOString()
          });
          showIssueList(issues);
        } catch (error) {
          console.error('Error retrieving projects:', error);
        }
      }
    );
  };


  const showIssueList = (issues: any[]) => {
    const issueQuickPickItems = issues.map(issue => {
      return {
        label: issue.title,
        description: `ID: ${issue.iid}`,
        issueId: issue.iid,
        issue: issue
      };
    });

    vscode.window.showQuickPick(issueQuickPickItems, { placeHolder: 'Select an issue' }).then(selectedIssue => {
      if (selectedIssue) {
        const selectedIssueId = selectedIssue.issueId; // Récupérer l'ID du ticket sélectionné
        const selectedIssueTitle = selectedIssue.label; // Récupérer le titre du ticket sélectionné
        const elapsedTime = calculateElapsedTime(startTime);
        const elapsedTimeString = elapsedTimeToString(elapsedTime);
        vscode.window.showInformationMessage(`Selected issue: ${selectedIssueTitle} (ID: ${selectedIssueId})\nElapsed Time: ${elapsedTimeString}`);

        // Appeler la fonction pour ajouter le temps au ticket
        addTimeToIssue(selectedIssue.issue, elapsedTime);
      }
    });
  };

  const elapsedTimeToString = (elapsedTime: { hours: number; minutes: number; seconds: number } | undefined): string => {
    if (elapsedTime) {
      const { hours, minutes, seconds } = elapsedTime;
      return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    }
    return 'No Elapsed Time';
  };

  const addTimeToIssue = async (issue: any, elapsedTime: { hours: number; minutes: number; seconds: number } | undefined) => {
    if (elapsedTime) {
      const { hours, minutes, seconds } = elapsedTime;
      const timeEstimate = `${hours}h${minutes}m${seconds}s`; // Format du temps écoulé

      try {
        // Mettre à jour le ticket avec le temps écoulé
        await api.Issues.addSpentTime(issue.projectId, issue.iid, timeEstimate);

        vscode.window.showInformationMessage('Time added to the issue successfully!');
      } catch (error) {
        console.error('Error adding time to the issue:', error);
        vscode.window.showErrorMessage('Failed to add time to the issue.');
      }
    }
  };




  context.subscriptions.push(
    vscode.commands.registerCommand('gitlab-time-tracking.calculateTimeSpent', async () => {
      if (!isTracking) {
        startTracking();
      } else {
        stopTracking();
      }
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
