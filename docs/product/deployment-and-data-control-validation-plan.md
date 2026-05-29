# Deployment and Data-Control Validation Plan

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: product hypotheses and validation gates for hosted use, local operation, technical self-hosting, cooperative hosting, export, backup, and data-control preferences
- Related ADRs: [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0006](../adr/ADR-0006-deployment-mode-compatibility.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md), [Decision Readiness Register](../adr/decision-readiness-register.md)
- Related docs: [Product Vision and Scope](product-vision-and-scope.md), [Initial Vertical Slice](initial-vertical-slice.md), [Field Workflows](field-workflows.md), [User Research and Validation](user-research-and-validation.md), [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md), [Deployment Modes](../operations/deployment-modes.md), [Backup, Restore, and Data Export Requirements](../operations/backup-restore-and-data-export-requirements.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines a product-validation plan for determining what deployment and data-control choices actual farms value, rather than assuming that local hosting, managed hosting, cooperative hosting, or private-cloud operation should be prioritized based solely on technical preference.

## Current Evidence Status

Offline mobile use is a foundational product constraint based on the intended farm context.

Interest in local/self-hosted and hosted server modes exists as a design requirement and open-source/data-control goal.

The accepted initial operating experience is a standalone mobile pilot. Server-connected deployment preferences remain future validation questions.

Many farms may prefer minimal setup, while some may value local control, weak-internet operation, cooperative hosting, or managed support. Deployment priorities must be tested with real users and organizations.

The mobile pilot should also test immediate data-control expectations: what export/backup experience farmers need before relying on device-local records, and how sensitive audio/photo retention affects trust.

## Validation Principles

1. Separate offline mobile need from local-server preference.
2. Do not assume farmers want to operate infrastructure merely because they want data control.
3. Present understandable deployment experiences rather than technical terminology.
4. Ask about failure, support, backup, and recovery expectations, not just installation.
5. Validate willingness to maintain local hardware or pay for managed convenience.
6. Include cooperatives, food hubs, extension/support organizations, or technically capable local partners where relevant.
7. Keep private-data and attachment concerns part of deployment discussions.

## Hypotheses to Validate

| Hypothesis | Why it matters | Validation approach | Decision affected |
| --- | --- | --- | --- |
| Most individual farms prefer a hosted service if offline mobile use is reliable | Determines initial adoption pathway | Interviews with concrete hosted scenario | Hosted priority |
| Some farms prefer local operation due to connectivity or data-control concerns | Determines need for simplified local mode | Present local-server scenario | Local-server roadmap |
| Local synchronization over farm Wi-Fi during internet loss provides meaningful value | Determines topology complexity | Ask multi-worker farms about outages/work patterns | Local-network server capability |
| Farmers will not accept direct infrastructure administration requirements | Determines local UX expectations | Discuss setup/maintenance responsibilities | Packaging/installer posture |
| Data export/backup is important for standalone mobile pilot users | Determines immediate pilot data-safety requirements | Mobile pilot feedback and device-loss/app-update scenarios | Pilot export/backup scope |
| Data export is important even for hosted users | Determines later portability requirements | Present service-dependence scenarios | Future hosted export scope |
| Simple backup/restore is essential for local operation | Determines local viability | Discuss hardware-loss scenario | Operations requirements |
| Cooperatives or regional organizations may host services for multiple farms | Determines later multi-farm deployment value | Interview organizations where available | Cooperative roadmap |
| Sensitive audio/photos influence hosting preference | Determines privacy/deployment decisions | Discuss AI-capture retention scenarios | Attachment and hosting policy |
| Farms may prefer managed backup for local-server data | Determines hybrid service possibilities | Discuss recovery expectations | Later service options |

## Deployment Scenarios to Discuss With Farmers

### Scenario A: Hosted Service With Offline Mobile App

Present in plain language:

> You install the app, create or join your farm account, and use it normally. The phone still lets you record supported field work when you have no reception. When connection returns, it synchronizes to a managed service. You do not maintain a server.

Ask:

- Would this be acceptable?
- What data-control concerns would you have?
- Would you need export before relying on it?
- Would storing photos/audio affect your comfort?
- What would you expect if the service stopped operating?

### Scenario B: Simple Local Farm Server

Present:

> Your farm has a small local device or installed local service that stores/synchronizes your farm records when phones can reach it. You would need a simple backup/update process, but you would not manage developer infrastructure.

Ask:

- Would local control be valuable?
- Would synchronization during internet outages matter?
- Who would set it up and maintain it?
- What failure or backup concerns arise?
- Would you also want optional off-site backup or hosted access?

### Scenario C: Technical Self-Hosting

Present:

> The open-source system can be operated by a technical administrator on chosen infrastructure. This offers control but requires someone capable of installation, security updates, backups, and recovery.

Ask:

- Would your farm use this directly?
- Would a local IT helper, cooperative, or service provider manage it?
- Is this important even if most users choose hosted mode?

### Scenario D: Cooperative/Regional Server

Present:

> A trusted local organization hosts the platform for multiple participating farms. Each farm keeps private operational information, while selected needs or offers can be shared within the network.

Ask:

- Would you participate?
- Who would you trust to operate it?
- What privacy boundaries would be essential?
- Would it be more useful than individual hosted accounts?

## Information-Control Questions

- Which farm records must be exportable?
- Are photos/audio more sensitive than ordinary records?
- Would you want deletion controls for retained captures?
- Would you trust a hosted operator with private records if exports and privacy protections were clear?
- Would you trust a cooperative or local organization differently?
- Would you expect backups to be automated, guided, or handled by a provider?
- How much technical responsibility is acceptable before the tool is no longer worth using?

## Evaluation Dimensions

| Dimension | Questions to answer |
| --- | --- |
| Adoption friction | Which setup mode would farmers actually begin using? |
| Offline need | Is disconnected mobile recording enough, or is local server connectivity valuable? |
| Data-control concern | How important is self-hosting or export? |
| Technical burden | What setup/update/backup tasks are unacceptable? |
| Support model | Who can realistically maintain local or cooperative infrastructure? |
| Recovery expectation | What happens when hardware or service fails? |
| Sensitive content concern | Does audio/photo storage change deployment preference? |
| Shared-network value | Does a cooperative/local hosted context increase utility? |
| Sequencing | Which mode should be implemented first? |

## Expansion and Prioritization Gates

| Proposed deployment investment | Evidence required before prioritizing |
| --- | --- |
| Managed hosted production offering | Farmers value low-friction use and required data-control/export/privacy posture is understood |
| Simplified local-farm server product | Farms show meaningful need for local control or internet-outage local sync, plus feasible support expectations |
| Local-server hardware/appliance packaging | Strong local-mode demand and clear setup/support path |
| Cooperative multi-farm hosting | Real organizations/farms express interest with privacy model accepted |
| Optional hosted backup for local installs | Local users identify backup burden and accept hybrid model |
| Migration among modes | Users demonstrate need to move data between hosted/local/organizational environments |

## Findings Record Template

```markdown
## Deployment and Data-Control Validation Session: <identifier/date>

- Participant role:
- Farm/organization context:
- Connectivity context:
- Deployment scenarios discussed:
- Consent obtained for notes/recording, if applicable:
- Hypothesis tested:

### Current tools and data-storage practices

...

### Offline/connectivity needs

...

### Preferred operating mode and reasons

...

### Acceptable technical responsibility

...

### Backup, restore, and export expectations

...

### Sensitive attachment/audio/photo concerns

...

### Interest in local-network or cooperative hosting

...

### Evidence outcome

- Status: unvalidated | supported by interview evidence | supported by observed workflow | supported by prototype test | rejected | deferred
- Implication for product priority:
- Implication for architecture/ADR/operations work:
```

Do not record actual participant-specific sensitive information unless research has occurred and appropriate consent/data-handling procedures are in place.
