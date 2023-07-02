export class TimeTracking {

  private isTracking = false;
  private timer: NodeJS.Timer | undefined;
  private startTime: number | undefined;
  private elapsedTime: { hours: number; minutes: number; seconds: number } | undefined;

  public getIsTracking() {
    return this.isTracking;
  };

  public async startTracking(callback: Function) {
    this.isTracking = true;
    this.startTime = Date.now(); // Enregistrer l'heure de démarrage
    this.timer = setInterval(() => {
      this.elapsedTime = this.calculateElapsedTime();
      // Faire quelque chose à intervalles réguliers pendant le suivi du temps
      callback(this.elapsedTimeToString(this.elapsedTime))
    }, 1000);
  };


  public async stopTracking() {
    this.isTracking = false;
    clearInterval(this.timer!);
    this.elapsedTime = this.calculateElapsedTime(); // Calculer la durée écoulée
  };


  public calculateElapsedTime(): { hours: number; minutes: number; seconds: number } | undefined {
    if (this.startTime) {
      const endTime = Date.now();
      const elapsedTime = endTime - this.startTime;

      const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
      const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    }
    return undefined;
  };

  public elapsedTimeToString(elapsedTime: { hours: number; minutes: number; seconds: number } | undefined): string {
    if (elapsedTime) {
      const { hours, minutes, seconds } = elapsedTime;
      return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
    }
    return 'No Elapsed Time';
  };

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  };

}