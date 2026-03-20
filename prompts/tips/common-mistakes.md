# Common Planning Mistakes

## Scope
- **Building too much for v1.** The best v1 does ONE thing well. Add features after launch based on real user feedback, not assumptions.
- **"Everyone" is the target user.** Pick a niche. Serve 100 people perfectly rather than 10,000 people poorly.
- **No non-goals.** Without explicit boundaries, every feature request gets in.

## Technical
- **Choosing tech you don't know.** Learning a new framework AND building a product at the same time doubles your timeline.
- **Over-engineering.** Microservices for a solo project. Kubernetes for 50 users. NoSQL when you need joins. Start simple.
- **No testing plan.** "We'll add tests later" means "We'll never add tests."

## Process
- **No MVP definition.** If you can't describe what "launch" looks like, you'll never get there.
- **Planning in isolation.** Talk to potential users BEFORE planning. Your assumptions about what they want are probably wrong.
- **Waterfall planning.** Don't plan 12 months of features. Plan 2-4 weeks, build it, learn, replan.

## Business
- **Ignoring competitors.** "Nobody does this" almost always means "I haven't looked hard enough."
- **No budget cap.** Set a maximum spend. If you hit it before launch, something is wrong with the plan.
- **Not calculating dev time as cost.** 100 hours at $50/hour is $5,000. That's your real investment.

## Security
- **"We'll add security later."** Auth, HTTPS, input validation — these need to be in v1.
- **Storing secrets in code.** Use environment variables. Always.
- **Ignoring compliance.** If you have EU users, you need GDPR compliance. Plan for it.
