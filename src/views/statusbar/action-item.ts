import { StatusBarItem, window, StatusBarAlignment, ExtensionContext } from 'vscode';

export class StatusBarActionItem {
	public readonly item: StatusBarItem;

	constructor(ctx: ExtensionContext, alignment: StatusBarAlignment, priority: number) {
		this.item = window.createStatusBarItem(alignment, priority);
		this.item.show();
		ctx.subscriptions.push(this.item);
	}

	public updateText(text: string) {
		this.item.text = text;
	}

	public updateName(name: string) {
		this.item.name = name;
	}

	public updateTooltip(tooltip: string) {
		this.item.tooltip = tooltip;
	}

	public updateCommand(command: string) {
		this.item.command = command;
	}
}