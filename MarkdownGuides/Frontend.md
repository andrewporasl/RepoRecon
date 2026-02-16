Background: zinc-950 (A very deep, desaturated charcoal)

Surface/Cards: zinc-900 (Subtly lighter than the background)

Borders: zinc-800 (Thin, crisp lines)

Text: zinc-100 (Off-white for headers) and zinc-400 (Muted gray for body text)

Accent: A single, muted color. Let’s go with Slate-400 or Emerald-500 but only for small indicators (like a status dot).'

Global Layout: The "Ghost" Frame
Sidebar: Not a solid block. Use a transparent sidebar with a 1px border on the right (border-r border-zinc-800).

Spacing: Use "Comfortable" padding. Nothing should feel cramped. Lots of p-6 and gap-8.

Shadows: No heavy shadows. Use inner-glow or very subtle ring offsets to separate cards from the background.

Feature A: The Activity Feed 
The List: Clean rows with no backgrounds by default.

Hover State: When you hover over a PR, the background subtly changes to zinc-900/50.

Typography: Small, uppercase labels for metadata (e.g., AUTHOR: @jdoe in text-[10px] tracking-widest zinc-500).

Feature B: The Agent Insights
Content First: Instead of "AI Summary," just title the section "Analysis."

Clean Code: Diffs should not be bright red/green. Use muted pastels or just +/- symbols in the gutter to keep it lowkey.

The "Thinking" State: Instead of a spinning loader, use a simple, thin Progress bar at the very top of the card—barely noticeable but informative.

Feature C: The Terminal (Strategist)
The Input: A single, borderless line at the bottom of the screen. No big "Send" button—just a small Enter ↵ icon in the corner.

Chat Bubbles: No bubbles. Use a "Slack-style" thread layout where the agent’s name and the message are plain text on the background.