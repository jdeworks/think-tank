# Section: Architecture

## What to Capture
- System type (web app, mobile app, API, CLI, desktop app, etc.)
- Architecture pattern (monolith, microservices, serverless, JAMstack, etc.)
- Components (name, description, connections between them)
- Data model (entities, fields, relationships)
- API design (REST, GraphQL, WebSocket, etc.)

## Questions to Ask
1. What type of system is this? (Web app? Mobile? API? CLI?)
2. Does it need real-time features? (Chat, live updates, collaboration)
3. What data does it store? What are the main "things" (entities)?
4. How do those things relate to each other? (User has many Projects, etc.)
5. Does it need to integrate with external services? (Payments, email, auth providers)

## Quality Tips
- Start simple. A monolith is almost always the right choice for v1.
- Only go serverless/microservices if you have a specific scaling need.
- Draw the component diagram — if you can't draw it, you don't understand it.
- Every arrow between components is a potential failure point. Minimize connections.
- Data model is the foundation. Get this wrong and everything else suffers.

## Common Mistakes
- Over-engineering: microservices for a project with 100 users
- No clear data model (leads to spaghetti code)
- Forgetting about state management (where does truth live?)
- Not thinking about caching strategy
- Ignoring API versioning from the start
