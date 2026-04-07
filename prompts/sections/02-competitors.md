# Section: Competitors & Inspiration

## What to Capture
- 3-5 competitors or similar projects
- For each: name, URL, description, strengths, weaknesses
- The gap your project fills that competitors don't
- Features to borrow (inspiration, not copying)

## Questions to Ask
1. Do you know of any existing tools or products that do something similar?
2. What do you like about them? What frustrates you?
3. Why would someone choose YOUR project over what already exists?
4. Are there projects in adjacent spaces that inspire your approach?
5. Is there a reason existing solutions don't work for your target users?

## Quality Tips
- Every idea has competitors. If the user says "nothing exists," dig deeper — there are always alternatives, even if they're spreadsheets, manual processes, or different tools duct-taped together.
- Understanding competitors is NOT about being scared of them — it's about positioning.
- The best products don't try to beat competitors on everything. They pick 1-2 things and do them exceptionally well.
- Competitor weaknesses are your opportunity. Their strengths tell you the table stakes.

### Evaluate at your expected scale

Don't evaluate competitors (or your own technical choices) on single demos:

- **TTS/audio:** Test on 60+ segments, not 3. Sibilance, inter-segment consistency, and trailing artifacts only appear at scale.
- **APIs:** Test at your expected request rate. Rate limits, latency spikes, and error rates appear under load.
- **UI frameworks:** Build a realistic page, not a todo app. Performance characteristics change with component count.
- **Databases:** Test with realistic data volume. Query patterns that work on 1,000 rows fail at 1,000,000.

Document what was actually tested vs. what was assumed from documentation or marketing.

## Common Mistakes
- Ignoring indirect competitors (manual processes, spreadsheets, email)
- Trying to beat every competitor on every feature
- Not defining what makes YOUR approach unique
- Only looking at big players — small niche tools are often the real competition
