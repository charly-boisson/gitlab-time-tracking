import { StatusBarActionItem } from './action-item';
import { ExtensionContext, StatusBarAlignment } from 'vscode';

export class StatusBar {
	private static priority = 1000;
	private static actionItem: StatusBarActionItem;

	public static async initialize(ctx: ExtensionContext) {
		console.log('init statusbar');
		this.actionItem = new StatusBarActionItem(ctx, StatusBarAlignment.Left, this.priority + 1);
	}
}