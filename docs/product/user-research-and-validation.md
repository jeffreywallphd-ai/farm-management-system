# User Research and Validation

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: product evidence level, validation hypotheses, farmer interview guide, observation targets, and assumption status tracking
- Related ADRs: [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Product Vision and Scope](product-vision-and-scope.md), [Initial Vertical Slice](initial-vertical-slice.md), [Field Workflows](field-workflows.md), [Local Coordination and Sharing Validation Plan](local-coordination-and-sharing-validation-plan.md), [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md), [Roadmap](roadmap.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document separates observed motivation from untested assumptions and defines a concrete validation plan before large-scale implementation.

## Corrected Pilot Discovery Posture

The standalone offline-first mobile pilot is now the primary near-term discovery method. Research should observe whether farmers can use the mobile app during real work, whether local activity history is useful, whether local saved-state language is understandable, and whether practical export/backup expectations are clear enough before meaningful reliance.

Server synchronization, hosted/local server operation, in-product need-listing publication, shared responses, and broader network behavior remain future validation topics. Research may ask about those needs, but the current pilot does not implement them.

## Current Evidence Level

The product direction is motivated by direct interest in small-scale farming and recent exposure to the needs of a local farm.

Raw-material sourcing and communication with other local farmers have been identified as concerns.

Existing farm-management tools have appeared cumbersome in initial hands-on evaluation.

Detailed workflow frequency, adoption willingness, privacy expectations, and technical-deployment preferences still require systematic validation. Focused local sourcing, audience, attachment, and privacy questions are expanded in [Local Coordination and Sharing Validation Plan](local-coordination-and-sharing-validation-plan.md). Hosted, local, cooperative, backup, export, and data-control preferences are expanded in [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md).

This evidence is enough to motivate a narrow first product slice. It is not enough to claim that a broad market need has already been proven.

## Hypotheses to Validate

| Hypothesis | Why it matters | How to validate | Decision affected |
| --- | --- | --- | --- |
| Farmers find routine activity entry too burdensome in current tools | Determines value of recorder | Interviews and workflow observation | First-slice workflow design |
| Offline entry is essential during actual work | Determines core product constraint | Ask about locations/connectivity; observe workflow | Offline requirements |
| Voice entry is useful in dirty/hands-busy conditions | Determines whether to invest in voice capture | Show mock flow or prototype | Voice experiment |
| Photo counting is valuable for specific standardized items | Determines vision scope | Identify repeated counting tasks; test photos | Camera experiment |
| Farmers may want future sharing of selected needs/offers but not internal inventory | Determines whether server-connected coordination is justified later | Interview with concrete examples and optional private need-note pilot feedback | Future local-network scope |
| Farmers prefer simple hosted service, local server, standalone mobile export, or another path | Determines later deployment prioritization | Interviews and mobile pilot feedback | Deployment roadmap |

## Interview Guide

Use these questions as a semi-structured guide for farmers, workers, or farm operators. Adapt language to the person and farm context.

### Current Records and Tools

- What daily or weekly records do you currently keep?
- Which records are required, useful, or merely "nice to have"?
- What tools do you use now: memory, paper, spreadsheets, texts, farm software, photos, calendars, or something else?
- Which records do you avoid or delay because entry is too cumbersome?
- What information do you most often wish you had captured earlier?

### Field Work and Connectivity

- Where does recordkeeping usually need to happen: field, greenhouse, barn, wash/pack, storage, office, vehicle, or elsewhere?
- Where do phones lose reception or internet access?
- What happens today when a record should be made but connectivity is unavailable?
- What would make you trust that offline work has been saved?

### Materials, Sourcing, and Local Coordination

- Which materials, inputs, supplies, or equipment are most difficult to source locally?
- How do you currently ask nearby farms about needs, offers, borrowing, or sourcing?
- What information would you willingly share with trusted nearby farms?
- What information would you not want shared?
- Would a need listing tied to a low-material observation be useful, or would you prefer a separate communication flow?

### Voice and Camera Assistance

- When would speaking a record be easier than typing it?
- What would make you distrust a voice-created record?
- What repetitive counting tasks happen often enough to matter?
- Are there visually regular items, such as flats or crates, that could realistically be photographed for a count?
- What lighting, clutter, weather, or time pressure would make photo counting fail?

### Deployment and Adoption

- Would you expect this kind of tool to be hosted for you, run locally, run by a cooperative or regional group, or support multiple options?
- Who would maintain it if it required setup or updates?
- What would cause you or your workers to stop using the tool?
- What would make the tool valuable enough to keep using after the first week?

## Observation Targets

Observe actual work where possible:

- Harvesting.
- Transplant movement.
- Supply or material usage.
- Inventory counting.
- Sourcing communication.
- Greenhouse or storage workflows.
- Moments when workers cannot conveniently use a phone form.

Observation should focus on real interruptions, timing, language, and workarounds rather than asking farmers to imagine ideal software behavior.

## Validation Status Mechanism

Use these statuses for product assumptions:

```text
unvalidated
supported by interview evidence
supported by observed workflow
supported by prototype test
rejected
deferred
```

Later product docs must update assumptions when evidence becomes available. Do not allow an assumption to become treated as accepted product scope merely because it appears in a prompt, prototype, issue, or context pack.

## Ethical and Privacy Considerations in Research

- Obtain consent before recording interviews, photos, or videos.
- Avoid recording proprietary or sensitive farm information unnecessarily.
- Distinguish research notes from future operational farm records.
- Avoid promising functionality before implementation exists.
- Be clear when discussing prototypes, mockups, or possible features that have not been built.
