# Quality Checklist

Use this to verify a plan is complete and high-quality before finalizing.

## Gate 0 — Foundation Completeness
### This gate runs FIRST. All other checks are blocked until this passes.

- [ ] **Primary user description** is a specific person or role scenario
      (NOT a demographic category like "developers" or "small businesses")
- [ ] **Device/context** is specified (not "any device" or unspecified)
- [ ] **Technical comfort** is anchored to a named tool, app, or process
      (NOT abstract labels like "non-technical" or "tech-savvy")
- [ ] **First success** is a concrete observable action (NOT a feeling)
- [ ] **Design filter sentence** is present:
      "If [person], [context], cannot [action] without help, [consequence]."

If ANY of the above fail, report ONLY the foundation gap. Do not review other sections
until foundation is complete.

## Completeness
- [ ] All planning sections have meaningful content (not just filler)
- [ ] Implementation review (section 12) has been done
- [ ] Overview has specific goals AND non-goals
- [ ] At least 3 competitors analyzed with strengths AND weaknesses
- [ ] Requirements are prioritized (must/should/nice)
- [ ] Architecture has a component diagram with connections
- [ ] Tech stack choices each have a rationale (WHY, not just WHAT)
- [ ] Hosting has a cost estimate (even if $0)
- [ ] Security has been addressed (even if "no auth needed" — say so explicitly)
- [ ] At least 3 risks identified with concrete mitigations
- [ ] Timeline has phases with specific deliverables

## Clarity
- [ ] A non-technical person could read the overview and understand the project
- [ ] No unexplained jargon or acronyms
- [ ] Goals are measurable (numbers, not feelings)
- [ ] "Done" is defined for each milestone

## Realism
- [ ] Timeline accounts for the team size and availability
- [ ] Budget includes ALL costs (hosting + services + dev time + maintenance)
- [ ] MVP scope is genuinely minimal (could launch in 1-2 weeks)
- [ ] Risks include non-technical ones (market, resource, legal)

## Actionability
- [ ] Someone could start building from this plan tomorrow
- [ ] First task of Phase 1 is clear and specific
- [ ] Technology choices are concrete (specific frameworks, not "some JS framework")
- [ ] Data model is defined enough to create database tables

## Implementation Readiness
- [ ] The design filter sentence is actionable — an implementer can test every decision against it
- [ ] The primary user's device/context is unambiguous
- [ ] The primary user's first success action is testable
- [ ] Every "X or Y" choice has been resolved to a single answer
- [ ] Exact library versions specified (not just "React" but "React 19")
- [ ] Integration method is explicit (URL reference? npm install? copy files?)
- [ ] File/folder structure of the output is listed
- [ ] Build and deployment steps are specific commands, not descriptions
- [ ] Test: "Could an AI agent implement this with zero follow-up questions?"
