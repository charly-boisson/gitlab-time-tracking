import { elapsedTimeInterface } from "../interfaces/elapsedTimeInterface";

export class TimeTracking {

  private isTracking = false;
  private timer: NodeJS.Timer | undefined;
  private startTime: number | undefined;
  private elapsedTime: elapsedTimeInterface | undefined;

  public getIsTracking(): Boolean {
    return this.isTracking;
  };

  public getTracking(): elapsedTimeInterface | null {
    return this.elapsedTime ?? null
  }

  public setStartTime(startTime: number) {
    this.startTime = startTime;
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


  public calculateElapsedTime(): elapsedTimeInterface | undefined {
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

  public elapsedTimeToString(elapsedTime: elapsedTimeInterface | undefined): string {
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