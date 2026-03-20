# Section: Design & UX

## What to Capture
- Design system or component library
- Key user flows (the 3-5 most important paths through the app)
- Responsive strategy (mobile-first? desktop-first?)
- Accessibility level (WCAG A, AA, or AAA)
- Brand guidelines (if any)

## Questions to Ask
1. What are the 3 most important things a user does in your app? Walk me through each.
2. Will this be used more on mobile or desktop? Or equally?
3. Do you have existing brand colors, fonts, or style guidelines?
4. How important is accessibility? (Legal requirement? Ethical choice? Nice-to-have?)
5. Are there apps whose look and feel you admire? What specifically do you like?

## Quality Tips
- Design the user flow BEFORE the UI. Know where users go before deciding what it looks like.
- Mobile-first is almost always right. If it works on mobile, it works on desktop. The reverse is rarely true.
- Accessibility is not optional — it's both ethical and often legally required. WCAG AA is the standard to aim for.
- Minimum touch target: 44x44px. Minimum body font: 16px. Minimum contrast: 4.5:1.
- Pick a design system (Tailwind, Shadcn, Material) rather than designing from scratch. Your time is better spent on the product.

## Common Mistakes
- Designing for desktop first, then trying to shrink it
- Ignoring accessibility until "later" (it's 10x harder to add)
- Too many user flows at launch — pick 3 and nail them
- Custom design system for a small project (use existing ones)
- Not testing with real users early
