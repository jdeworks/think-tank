# Section: Tech Stack

## What to Capture
- Frontend: framework, UI library, state management
- Backend: language, framework, runtime
- Database: type (SQL/NoSQL/graph), specific product
- Infrastructure: cloud provider, containerization
- Key dependencies and why
- Rationale for choices

## Questions to Ask
1. Do you or your team have experience with specific languages/frameworks?
2. Does this need server-side rendering (SEO-critical content)?
3. How complex is the data? (Simple key-value? Complex relationships? Full-text search?)
4. Do you need real-time capabilities? (WebSocket, SSE, push notifications)
5. What's your budget for infrastructure? ($0? $50/mo? $500/mo?)

## Quality Tips
- Pick boring technology. Proven stacks reduce risk. Innovation should be in your product, not your infrastructure.
- Match the stack to the team. A perfect tech choice that nobody on the team knows is the wrong choice.
- Consider the hiring market if you plan to grow the team.
- Every dependency is a liability. Fewer dependencies = less maintenance.
- Always explain WHY, not just WHAT. "React because our team knows it" is better than "React because it's popular."

## Common Mistakes
- Choosing tech because it's trending, not because it fits
- Using a database you don't need (NoSQL when SQL would be simpler)
- Not considering the learning curve for the team
- Over-relying on third-party services for core functionality
- Ignoring the long-term maintenance cost of each dependency
