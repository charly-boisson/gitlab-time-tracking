import * as vscode from 'vscode';

export class ReminderService {

  private FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes en millisecondes
  private interval: NodeJS.Timeout | undefined = undefined;

  public startPopupIntervalIfNeeded(isTracking: Boolean) {
    // Vérifier si l'intervalle est déjà en cours
    if (this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      // Vérifier si le tracking n'a pas été démarré
      if (!isTracking) {
        vscode.window.showInformationMessage('Veuillez démarrer le tracking !', { modal: true });

      } else {
        this.stopPopupInterval()
      }
    }, this.FIVE_MINUTES);
  }

  public stopPopupInterval(){
    if(this.interval){
      clearInterval(this.interval);
        this.interval = undefined;
    }
  }
}