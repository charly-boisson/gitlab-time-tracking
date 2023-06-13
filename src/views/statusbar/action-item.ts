import { StatusBarItem, window, StatusBarAlignment, ExtensionContext } from 'vscode';

export class StatusBarActionItem {
	public readonly item: StatusBarItem;

	constructor(ctx: ExtensionContext, alignment: StatusBarAlignment, priority: number) {
		this.item = window.createStatusBarItem(alignment, priority);
        this.item.text = '$(play) Start tracking';
		this.item.name = 'Tracking Status';
		this.item.tooltip = 'Start Tracking';
		this.item.command = 'gitlab-time-tracking.calculateTimeSpent';
		this.item.show();
		ctx.subscriptions.push(this.item);
	}

	public updateText(text: string) {
		this.item.text = text;
	}

	public updateTooltip(tooltip: string) {
		this.item.tooltip = tooltip;
	}
}