# Best Practices for Project Planning

## Start With "Why"
Before deciding WHAT to build or HOW to build it, be crystal clear on WHY it needs to exist. What pain point does it address? If you can't articulate the pain clearly, the project will drift.

## Ship Early, Ship Often
- Week 1-2: Working prototype with core feature
- Week 3-4: MVP with basic polish and tests
- Month 2: First real users providing feedback
- Month 3+: Iterate based on real usage data

## Use Boring Technology
Exciting, cutting-edge tools are exciting because they're unproven. For your project's infrastructure, pick the most boring, well-documented, widely-supported option. Save innovation for your product, not your tooling.

Good "boring" choices:
- **Frontend:** React, Vue, or plain HTML/CSS/JS
- **Backend:** Node.js, Python, or Go
- **Database:** PostgreSQL (relational) or SQLite (embedded)
- **Hosting:** Vercel, Netlify, or Railway
- **CI/CD:** GitHub Actions

## Design for Your CURRENT Scale
Build for 100 users, not 1 million. You can always refactor when you hit 10,000 — and most projects never do. Premature optimization is the root of all evil.

## Every Decision is a Trade-off
There are no "best" choices, only trade-offs:
- **Speed vs. quality:** Move fast and break things, or move carefully and ship solid?
- **Features vs. simplicity:** More options for power users, or simpler for everyone?
- **Build vs. buy:** Build it yourself (full control) or use a service (faster but dependent)?
- **Cost vs. convenience:** Free tier with limitations, or paid for better DX?

Document the trade-off for each major decision so future-you understands why you chose what you chose.

## Test From Day One
- At minimum: automated tests for your critical path (sign up, core action, payment)
- Use the testing pyramid: many unit tests, some integration tests, few E2E tests
- Tests are documentation — they show how your code is supposed to work

## Document Decisions, Not Just Code
- README: how to set up, run, and contribute
- Architecture Decision Records (ADRs): WHY you chose X over Y
- Inline comments: only for non-obvious logic, not for obvious code
