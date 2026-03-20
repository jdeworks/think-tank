# Section: Security

## What to Capture
- Authentication method (OAuth, JWT, session-based, passwordless)
- Authorization model (RBAC, ABAC, simple roles)
- Data encryption (at rest, in transit)
- API key management
- Known security risks and mitigations
- Compliance requirements (GDPR, SOC2, HIPAA, etc.)

## Questions to Ask
1. Do users need accounts? If so, how do they log in?
2. Are there different user roles with different permissions?
3. What sensitive data do you store? (Personal info, payments, health data?)
4. Does this need to comply with any regulations? (GDPR if EU users, etc.)
5. Are there any third-party API keys the app needs to manage securely?

## Quality Tips
- Don't build your own auth. Use a provider (Auth0, Clerk, Supabase Auth, Firebase Auth).
- HTTPS everywhere. No exceptions. (Most hosts do this automatically now.)
- Never store passwords in plain text. (If using a provider, this is handled for you.)
- Principle of least privilege: users should only access what they need.
- If you store EU user data, you need GDPR compliance. This affects your architecture.

## Common Mistakes
- Rolling your own auth system (security bugs guaranteed)
- Storing API keys in frontend code or git repos
- No rate limiting on APIs (invitation for abuse)
- Ignoring GDPR until it's too late to retrofit
- Not having a security incident response plan
