# Section: Implementation Review

This is the final section before handing off to implementation. The goal: **an implementing team or agent should have zero questions.**

## What This Does

After all planning sections are complete, review the plan from the perspective of someone who has to BUILD or EXECUTE it. Identify and resolve any ambiguity, missing decisions, or gaps that would force the implementer to stop and ask questions.

## Review Checklist

### Decisions That Must Be Made (not left open)

For each of these, the plan must have a SPECIFIC answer, not "either X or Y":

**For all projects:**
1. **Primary deliverable** — What is the first concrete thing that gets built, launched, or opened?
2. **Scope boundary** — What's explicitly included in v1 and what's not?
3. **Key vendor/partner choices** — If the plan mentions alternatives, pick one.
4. **Budget allocation** — How is the budget split across the major areas?
5. **Success criteria** — How will you know v1 worked? (Tie to the design filter.)

**For digital products (add these):**
6. **Exact versions** — Which version of each framework/library?
7. **File structure** — What does the project look like? List actual files and folders.
8. **Deployment steps** — Specific commands, not just "deploy to Vercel."
9. **Build tool config** — Specific settings needed.
10. **Integration method** — For each dependency: URL reference? npm install? copy files?

**For physical businesses/services (add these):**
6. **Location specifics** — Exact address or area, lease terms, capacity.
7. **Supplier choices** — Who provides what, with backup options.
8. **Staffing plan** — How many people, what roles, hire-by dates.
9. **Permits and licenses** — What's needed and timeline to obtain.
10. **Opening day checklist** — What must be ready before the first customer.

### Common Gaps That Cause Questions

These are things planners often leave vague but implementers need concrete:

- "Integrate with X" — HOW? Via what method?
- "Support both X and Y" — Are these separate things or one thing with options?
- "Optional feature X" — Who decides if it's included?
- "Use X for [purpose]" — Include it HOW? What's the setup?
- "Launch by [date]" — What specifically must be done by that date?

### Provider and library switch hygiene

If the plan involves switching from one provider/library to another (e.g., switching TTS engines, payment processors, auth providers):

- Grep for all references to the old provider name — **including string literals**. Import analysis misses constants like `"HUME_AI"` or `provider: "stripe"`.
- Dead code from provider switches persists silently because it doesn't cause errors.
- Schedule an explicit cleanup session after the switch, don't assume it will happen naturally.
- Log all removed symbols in the changelog so future developers know what was intentionally deleted vs. accidentally lost.

### The Test

Read the plan and ask: **"Could I hand this to a junior team member (or AI agent) and they could start executing without messaging me once?"**

If the answer is no, the plan needs more specifics.

## Questions to Ask the User

1. I've reviewed the plan for implementation readiness. Here are the decisions that are still ambiguous: [list them]. Can we resolve these now?
2. For [specific integration/vendor/partner], how exactly should the implementer proceed?
3. The plan mentions [X or Y] — which one should we go with?

## Output

After this review, update the plan JSON with:
- Any decisions that were resolved
- A new field in overview: `implementationNotes` (array of strings) — specific instructions for the implementer that don't fit in other sections
