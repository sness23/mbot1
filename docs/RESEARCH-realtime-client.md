# Research: Real-Time Headless Client Options

## Goal
Create a real-time keystroke-controlled Minecraft Bedrock client that:
- Works like normal Minecraft but headless (no graphical window)
- Accepts keyboard input in real-time
- Ideally text-based interface, but can use graphical framework if needed
- Must feel responsive like playing actual Minecraft

## Current State Analysis

### Existing bedrock-cli Implementation
We already have a working real-time keyboard controller in `bedrock-cli/`:
- Uses Node.js with TypeScript
- Baltica client for Bedrock protocol
- Raw terminal input via `process.stdin` in raw mode
- 20 tick/second game loop (50ms intervals)
- Tracks held keys in a Set

**Limitations:**
- Key-up detection missing (clears all keys every tick as workaround)
- Simple text output, no rich TUI
- No visual feedback of game state beyond position/chat

## Framework Research

### 1. Terminal UI Frameworks (Text-Only)

#### blessed (Node.js) ✓ RECOMMENDED FOR NODE
- **URL:** https://github.com/chjj/blessed
- **Language:** TypeScript/JavaScript
- **Pros:**
  - Full ncurses reimplementation in pure JS
  - DOM-like widget API (boxes, lists, forms, etc.)
  - Excellent keyboard handling with key events
  - Works with existing Baltica/TypeScript codebase
  - Can create split-screen layouts (game view + stats + chat)
  - No Python dependencies
- **Cons:**
  - Learning curve for widget system
  - Less game-focused than pygame
- **Best For:** Rich terminal interface with multiple panels

#### blessed (Python)
- **URL:** https://blessed.readthedocs.io/
- **Language:** Python
- **Pros:**
  - `Terminal.cbreak()` mode for real-time key input
  - `Terminal.inkey()` for timed key presses
  - Clean API for colors and positioning
  - Built for terminal games
- **Cons:**
  - Would require rewriting bot in Python
  - Need Python Bedrock protocol library
  - More setup complexity
- **Best For:** If rewriting in Python anyway

#### npyscreen
- **URL:** https://npyscreen.readthedocs.io/
- **Language:** Python
- **Pros:**
  - Widget-based forms and TUIs
  - Built on ncurses (standard library)
- **Cons:**
  - More suited to forms/menus than real-time games
  - Not ideal for game loop

### 2. Graphical Frameworks (Non-Headless)

#### pygame
- **Language:** Python
- **Pros:**
  - Excellent game loop support
  - Perfect keyboard input handling (`pygame.KEYDOWN`, `pygame.key.get_pressed()`)
  - Can render simple 2D representations of world
  - Could visualize chunks, entities, inventory
- **Cons:**
  - **NOT truly headless** - requires display window
  - `DummyVideoDriver` exists but keyboard events don't work
  - Would need to rewrite in Python
  - Overkill if just wanting terminal
- **Best For:** If you want visual 2D/isometric world view

#### pygame-zero
- Simplified pygame for quick prototyping
- Same headless limitations as pygame

### 3. Hybrid Approach: pygame + 2D World View

Could create an actual 2D game interface showing:
- Top-down or isometric view of nearby blocks
- Player position as sprite
- Nearby entities
- Inventory overlay
- Chat window
- Minimap

**Example:**
```
┌─────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  Minimap
│  ▓░░░░░░░░░░░░░░░░░░░░░░░░▓  │  Chat: ...
│  ▓░░░░░░░░@░░░░░░░░░░░░░░▓  │  HP: ████
│  ▓░░░░░░░░░░░░░░░░░░░░░░░▓  │  Pos: 123,64,456
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────────┘
```

## Recommended Approaches

### Option A: Enhanced Terminal UI with blessed (Node.js) ⭐ BEST FIT
**Framework:** blessed (Node.js)
**Language:** TypeScript (existing codebase)
**Effort:** Medium
**Advantages:**
- Extends existing bedrock-cli
- Rich terminal interface with panels:
  - World view (ASCII art of surroundings)
  - Position/rotation display
  - Chat window
  - Inventory view
  - Command input
  - Status bars
- Proper keyboard event handling (no more key clearing hack)
- No rewrite needed
- Truly headless (runs over SSH, in tmux, etc.)

