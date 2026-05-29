# AI-Assisted Capture Validation Plan

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: product hypotheses, field-testing expectations, evaluation dimensions, and gates for expanding AI-assisted capture scope
- Related ADRs: [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [Decision Readiness Register](../adr/decision-readiness-register.md)
- Related docs: [Initial Vertical Slice](initial-vertical-slice.md), [Field Workflows](field-workflows.md), [User Research and Validation](user-research-and-validation.md), [AI-Assisted Capture and Confirmation Rules](../domain/ai-assisted-capture-and-confirmation-rules.md), [AI-Assisted Capture Boundaries](../architecture/ai-assisted-capture-boundaries.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines a product-validation plan for determining whether voice-assisted recording and photo-assisted counting genuinely reduce burden for small farms before expanding the product or investing in complex model infrastructure.

## Current Evidence Status

Voice assistance and photo counting are promising concepts motivated by the need to reduce cumbersome field data entry.

Their actual usefulness, error tolerance, preferred workflows, offline requirements, and privacy acceptability have not yet been sufficiently validated with farmers/workers in this repository.

These features must remain controlled draft-and-confirm experiments in the standalone mobile pilot until evidence supports expansion.

During the pilot, confirmed AI-assisted records remain local/private unless exported or backed up by the user. Any future sharing, publication, server inference, model provider, synchronization, or capture transfer remains a separate later decision.

## Validation Principles

1. Test whether the workflow reduces burden, not merely whether the technology functions.
2. Evaluate in realistic farm environments, not only clean demonstrations.
3. Measure correction effort and trust, not only model accuracy.
4. Prefer narrow successful workflows over broad unreliable capability.
5. Avoid collecting sensitive audio/photo data unnecessarily.
6. Do not expand AI-assisted scope until first-slice evidence supports doing so.

## Voice-Assisted Capture Hypotheses

| Hypothesis | Why it matters | Validation approach | Evidence needed to expand |
| --- | --- | --- | --- |
| Workers find voice useful when hands are occupied or dirty | Establishes real value | Interviews, workflow observation, prototype task tests | Repeated preference or faster successful recording |
| Harvest records are a natural voice-entry target | Determines first voice workflow | Ask farmers to describe actual harvest entries aloud; prototype test | Low correction burden and understandable confirmation |
| Material-use records are suitable for voice entry | Determines secondary scope | Test with actual input names/units | Reliable item/unit correction experience |
| Movement records are suitable for voice entry | Tests location/item ambiguity | Test with local farm location vocabulary | Acceptable correction burden |
| Voice assistance must work fully offline to be useful | Determines later technical constraint | Conduct tests in low/no-connectivity settings | Users reject delayed interpretation or accept it |

## Photo-Assisted Counting Hypotheses

| Hypothesis | Why it matters | Validation approach | Evidence needed to expand |
| --- | --- | --- | --- |
| Seedling flats are repeatedly counted and difficult enough to justify assistance | Determines best initial target | Interviews and direct observation | Recurring real task with measurable burden |
| Photos of flats can be captured under realistic conditions | Determines feasibility | Collect consented sample scenarios/prototype testing | Usable framing and correction flow |
| Harvest crates are a valuable secondary count category | Determines expansion | Observe wash/pack or harvest flow | Clear operational value |
| Users trust a corrected count observation | Determines workflow acceptance | Show draft/correction interaction | Users understand count is not silently final |
| Captured photos are acceptable to retain locally, export/back up, or later transfer | Determines privacy and storage posture | Discuss retention/export/backup options directly | Explicit preference/consent pattern |

## Evaluation Dimensions

| Dimension | Questions to answer |
| --- | --- |
| Frequency | Does the activity occur often enough to matter? |
| Time saved | Is assisted capture faster than manual entry after correction? |
| Correction burden | How often must users correct item, quantity, unit, or location? |
| Trust | Do users understand that they must confirm? Do errors reduce willingness to use it? |
| Offline value | Does the workflow remain valuable if interpretation is delayed until connected? |
| Environment robustness | Does noise, weather, light, clutter, occlusion, or gloves degrade usefulness? |
| Privacy acceptability | Are users comfortable with local retention or server transfer of source audio/photos? |
| Scope discipline | Is one narrow workflow successful enough to implement before adding others? |

## Prototype Test Scenarios

### Voice Scenario A: Harvest Recording

A worker attempts to record a real or simulated harvest statement using local crop and location names.

Observe:

- Whether speaking feels natural.
- Whether quantity/unit/location are correctly understood or easily corrected.
- Whether the confirmation step is acceptable.
- Whether the user prefers this to manual entry.

### Voice Scenario B: Material Use

A worker records use of a locally relevant material/input.

Observe:

- Item naming variation.
- Unit ambiguity.
- Location/context usefulness.
- Whether this event is common enough to support.

### Voice Scenario C: Item Movement

A worker records moving flats/crates/materials between locations.

Observe:

- Ambiguity between source/destination.
- Local names for locations.
- Usefulness relative to manual entry.

### Photo Scenario A: Seedling-Flat Count

A worker photographs flats in a realistic bench/storage setting.

Observe:

- Visibility and occlusion.
- Whether the user can frame a useful photo.
- Count-correction effort.
- Whether retained photo is acceptable.

### Photo Scenario B: Harvest-Crate Count

Use this scenario only if harvest-crate counting is relevant to observed farm work.

Observe the same criteria as the seedling-flat scenario.

## Expansion Gates

Broader AI-assisted feature work should not proceed until evidence supports it.

| Proposed expansion | Minimum evidence before considering it |
| --- | --- |
| More voice-record types | Existing supported voice workflows show acceptable correction effort and farmer value |
| More photo-count classes | Existing class demonstrates repeated real-use value and acceptable trust |
| Server-side reprocessing | Users accept connectivity/retention implications and it improves useful results |
| Retaining captures for model improvement | Explicit consent/privacy governance exists |
| AI-generated suggestions beyond recording | Separate product justification, safety analysis, and canonical documentation update |
| Disease/treatment functionality | Explicitly outside present direction; requires separate high-stakes review and should not be assumed |

## Findings Record Template

```markdown
## Validation Session: <identifier/date>

- Participant role:
- Farm/work context:
- Workflow tested:
- Connectivity context:
- Data-capture consent obtained: yes/no/not applicable
- Hypothesis tested:

### Observed current process

...

### Assisted workflow reaction

...

### Errors or correction burden

...

### Privacy/offline concerns raised

...

### Evidence outcome

- Status: unvalidated | supported by interview evidence | supported by observed workflow | supported by prototype test | rejected | deferred
- Implication for product scope:
- Implication for later architecture/ADR work:
```

Do not record actual farmer information unless such research has been performed and appropriate consent/data-handling procedures are in place.
