# Section: Tech Stack & Tools

> **Adapt to the project type.** For software: languages, frameworks, databases.
> For physical businesses/services: operational tools, equipment, software for running the business.

## What to Capture
- Key tools and technologies (what you'll build with or run on)
- Why each choice was made (rationale)
- Key dependencies and vendors
- Team familiarity with the choices

## Questions to Ask

### For digital products:
1. Do you or your team have experience with specific languages/frameworks?
2. Does this need server-side rendering? (SEO-critical content?)
3. How complex is the data? (Simple key-value? Complex relationships? Full-text search?)
4. Do you need real-time capabilities?
5. What's your budget for infrastructure?

### For physical businesses/services:
1. What tools do you need to operate? (POS system, scheduling software, equipment?)
2. Do you already use any software for the business? (Accounting, inventory, booking?)
3. What equipment or physical resources are required?
4. Do you need a website, social media presence, or online ordering?
5. What's your budget for tools and equipment?

## Quality Tips
- Pick boring, proven choices. Innovation should be in your product, not your tools.
- Match tools to the team. A perfect choice nobody knows how to use is the wrong choice.
- Every dependency is a liability. Fewer = less maintenance.
- Always explain WHY, not just WHAT.
- Consider vendor lock-in — can you switch if needed?

### LLM vs. code vs. user boundaries

For projects that integrate AI/LLM capabilities, define clear boundaries:

- **LLM decides:** Semantic understanding, narrative structure, qualitative suggestions
  - Example: "Play door creak SFX at the word 'creaked'" (LLM understands story context)
- **Code decides:** Arithmetic, timing, optimization, data transformation  
  - Example: "Resolve word 'creaked' to millisecond position 14,350ms" (code does the math)
- **User decides:** Quality tradeoffs, provider selection, creative preferences
  - Example: "Use voice clone for this character" (user makes the call)

Never ask an LLM for precise numerical values (milliseconds, pixel positions, percentages). LLMs hallucinate numbers. Use them for semantic anchors and let code resolve to precise values.

## Common Mistakes
- Choosing tools because they're trending, not because they fit
- Not considering the learning curve for the team
- Over-relying on third-party services for core functionality
- Ignoring the long-term maintenance cost of each tool
- Using complex solutions when simple ones would work