**Example Layout:**
```
┌────────────────────┬──────────────────┐
│   World View       │   Stats          │
│                    │   HP: ████       │
│        ▓▓▓         │   Pos: X,Y,Z     │
│      ▓░@░▓         │   Yaw: 90°       │
│        ▓▓▓         │                  │
├────────────────────┤   Inventory      │
│   Chat             │   [Diamond Pic]  │
│   Player: Hi       │   [64x Dirt]     │
│   Bot: Hello       │   [Fishing Rod]  │
├────────────────────┴──────────────────┤
│   Command: _                          │
└───────────────────────────────────────┘
```

### Option B: Simple Terminal Enhancement (Current Approach+)
**Framework:** Node.js readline + ANSI codes
**Language:** TypeScript
**Effort:** Low
**Advantages:**
- Minimal changes to existing code
- Add ANSI colors and better formatting
- Fix key-up detection with better event handling
- Simple and fast
**Disadvantages:**
- Limited visual feedback
- Still just scrolling text

### Option C: pygame 2D Client (Python Rewrite)
**Framework:** pygame
**Language:** Python
**Effort:** High
**Advantages:**
- Actual 2D visualization of world
- Perfect input handling
- Could render inventory, crafting, etc.
- More "game-like" feel
**Disadvantages:**
- Complete rewrite needed
- Need Python Bedrock library (e.g., bedrock-protocol via node, or Rust bindings)
- Not truly headless (needs X11/Wayland)
- Much more complex

## Implementation Recommendations

### Immediate Next Steps: Option A (blessed Node.js)

1. **Create new project:** `bedrock-tui/`
2. **Install blessed:** `npm install blessed @types/blessed`
3. **Architecture:**
   ```typescript
   - BlessedClient (blessed screen setup)
   - BedrockConnection (Baltica client wrapper)
   - GameState (tracks position, rotation, inventory, etc.)
   - InputHandler (keyboard → game actions)
   - Renderer (game state → blessed widgets)
   - GameLoop (20 ticks/second)
   ```

4. **Key Features:**
   - Box widgets for different panels
   - List widget for chat scrollback
   - Text widget for position/stats
   - Custom ASCII rendering for nearby blocks (if server sends chunk data)
   - Real-time updates via game loop
   - Proper key down/up handling

5. **Progressive Enhancement:**
   - Start with basic split screen (chat + stats)
   - Add inventory display
   - Add simple world view (even just "facing: North, block ahead: Stone")
   - Add chunk visualization if possible
   - Add command palette

## Related Projects to Study

- **headlessmc** (Java Edition): Command-line Minecraft for Java - https://github.com/3arthqu4ke/headlessmc
- **awesome-tuis**: List of terminal UIs - https://github.com/rothgar/awesome-tuis
- **blessed examples**: Games built with blessed

## Performance Considerations

- blessed renders efficiently (only changed regions)
- 20 tick/second matches Minecraft's tick rate
- Terminal rendering is very lightweight compared to 3D graphics
- Can run on minimal hardware, even Raspberry Pi
- Works perfectly over SSH

## Decision Matrix

| Criteria              | blessed (Node) | pygame (Python) | Current CLI |
|----------------------|----------------|-----------------|-------------|
| Headless             | ✓ Yes          | ✗ No            | ✓ Yes       |
| Rewrite needed       | ✗ No           | ✓ Yes           | ✗ No        |
| Rich interface       | ✓ Yes          | ✓ Yes           | ✗ No        |
| Real-time input      | ✓ Yes          | ✓ Yes           | ~ Partial   |
| Visual feedback      | ✓ Good         | ✓ Excellent     | ✗ Minimal   |
| Complexity           | Medium         | High            | Low         |
| Works over SSH       | ✓ Yes          | ✗ No            | ✓ Yes       |
| Development time     | 1-2 days       | 1-2 weeks       | Hours       |

## Conclusion

**Recommendation: Option A - blessed (Node.js)**

This provides the best balance of:
- Truly headless operation
- Rich terminal interface
- Minimal rewrite (extends existing code)
- Proper keyboard handling
- Professional appearance
- Maintainable within existing TypeScript ecosystem

Start with a simple blessed wrapper around bedrock-cli, then progressively enhance the UI.
