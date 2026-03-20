# Section: Hosting & Deployment

## What to Capture
- Hosting platform (Vercel, Netlify, AWS, GitHub Pages, Railway, Fly.io, etc.)
- CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
- Environments (dev, staging, production)
- Domain and DNS
- Estimated monthly hosting cost

## Questions to Ask
1. Does this need a server or can it be static? (Huge cost difference)
2. Do you need staging/preview environments for testing?
3. What's your expected traffic? (10 users/day? 10,000?)
4. Do you have a domain name in mind?
5. How important is uptime? (Hobby project vs. business-critical)

## Quality Tips
- Static sites (GitHub Pages, Netlify, Vercel) are free and fast. Use them when possible.
- For servers: start with the smallest instance. You can always scale up.
- Always have CI/CD from day one. Manual deployments cause incidents.
- Use preview deployments for PRs — catch bugs before they hit production.
- Free tiers: Vercel (100GB bandwidth), Netlify (100GB), GitHub Pages (unlimited for public repos), Railway ($5 free credit), Fly.io (3 shared VMs free).

## Common Mistakes
- Paying for hosting before you have users
- No CI/CD pipeline (deploying manually from a laptop)
- No staging environment (testing in production)
- Not considering bandwidth costs for media-heavy sites
- Choosing a complex cloud provider when a simple PaaS would work
