import * as vscode from 'vscode';
import { configInterface } from '../interfaces/configInterface';
import { elapsedTimeInterface } from '../interfaces/elapsedTimeInterface';

export class SettingService {

  public getConfig(): configInterface {
    const gitLabConfig = vscode.workspace.getConfiguration('gitlab-time-tracking');
    const host: string | null = gitLabConfig.get('host') ?? null;
    const token: string | null = gitLabConfig.get('token') ?? null;
    return {
      host,
      token
    }
  }
  public checkConfig(): Boolean {
    const config: configInterface = this.getConfig()
    return !!(config.host && config.token);
  }

  public setConfig(config: configInterface): void {
    // Sauvegarder les informations de configuration dans les paramètres de l'extension
    vscode.workspace
    .getConfiguration()
    .update('gitlab-time-tracking.host', config.host, vscode.ConfigurationTarget.Global);
  vscode.workspace
    .getConfiguration()
    .update('gitlab-time-tracking.token', config.token, vscode.ConfigurationTarget.Global);
  }

  public async showConfigurationDialog(): Promise<void> {
    const hostInput = await vscode.window.showInputBox({
      prompt: 'Enter GitLab Host',
      placeHolder: 'https://gitlab.example.com',
      ignoreFocusOut: true
    });

    if (!hostInput) {
      throw new Error("Aucun host n'a été configuré !");
    }

    const tokenInput = await vscode.window.showInputBox({
      prompt: 'Enter GitLab Access Token',
      placeHolder: 'Enter your access token',
      password: true,
      ignoreFocusOut: true
    });

    if (!tokenInput) {
      throw new Error("Aucun token n'a été configuré !");
    }

    this.setConfig({
      host: hostInput,
      token: tokenInput
    })

  }

  public setElapsedTimeTmp(elapsedTime: elapsedTimeInterface): void{
    vscode.workspace.getConfiguration().update('gitlabTracking.elapsedTime', elapsedTime, vscode.ConfigurationTarget.Workspace);
  }

  public getElapsedTimeTmp(): elapsedTimeInterface | null {
    return vscode.workspace.getConfiguration().get('gitlabTracking.elapsedTime') ?? null;
  }
}