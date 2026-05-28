# Local Coordination and Sharing Validation Plan

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: product hypotheses, validation gates, and farmer research expectations for local sourcing, controlled sharing, listing audiences, and privacy expectations
- Related ADRs: [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [Decision Readiness Register](../adr/decision-readiness-register.md)
- Related docs: [Product Vision and Scope](product-vision-and-scope.md), [Initial Vertical Slice](initial-vertical-slice.md), [Field Workflows](field-workflows.md), [User Research and Validation](user-research-and-validation.md), [Sourcing and Local Network Model](../domain/sourcing-and-local-network-model.md), [Privacy, Visibility, and Sharing Rules](../domain/privacy-visibility-and-sharing-rules.md), [Identity, Privacy, and Sharing Architecture](../architecture/identity-privacy-and-sharing.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines a product-validation plan for determining whether local sourcing and controlled sharing are useful to small farms and what privacy/visibility expectations must govern that functionality.

It prevents the project from assuming that farmers want broad networking, public listings, or disclosure of operational data.

## Current Evidence Status

Raw-material sourcing and communication with nearby farmers were initial motivating concerns.

A narrow need-listing workflow appears potentially valuable.

The preferred sharing audience, acceptable disclosed fields, communication mechanism, trust model, and hosting implications still require validation in this repository.

The product should test controlled sharing before attempting a broad marketplace or social-network model.

## Validation Principles

1. Ask farmers what they already coordinate informally before designing a network.
2. Test concrete sharing examples rather than abstract willingness to "share data."
3. Distinguish sharing a need or offer from sharing internal inventory or production history.
4. Prefer trusted/local/private coordination before considering public visibility.
5. Test whether listing creation is worth the effort relative to texts, calls, or existing groups.
6. Protect privacy and farm autonomy during research.
7. Expand coordination scope only when evidence demonstrates value.

## Hypotheses to Validate

| Hypothesis | Why it matters | Validation approach | Decision affected |
| --- | --- | --- | --- |
| Farmers experience recurring difficulty sourcing specific materials locally | Determines whether need listings solve a real problem | Interviews and recent-example collection | First-slice sourcing workflow |
| Farmers would share selected needs with trusted nearby farms | Determines sharing audience | Present sample listing scenarios | Visibility model |
| Farmers would not want internal inventory quantities or usage history exposed | Determines privacy rules | Compare listing vs internal-record examples | Publication boundary |
| A simple request/response pathway is sufficient initially | Prevents overbuilding messaging | Ask how they currently respond | Coordination scope |
| Farmers may be willing to publish selected surplus offers later | Determines availability-listing roadmap | Discuss concrete examples | Later release scope |
| Farmers may prefer cooperative/group purchasing over ad hoc listings | Identifies alternative value path | Interview around common purchases | Roadmap |
| Farm identity and location disclosure need controls | Determines listing profile/privacy behavior | Ask what identity/location detail feels safe | Later visibility settings |
| Photos/audio should remain private unless separately shared | Determines attachment policy | Present capture-sharing scenarios | Privacy architecture |

## Concrete Interview Scenarios

### Scenario A: Material Need Listing

Present this scenario:

> You realize you will need twenty bags of potting mix next week. Would you want a tool that lets you share a request with nearby farmers or a trusted farm group?

Ask:

- Would this be useful?
- Who should be able to see it?
- What item, quantity, timing, or location information would you share?
- Would you want your farm name visible?
- Would you want to keep your remaining inventory private?
- How would you want someone to respond?

### Scenario B: Surplus Availability, Later

Present this scenario:

> You have extra seedling flats, compost, straw, crates, or another farm input available.

Ask:

- Would you share that information?
- Would you state a limited offered amount rather than your total inventory?
- Would you want offers visible only to selected contacts?
- Is this useful enough to justify inclusion after needs listings?

### Scenario C: Equipment or Transportation Capacity, Later

Present this scenario:

> You may be able to lend equipment, transport supplies, or combine a supply run.

Ask:

- Is this a real recurring need?
- What liability, trust, or scheduling concerns arise?
- Should the project defer this until simpler materials listings are proven?

### Scenario D: Attachment Sharing

Present this scenario:

> The app may use a photo internally to help count flats or verify a material. Should that photo ever be included in a shared need listing?

Ask:

- Would farmers expect source photos to remain private?
- Are there scenarios where deliberately attaching a new photo to a listing would help?
- What content might unintentionally reveal sensitive information?

## Information-Sharing Matrix for Validation

| Information | Likely private by default | Might be shared intentionally | Requires validation |
| --- | ---: | ---: | ---: |
| Needed item name | No, once listing is intentionally created | Yes | Yes |
| Desired amount | Private before publication | Possibly | Yes |
| Needed-by date | Private before publication | Possibly | Yes |
| Farm name | Private unless selected/default defined later | Possibly | Yes |
| Contact information | Private | Possibly with controlled exposure | Yes |
| Approximate region/pickup area | Private | Possibly | Yes |
| Exact farm address/location | Yes | Only if necessary and intentionally shared | Yes |
| Current inventory count | Yes | Generally not needed | Yes |
| Usage history | Yes | No expected initial need | Yes |
| Crop plans affected by shortage | Yes | No expected initial need | Yes |
| Source photo/audio | Yes | No by default | Yes |
| A separate listing-specific photo, later | Private until attached intentionally | Possibly | Yes |
| Supplier pricing/history | Yes | No expected initial need | Yes |

## Evaluation Dimensions

| Dimension | Questions to answer |
| --- | --- |
| Need frequency | How often do sourcing problems occur? |
| Urgency | Is timing important enough for a digital listing to help? |
| Audience preference | Trusted group, direct contacts, cooperative, or public? |
| Disclosure comfort | Which fields feel safe and necessary? |
| Response mechanism | Is contact information enough, or is messaging needed? |
| Network value | Does usefulness increase with number/type of participants? |
| Trust risk | What would cause farmers not to participate? |
| Workflow burden | Is posting faster or more reliable than current methods? |
| Offline relevance | Would farmers create requests while disconnected and publish later? |
| Expansion value | Are offers, pooled purchases, equipment sharing, or transport worthwhile later? |

## Validation Statuses

Use or align with the status vocabulary already established in product research documents:

```text
unvalidated
supported by interview evidence
supported by observed workflow
supported by prototype test
rejected
deferred
```

## Expansion Gates

| Proposed expansion | Minimum evidence before considering it |
| --- | --- |
| Availability listings | Farmers identify recurring surplus-sharing value and acceptable privacy boundaries |
| In-product messaging | Simple contact/response flow is insufficient in actual use |
| Group purchasing | Multiple farms report repeated shared-input purchasing need |
| Equipment/resource sharing | Strong need plus trust/liability/scheduling considerations understood |
| Public listing visibility | Clear farmer demand plus privacy, abuse, and moderation analysis |
| Listing attachments | Demonstrated usefulness plus explicit attachment privacy design |
| Multi-network or server federation | Real deployment need after simpler network model is proven |

## Findings Record Template

```markdown
## Local Coordination Validation Session: <identifier/date>

- Participant role:
- Farm/work context:
- Coordination topic tested:
- Consent obtained for notes/recording, if applicable:
- Hypothesis tested:

### Current sourcing or communication practice

...

### Need/offer examples discussed

...

### Preferred sharing audience

...

### Information participant would share

...

### Information participant would not share

...

### Response/contact expectations

...

### Privacy, trust, or attachment concerns

...

### Offline/deployment considerations

...

### Evidence outcome

- Status: unvalidated | supported by interview evidence | supported by observed workflow | supported by prototype test | rejected | deferred
- Implication for product scope:
- Implication for privacy/architecture/ADR work:
```

Do not record actual farmer-specific sensitive data unless research has occurred and appropriate consent/data-handling procedures are in place.
