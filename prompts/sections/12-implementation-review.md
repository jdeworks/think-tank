# Section: Implementation Review

This is the final section before handing off to implementation. The goal: **an implementing agent should have zero questions.**

## What This Does

After all 11 planning sections are complete, review the plan from the perspective of someone who has to BUILD it. Identify and resolve any ambiguity, missing decisions, or gaps that would force the implementer to stop and ask questions.

## Review Checklist

### Decisions That Must Be Made (not left open)

For each of these, the plan must have a SPECIFIC answer, not "either X or Y":

1. **Template strategy** — Is there a literal template folder to copy, or does the AI generate code from prompts? Pick one.
2. **Package manager** — npm, pnpm, yarn, or bun? Pick one.
3. **Exact versions** — Which version of each framework/library? (e.g., "React 19", not "React")
4. **File structure** — What does the generated project look like? List the actual files and folders.
5. **Database choice** — If applicable, pick ONE option (not "X or Y").
6. **Auth provider** — If applicable, pick ONE recommended provider.
7. **Hosting config** — Exact deployment steps, not just "use Vercel."
8. **Build tool config** — Specific vite.config, tsconfig, etc. settings needed.
9. **CSS strategy** — CDN for dev vs build for prod? Pick one per context and be explicit.
10. **Agent config format** — .cursorrules (legacy) vs .cursor/rules/*.mdc (current)? Pick one or support both explicitly.

### Common Gaps That Cause Questions

These are things planners often leave vague but implementers need concrete:

- "Integrate with X" — HOW? Via URL reference? npm install? Copy files? Clone repo?
- "Use X for styling" — Include it HOW? CDN link? npm install + config? Inline?
- "Deploy to GitHub Pages" — What's the base path? What's the build command? What's the workflow?
- "Support both static and server" — Are these two separate templates, or one template with conditional parts?
- "Optional feature X" — Who decides if it's included? The user during setup? The AI? Hardcoded?

### The Test

Read the plan and ask: **"Could I hand this to a junior developer (or AI agent) and they could start building without messaging me once?"**

If the answer is no, the plan needs more specifics.

## Questions to Ask the User

1. I've reviewed the plan for implementation readiness. Here are the decisions that are still ambiguous: [list them]. Can we resolve these now?
2. For [specific integration], should the implementer reference it via URL, install it as a dependency, or copy the files?
3. The plan mentions [X or Y] — which one should we go with?

## Output

After this review, update the plan JSON with:
- Any decisions that were resolved
- A new field in overview: `implementationNotes` (array of strings) — specific instructions for the implementing agent that don't fit in other sections
