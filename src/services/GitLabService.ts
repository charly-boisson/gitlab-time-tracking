import { Gitlab } from '@gitbeaker/node';
import * as vscode from 'vscode';
export class GitLabService {

  private api: any | undefined;
  private issues: any[];

  constructor(){
    this.issues = []
  }

  public async initApi(): Promise<void> {
    this.api = new Gitlab({
      host: vscode.workspace.getConfiguration('gitlab-time-tracking').get('host'),
      token: vscode.workspace.getConfiguration('gitlab-time-tracking').get('token'),
      camelize: true,
      requestTimeout: 3000
    });
  }


  public async getAssignedIssues(): Promise<void> {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Chargement des tickets...',
        cancellable: false
      },
        async () => {
        try {
          const projectId = vscode.workspace.getConfiguration('gitlab-time-tracking').get('projectOfIssues') // 138; // ID du projet GitLab
          const assigneeId = vscode.workspace.getConfiguration('gitlab-time-tracking').get('userId') // 39; // ID du user GitLab
          const fromDate = new Date();
          fromDate.setMonth(fromDate.getMonth() - 3); // Date d'il y a 3 mois
          this.issues = await this.api.Issues.all({
            projectId,
            assigneeId,
            createdAfter: fromDate.toISOString()
          });
        } catch (error) {
          console.error('Error retrieving projects:', error);
        }
      }
    );
  };

  public async showIssueList() {

    const issueQuickPickItems = this.issues.map(issue => {
      return {
        label: issue.title,
        description: `ID: ${issue.iid}`,
        issueId: issue.iid,
        issue: issue
      };
    });

    return vscode.window.showQuickPick(issueQuickPickItems, { placeHolder: 'Select an issue' }).then(selectedIssue => {
      if (selectedIssue) {
        return selectedIssue;
      }
    });
  };


  public async addTimeToIssue(issue: any, elapsedTime: { hours: number; minutes: number; seconds: number } | undefined) {
    if (elapsedTime) {
      const { hours, minutes, seconds } = elapsedTime;
      const timeEstimate = `${hours}h${minutes}m${seconds}s`; // Format du temps écoulé

      try {
        const selectedIssueId = issue.issueId; // Récupérer l'ID du ticket sélectionné
        const selectedIssueTitle = issue.label; // Récupérer le titre du ticket sélectionné
        vscode.window.showInformationMessage(`Selected issue: ${selectedIssueId} - ${selectedIssueTitle}`);
        // Mettre à jour le ticket avec le temps écoulé
        await this.api.Issues.addSpentTime(issue.projectId, issue.iid, timeEstimate);

        vscode.window.showInformationMessage(`Time ${timeEstimate} added to the issue successfully!`);
      } catch (error) {
        console.error('Error adding time to the issue:', error);
        vscode.window.showErrorMessage('Failed to add time to the issue.');
      }
    }
  };

}