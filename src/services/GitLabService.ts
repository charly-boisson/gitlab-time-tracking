import { Gitlab } from '@gitbeaker/node';
import * as vscode from 'vscode';

export class GitLabService {

  private api: any | undefined;
  private issues: any[];

  constructor(){
    this.issues = []
  }

  public checkConfig(): Boolean {
    const gitLabConfig = vscode.workspace.getConfiguration('gitlabTracking');
    const host: string | null = gitLabConfig.get('host') ?? null;
    const token: string | null = gitLabConfig.get('token') ?? null;
    if (!host || !token) {
      return false
    } else {
      this.api = new Gitlab({
        host,
        token,
        camelize: true,
        requestTimeout: 3000
      });
      return true
    }
  }

  public async showGitLabConfigurationDialog() {
    const hostInput = await vscode.window.showInputBox({
      prompt: 'Enter GitLab Host',
      placeHolder: 'https://gitlab.example.com',
      ignoreFocusOut: true
    });

    if (!hostInput) {
      return undefined;
    }

    const tokenInput = await vscode.window.showInputBox({
      prompt: 'Enter GitLab Access Token',
      placeHolder: 'Enter your access token',
      password: true,
      ignoreFocusOut: true
    });

    if (!tokenInput) {
      return undefined;
    }

    // Sauvegarder les informations de configuration dans les paramètres de l'extension
    vscode.workspace
    .getConfiguration()
    .update('gitlabTracking.host', hostInput, vscode.ConfigurationTarget.Global);
  vscode.workspace
    .getConfiguration()
    .update('gitlabTracking.token', tokenInput, vscode.ConfigurationTarget.Global);

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
          const projectId = 138; // ID du projet GitLab
          const assigneeId = 39; // ID du user GitLab
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