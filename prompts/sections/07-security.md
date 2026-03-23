# Section: Security & Compliance

> **Adapt to the project type.** For software: auth, encryption, API security.
> For physical businesses: access control, data privacy, payment security, permits.

## What to Capture
- Authentication/access control (who can access what?)
- Data protection (what sensitive data exists and how is it protected?)
- Known security risks and mitigations
- Compliance requirements (GDPR, PCI-DSS, local regulations, etc.)

## Questions to Ask

### For all projects:
1. Do users/customers need accounts? If so, how do they identify themselves?
2. Are there different roles with different permissions?
3. What sensitive data do you handle? (Personal info, payments, health data?)
4. Does this need to comply with any regulations?

### For digital products (add):
5. Are there third-party API keys the app needs to manage securely?

### For physical businesses (add):
5. How is payment handled? (Cash, card, mobile payments?)
6. Who has access to the premises, inventory, or cash?

## Quality Tips
- For digital: don't build your own auth — use a provider.
- For physical: don't skip payment security — use established payment processors.
- Principle of least privilege: people should only access what they need.
- If you handle EU user data, you need GDPR compliance.
- Every project that handles money or personal data has security requirements — even if simple.

## Common Mistakes
- Assuming "we're too small for security to matter"
- Not having a plan for when things go wrong (security incident response)
- Ignoring data privacy regulations until it's too late
- For digital: storing secrets in frontend code or git repos
- For physical: no inventory controls or cash handling procedures
