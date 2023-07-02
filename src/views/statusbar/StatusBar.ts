import { StatusBarActionItem } from './action-item';
import { ExtensionContext, StatusBarAlignment } from 'vscode';

export class StatusBar {
	private priority = 1000;
	public actionItem: StatusBarActionItem;

	constructor(ctx: ExtensionContext){
		this.actionItem = new StatusBarActionItem(ctx, StatusBarAlignment.Left, this.priority + 1);
	}

	public async initTracking() {
		this.actionItem.updateText('$(play) Start tracking');
		this.actionItem.updateName('Tracking Status');
		this.actionItem.updateTooltip('Start Tracking');
		this.actionItem.updateCommand('gitlab-time-tracking.calculateTimeSpent');
	}

	public async initConfig() {
		this.actionItem.updateText('$(gear) Setting tracking');
		this.actionItem.updateName('Set the config tracking');
		this.actionItem.updateTooltip('Set the config tracking');
		this.actionItem.updateCommand('gitlab-time-tracking.setConfig');
	}
}