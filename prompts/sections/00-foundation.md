# Section 00 — Foundation: Who Is This For?

## Why this section exists

Every downstream decision — architecture, tech stack, hosting, UI design, pricing —
is constrained by who will actually use what you are building.

This section must be completed before any technical discussion begins.
The AI should not ask about databases, frameworks, or deployment until it has
a concrete answer to: who is the first person who will use this, and what does
success look like for them?

This applies to any kind of project — software, a physical store, a service,
a community, an event, a product line. If it has a user or customer, this section applies.

---

## What the AI must establish

### 1. The primary user — make them real

**Do NOT accept vague demographics. Challenge immediately:**

| Vague answer | Challenge |
|---|---|
| "developers" | "What kind of developer? Junior or senior? What language? What context?" |
| "small businesses" | "What kind? Who in the business actually uses it — owner, employee, manager?" |
| "non-technical users" | "What does non-technical mean here — can they use Gmail? Notion? A smartphone?" |
| "general users" | "Who is the first specific person who will try this? Paint me a picture." |
| "anyone who wants to..." | "Who wants to? Where are they? What's their situation?" |
| "customers" | "What kind of customer? Walk-in, online, referred? What's their day like?" |

**DO accept descriptions that pass this test: could you put this person in a room and recognise them?**

Examples of acceptable answers:
- "A 28-year-old freelance graphic designer in Manila who tracks client projects in a WhatsApp group and wants to send professional invoices."
- "A store manager at a 3-person hardware shop in Lagos who uses a Samsung Galaxy phone, WhatsApp, and Facebook — never used a web app."
- "A junior backend developer, 1-2 years experience, comfortable with the terminal but never set up CI/CD. Probably on macOS."
- "A retired couple in their 60s looking for a neighbourhood bakery with gluten-free options. They drive, use Google Maps, and read Facebook reviews."

### 2. Their device and context

Ask:
- "What device will they use this on primarily — phone, tablet, laptop, desktop? Or is this not a digital product?"
- "What is their likely context — at a desk, on the go, in a store, at home?"
- "If digital: what's their connection — fast WiFi, mobile data, slow or unreliable?"

**Why it matters:** A "simple" web app that requires a laptop and fast WiFi is not simple for someone who is phone-only on mobile data. A physical store concept needs foot traffic context, not bandwidth.

### 3. Their technical comfort — anchor to a tool, not a label

**Do NOT ask:** "Are they technical or non-technical?"

**DO ask:** "What existing tool, app, or process do they use every day that gives me a sense of their comfort level?"

This establishes a baseline without abstract labels:
- "They use WhatsApp and Facebook" → very different from
- "They're comfortable with GitHub and the terminal" → very different from
- "They use Notion and manage a team of 20" → very different from
- "They use a paper ledger and a calculator"

The anchor tells you everything about the acceptable complexity ceiling.

### 4. Their current solution and frustration

Ask:
- "What do they use right now to solve this problem — even if it's a workaround?"
- "What is the specific thing that makes the current solution painful or insufficient?"

**Why it matters:** The current solution defines the real competition and the minimum bar the product must clear. "They use a spreadsheet" sets a very different bar than "nothing — this problem goes unsolved."

### 5. First success — a concrete action, not a feeling

Ask: "Describe what this person does in their first interaction with your product. What is the one thing they need to accomplish for it to feel worth it?"

**Do NOT accept:**
- "They feel like it's intuitive"
- "They understand the product"
- "They get the value"

**DO accept:**
- "They create their first invoice and share it with a client within 5 minutes, without asking for help."
- "They walk in, find the gluten-free section, and leave with a purchase in under 10 minutes."
- "They deploy their app to a live URL using only the README."

The test: **can an outside observer watch this happen and confirm it occurred?**

---

## The design filter sentence

After collecting all of the above, synthesise one sentence:

```
"If [name or role], [key context], cannot [first success action] without help, [consequence]."
```

**Examples:**
- "If Maria, a non-technical mobile-only business owner in Davao City, cannot publish her site within 10 minutes without asking anyone for help, the UX is not acceptable."
- "If a first-time walk-in customer cannot find what they need and check out within 10 minutes, the store layout has failed."
- "If Sara, a junior developer unfamiliar with CI/CD, cannot deploy to staging using the README alone, the setup is too complex."

This sentence is written into the plan. It is used to evaluate every subsequent decision.

---

## Questions to ask (in order — wait for each answer before continuing)

**Question 1:**
> "Before we get into the details, let's nail down who this is for. Tell me about the first specific person who will use this — not a demographic, but a real person you can picture. Who are they? What's their situation?"

*If the answer is abstract, push back:*
> "Can you be more specific? [repeat their category] covers a huge range. What kind of [their category], doing what, where, with what context?"

**Question 2:**
> "What's their context when they interact with this? Are they at a desk, on their phone, walking into a store, browsing at home? And if it's digital — what kind of connection and device?"

**Question 3:**
> "What's a tool, app, or process they use every day that gives me a sense of their comfort level? Something similar in complexity to what you're building."

*If they say "non-technical", push back:*
> "What does that mean in practice? Can they use Gmail? A spreadsheet? Notion? WhatsApp? I'm looking for an anchor."

**Question 4:**
> "What do they currently use to solve this problem — even if it's messy or incomplete? A spreadsheet, a WhatsApp group, a competitor, nothing at all?"

**Question 5:**
> "Walk me through what this person does in their first interaction with your product. What do they need to accomplish for it to feel worth it?"

*If they give a feeling ("feel confident"), push back:*
> "What would that look like as a specific action? What would I observe happening?"

---

## Required output before moving on

The foundation section must contain all of the following before any section about architecture, tech stack, design, or hosting is started:

```json
{
  "foundation": {
    "primaryUser": {
      "description": "[specific person — at least a sentence, not a category]",
      "device": "[phone | tablet | laptop | desktop | in-person | mixed]",
      "context": "[where and how they interact]",
      "technicalComfortAnchor": "[a specific tool or process they use, not an abstract label]",
      "currentSolution": "[what they use now — can be 'nothing']",
      "firstSuccessAction": "[specific observable action, not a feeling]",
      "firstSuccessTimeframe": "[e.g. 'within 10 minutes of first use']"
    },
    "designFilter": "If [person], [context], cannot [action] without help, [consequence]."
  }
}
```

---

## Red flags — do not move on if any are true

- Primary user is described as a category without a scenario ("developers", "SMBs")
- Device/context is "any" or unspecified
- Technical comfort uses abstract labels without an anchor
- First success is a feeling, not an observable action
- Design filter sentence has not been written

---

## How this section constrains downstream sections

This is not just a data collection exercise. The foundation actively constrains later decisions:

**Overview (01):** Goals must be achievable by the primary user in their context.
Non-goals should exclude things requiring more than the primary user has.

**Requirements (02):** Every requirement should map to something the primary user needs.

**Architecture (03):** Every component must be reachable by the primary user.

**Tech Stack (04):** Complexity ceiling = what the primary user's anchor requires of them.

**Hosting (05):** Performance and access must match the primary user's context.

**Design (07):** UI/UX complexity must not exceed what the primary user can navigate.

**Budget (08):** Value is defined by whether first success is achievable at the price point.

The design filter sentence should be quoted verbatim whenever a major decision is being evaluated.
