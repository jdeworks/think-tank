# Quality Checklist

Use this to verify a plan is complete and high-quality before finalizing.

## Gate 0 — Foundation Completeness
### This gate runs FIRST. All other checks are blocked until this passes.

- [ ] **Primary user description** is a specific person or role scenario
      (NOT a demographic category like "developers" or "small businesses")
- [ ] **Device/context** is specified (not "any device" or unspecified)
- [ ] **Comfort level** is anchored to a named tool, app, or process
      (NOT abstract labels like "non-technical" or "tech-savvy")
- [ ] **First success** is a concrete observable action (NOT a feeling)
- [ ] **Design filter sentence** is present:
      "If [person], [context], cannot [action] without help, [consequence]."

If ANY of the above fail, report ONLY the foundation gap. Do not review other sections
until foundation is complete.

## Completeness
- [ ] All planning sections have meaningful content (not just filler)
- [ ] Implementation review has been done
- [ ] Overview has specific goals AND non-goals
- [ ] At least 3 competitors or alternatives analyzed with strengths AND weaknesses
- [ ] Requirements are prioritized (must/should/nice)
- [ ] Architecture/structure has components or processes with connections
- [ ] Key tool/technology choices each have a rationale (WHY, not just WHAT)
- [ ] Hosting/operations has a cost estimate (even if $0)
- [ ] Security/compliance has been addressed (even if minimal — say so explicitly)
- [ ] At least 3 risks identified with concrete mitigations
- [ ] For software: codebase complexity is anticipated (LOC estimate, file count, growth areas)
- [ ] Timeline has phases with specific deliverables

## Clarity
- [ ] A non-technical person could read the overview and understand the project
- [ ] No unexplained jargon or acronyms
- [ ] Goals are measurable (numbers or observable outcomes, not feelings)
- [ ] "Done" is defined for each milestone

## Realism
- [ ] Timeline accounts for the team size, availability, and external dependencies
- [ ] Budget includes ALL costs (setup + ongoing operations + your time)
- [ ] First version scope is genuinely minimal (could be ready in weeks, not months)
- [ ] Risks include non-technical ones (market, resource, legal, logistics)

## Actionability
- [ ] Someone could start building/executing from this plan tomorrow
- [ ] First task of Phase 1 is clear and specific
- [ ] Key choices are concrete (specific tools/vendors/partners, not vague categories)
- [ ] Information model is defined enough to start tracking data

## Implementation Readiness
- [ ] The design filter sentence is actionable — every decision can be tested against it
- [ ] The primary user's device/context is unambiguous
- [ ] The primary user's first success action is testable
- [ ] Every "X or Y" choice has been resolved to a single answer
- [ ] For digital products: exact versions, file structure, build/deploy commands specified
- [ ] For physical projects: location specifics, supplier choices, permits, opening checklist
- [ ] Test: "Could someone implement this with zero follow-up questions?"
