# Section: Design & Experience

> **Adapt to the project type.** For software UIs: UI/UX design, responsive strategy.
> For developer tools/APIs: developer experience (DX), docs, error messages.
> For physical businesses: customer experience, layout, branding.

## What to Capture
- Design approach or system
- Key user/customer journeys (the 3-5 most important paths)
- How the experience adapts to different contexts (devices, locations, situations)
- Accessibility considerations
- Brand guidelines (if any)

## Questions to Ask

### For all projects:
1. What are the 3 most important things a user/customer does? Walk me through each.
2. Do you have existing brand colors, style, or guidelines?
3. How important is accessibility? (Legal requirement? Ethical choice? Nice-to-have?)
4. Are there businesses or products whose look and feel you admire?

### For software with a UI (add):
5. Will this be used more on mobile or desktop?
6. What design system or component library will you use?

### For developer tools, CLIs, and APIs (add):
5. What does the `--help` output or API reference look like? Walk me through the first command or request.
6. How are errors communicated? (Exit codes? HTTP status codes? Structured error objects?)
7. What does the onboarding path look like? (README? Interactive setup wizard? API quickstart?)

### For physical businesses (add):
5. What should the space/environment feel like? Walk me through a customer visit.

## Quality Tips
- Design the journey BEFORE the details. Know where people go before deciding what it looks like.
- For UIs: mobile-first is almost always right for consumer products.
- For developer tools: the README and error messages ARE the design. Invest in them.
- For APIs: time-to-first-successful-call is the key metric — optimize for it.
- For physical: the first 10 seconds of a customer's visit set expectations — what do they see?
- Accessibility is not optional — it's both ethical and often legally required.
- Not testing with real users early is the most common and costly mistake.

## Common Mistakes
- Too many paths at launch — pick 3 and nail them
- Ignoring accessibility until "later" (it's 10x harder to add)
- Designing for the builder's preferences instead of the primary user's context
- For developer tools: no interactive examples, unclear error messages, no `--help`
- For APIs: requiring account creation before the first API call
- Not considering the design filter: does this work for [primary user] in [their context]?
- Skipping user/customer testing before committing to a design
