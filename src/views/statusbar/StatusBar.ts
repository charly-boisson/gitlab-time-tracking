import { StatusBarActionItem } from './action-item';
import { ExtensionContext, StatusBarAlignment } from 'vscode';

export class StatusBar {
	private priority = 1000;
	public actionItem: StatusBarActionItem;

	constructor(ctx: ExtensionContext){
		this.actionItem = new StatusBarActionItem(ctx, StatusBarAlignment.Left, this.priority + 1);
	}

	public async startTracking() {
		this.actionItem.updateText('$(play) Start tracking');
		this.actionItem.updateTooltip('Start Tracking');
		this.actionItem.updateCommand('gitlab-time-tracking.startTracking');
	}

	public async stopTracking() {
		this.actionItem.updateText('$(stop) (00:00:00) ');
		this.actionItem.updateTooltip('Stop Time Tracking');
		this.actionItem.updateCommand('gitlab-time-tracking.stopTracking');
	}

	public async setInterval(value: string) {
		this.actionItem.updateText(value);
	}

	public async setConfig() {
		this.actionItem.updateText('$(gear) Setting tracking');
		this.actionItem.updateTooltip('Set the config tracking');
		this.actionItem.updateCommand('gitlab-time-tracking.setConfig');
	}

	public async hide() {
	}
}