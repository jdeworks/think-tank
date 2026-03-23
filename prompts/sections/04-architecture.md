# Section: Architecture

> **Adapt to the project type.** For web/mobile apps: system architecture, components, data model.
> For developer tools/CLIs/APIs: command structure, plugin model, distribution, integration points.
> For physical businesses/services/events: operational structure, process flow, key systems.

## What to Capture
- System or business type (web app, mobile app, physical store, service, event, etc.)
- Structure or pattern (how the parts fit together)
- Components (name, description, connections between them)
- Data or information model (what "things" exist and how they relate)
- Integration points (external services, suppliers, partners, APIs)

## Questions to Ask

### For web/mobile apps:
1. What type of system is this? (Web app? Mobile? PWA? Hybrid?)
2. Does it need real-time features? (Chat, live updates, collaboration)
3. What data does it store? What are the main entities?
4. How do those things relate to each other?
5. Does it need to integrate with external services?

### For developer tools, CLIs, and APIs:
1. What's the command/endpoint structure? (Subcommands? REST resources? GraphQL schema?)
2. How is it distributed? (npm global? Homebrew? Docker? Binary download? API hosted where?)
3. Does it need local state or config between runs? (Config files? Cache? Database?)
4. Does it support plugins or extensions?
5. What existing tools or APIs does it integrate with?

### For physical businesses/services/events:
1. What's the structure? (Single location? Multiple? Mobile? Online+offline?)
2. Walk me through the customer journey from discovery to completion.
3. What are the key operational processes? (Inventory, scheduling, delivery, etc.)
4. What information do you need to track? (Customers, orders, inventory, bookings?)
5. What external partners or suppliers are involved?

## Quality Tips
- Start simple. A straightforward structure is almost always right for v1.
- Draw the component/process diagram — if you can't draw it, you don't understand it.
- Every connection between components is a potential failure point. Minimize them.
- The data/information model is the foundation. Get this wrong and everything suffers.
- Consider what happens when things go wrong — where are the bottlenecks?

## Common Mistakes
- Over-engineering: complex architecture for a simple problem
- No clear data/information model
- Forgetting about how state or information flows between parts
- Not thinking about capacity and peak load
- Ignoring how components depend on each other
