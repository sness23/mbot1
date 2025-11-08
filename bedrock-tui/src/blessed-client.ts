import blessed from "blessed";
import { GameState } from "./game-state";

export class BlessedClient {
  private screen: blessed.Widgets.Screen;
  private worldBox: blessed.Widgets.BoxElement;
  private statsBox: blessed.Widgets.BoxElement;
  private chatBox: blessed.Widgets.Log;
  private inventoryBox: blessed.Widgets.BoxElement;
  private commandInput: blessed.Widgets.TextboxElement;
  private helpBox: blessed.Widgets.BoxElement;
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;

    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: "Minecraft Bedrock TUI Client",
      fullUnicode: true,
    });

    // World view box (top left) - 60% width, 60% height
    this.worldBox = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: "60%",
      height: "60%",
      label: " World View ",
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "cyan",
        },
      },
      tags: true,
      scrollable: true,
      alwaysScroll: true,
    });

    // Stats box (top right) - 40% width, 30% height
    this.statsBox = blessed.box({
      parent: this.screen,
      top: 0,
      left: "60%",
      width: "40%",
      height: "30%",
      label: " Player Stats ",
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "green",
        },
      },
      tags: true,
      scrollable: true,
    });

    // Inventory box (right middle) - 40% width, 30% height
    this.inventoryBox = blessed.box({
      parent: this.screen,
      top: "30%",
      left: "60%",
      width: "40%",
      height: "30%",
      label: " Inventory ",
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "yellow",
        },
      },
      tags: true,
      scrollable: true,
    });

    // Help box (right bottom) - 40% width, 40% height
    this.helpBox = blessed.box({
      parent: this.screen,
      top: "60%",
      left: "60%",
      width: "40%",
      height: "40%-3",
      label: " Controls ",
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "magenta",
        },
      },
      content: this.getHelpText(),
      tags: true,
    });

    // Chat box (bottom left) - 60% width, 40% height
    this.chatBox = blessed.log({
      parent: this.screen,
      top: "60%",
      left: 0,
      width: "60%",
      height: "40%-3",
      label: " Chat ",
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "blue",
        },
      },
      tags: true,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: " ",
        style: {
          bg: "blue",
        },
      },
    });

    // Command input (bottom) - full width, 3 lines
    this.commandInput = blessed.textbox({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: "100%",
      height: 3,
      label: " Command (Press 'T' to type, ESC to cancel) ",
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "white",
        },
        focus: {
          border: {
            fg: "yellow",
          },
        },
      },
      inputOnFocus: true,
      hidden: true,
    });

    // Setup screen event handlers
    this.setupScreenEvents();

    // Initial render
    this.screen.render();
  }

  private setupScreenEvents(): void {
    // Quit on Q, Ctrl+C
    this.screen.key(["q", "C-c"], () => {
      this.cleanup();
      process.exit(0);
    });

    // Command input on T
    this.screen.key(["t"], () => {
      this.showCommandInput();
    });

    // Focus management
    this.screen.key(["tab"], () => {
      this.screen.focusNext();
    });

    this.screen.key(["S-tab"], () => {
      this.screen.focusPrevious();
    });
  }

  private showCommandInput(): void {
    this.commandInput.show();
    this.commandInput.focus();
    this.screen.render();

    this.commandInput.readInput((err, value) => {
      if (!err && value) {
        this.handleCommand(value);
      }
      this.commandInput.clearValue();
      this.commandInput.hide();
      this.screen.render();
    });
  }

  private handleCommand(command: string): void {
    // This will be implemented by the parent to send chat/commands
    this.addChatMessage("System", `Command: ${command}`);
  }

  public setCommandHandler(handler: (cmd: string) => void): void {
    this.handleCommand = handler;
  }

  private getHelpText(): string {
    return [
      "{bold}Movement:{/bold}",
      "  W/A/S/D - Move",
      "  Space   - Jump",
      "  Shift   - Sneak",
      "",
      "{bold}Actions:{/bold}",
      "  E       - Inventory",
      "  1-9     - Hotbar select",
      "  T       - Chat/Command",
      "",
      "{bold}View:{/bold}",
      "  Tab     - Next panel",
      "  S-Tab   - Prev panel",
      "",
      "{bold}Other:{/bold}",
      "  Q       - Quit",
      "  H       - Toggle help",
    ].join("\n");
  }

  public updateWorld(): void {
    const lines: string[] = [];

    lines.push("{bold}Position:{/bold}");
    lines.push(`  X: {green-fg}${this.gameState.position.x.toFixed(2)}{/green-fg}`);
    lines.push(`  Y: {green-fg}${this.gameState.position.y.toFixed(2)}{/green-fg}`);
    lines.push(`  Z: {green-fg}${this.gameState.position.z.toFixed(2)}{/green-fg}`);
    lines.push("");

    lines.push("{bold}Rotation:{/bold}");
    lines.push(`  Facing: {cyan-fg}${this.gameState.getDirectionString()}{/cyan-fg}`);
    lines.push(`  Yaw: {cyan-fg}${this.gameState.rotation.yaw.toFixed(1)}°{/cyan-fg}`);
    lines.push(`  Pitch: {cyan-fg}${this.gameState.rotation.pitch.toFixed(1)}°{/cyan-fg}`);
    lines.push("");

    lines.push("{bold}Movement:{/bold}");
    lines.push(`  On Ground: {yellow-fg}${this.gameState.onGround ? "Yes" : "No"}{/yellow-fg}`);
    lines.push(`  Velocity: {yellow-fg}${Math.sqrt(
      this.gameState.velocity.x ** 2 +
      this.gameState.velocity.z ** 2
    ).toFixed(2)}{/yellow-fg}`);
    lines.push("");

    // ASCII art player representation
    lines.push("{bold}Player View:{/bold}");
    lines.push("     {cyan-fg}^{/cyan-fg}");
    lines.push("     {cyan-fg}|{/cyan-fg}");
    lines.push("  {cyan-fg}<--@-->{/cyan-fg}");
    lines.push("     {cyan-fg}|{/cyan-fg}");
    lines.push("     {cyan-fg}v{/cyan-fg}");

    this.worldBox.setContent(lines.join("\n"));
  }

  public updateStats(): void {
    const lines: string[] = [];

    lines.push("{bold}Status:{/bold}");
    lines.push(`  Connection: {green-fg}${this.gameState.connected ? "Connected" : "Disconnected"}{/green-fg}`);
    lines.push(`  Server: {cyan-fg}${this.gameState.serverAddress}{/cyan-fg}`);
    lines.push(`  Username: {cyan-fg}${this.gameState.username}{/cyan-fg}`);
    lines.push("");

    lines.push("{bold}Health:{/bold}");
    lines.push(`  {red-fg}${this.gameState.getHealthBar(15)}{/red-fg} ${this.gameState.stats.health.toFixed(1)}/${this.gameState.stats.maxHealth}`);
    lines.push("");

    lines.push("{bold}Hunger:{/bold}");
    lines.push(`  {yellow-fg}${this.gameState.getHungerBar(15)}{/yellow-fg} ${this.gameState.stats.hunger}/${this.gameState.stats.maxHunger}`);
    lines.push("");

    lines.push("{bold}Experience:{/bold}");
    lines.push(`  Level: {green-fg}${this.gameState.stats.level}{/green-fg}`);
    lines.push(`  XP: {green-fg}${this.gameState.stats.experience}{/green-fg}`);
    lines.push("");

    lines.push("{bold}Game Tick:{/bold}");
    lines.push(`  {magenta-fg}${this.gameState.tick.toString()}{/magenta-fg}`);

    this.statsBox.setContent(lines.join("\n"));
  }

  public updateInventory(): void {
    const lines: string[] = [];

    lines.push("{bold}Hotbar:{/bold}");

    for (let i = 0; i < 9; i++) {
      const slot = this.gameState.inventory.find(s => s.slot === i);
      const selected = i === this.gameState.selectedHotbarSlot;
      const prefix = selected ? "{yellow-bg}{black-fg}" : "";
      const suffix = selected ? "{/}" : "";

      if (slot) {
        lines.push(`${prefix}  [${i + 1}] ${slot.name} x${slot.count}${suffix}`);
      } else {
        lines.push(`${prefix}  [${i + 1}] Empty${suffix}`);
      }
    }

    lines.push("");
    lines.push("{bold}Inventory:{/bold}");

    const mainInventory = this.gameState.inventory.filter(s => s.slot >= 9);
    if (mainInventory.length === 0) {
      lines.push("  {gray-fg}No items{/gray-fg}");
    } else {
      for (const slot of mainInventory.slice(0, 10)) {
        lines.push(`  ${slot.name} x${slot.count}`);
      }
      if (mainInventory.length > 10) {
        lines.push(`  {gray-fg}... and ${mainInventory.length - 10} more{/gray-fg}`);
      }
    }

    this.inventoryBox.setContent(lines.join("\n"));
  }

  public addChatMessage(sender: string, message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.chatBox.log(`{gray-fg}[${timestamp}]{/gray-fg} {cyan-fg}${sender}:{/cyan-fg} ${message}`);
  }

  public addSystemMessage(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.chatBox.log(`{gray-fg}[${timestamp}]{/gray-fg} {yellow-fg}[System]{/yellow-fg} ${message}`);
  }

  public render(): void {
    this.updateWorld();
    this.updateStats();
    this.updateInventory();
    this.screen.render();
  }

  public cleanup(): void {
    this.screen.destroy();
  }

  public getScreen(): blessed.Widgets.Screen {
    return this.screen;
  }
}
