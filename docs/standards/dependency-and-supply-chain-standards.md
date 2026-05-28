# Dependency and Supply Chain Standards

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: future dependency, external-service, license, privacy, and operational-burden review
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0005](../adr/ADR-0005-data-portability-and-recoverability.md), [ADR-0006](../adr/ADR-0006-deployment-mode-compatibility.md)
- Related docs: [Decision Readiness Register](../adr/decision-readiness-register.md), [Server and Deployment Operating Model](../architecture/server-and-deployment-operating-model.md), [Security and Privacy Engineering Standards](security-and-privacy-engineering-standards.md), [Change Impact Matrix](change-impact-matrix.md)
- Related tests: not yet implemented
- Supersedes: none

## Dependency Restraint Principle

Add dependencies only when they solve a concrete approved need, fit the accepted product-technical constraints, and do not introduce unnecessary operational, licensing, privacy, security, or deployment burden.

## Dependency Review Factors

| Factor | Questions |
| --- | --- |
| Concrete need | What approved capability requires this dependency now? |
| Maintenance maturity | Is it actively maintained and appropriate for production use? |
| License compatibility | Is its license compatible with the project's open-source direction and intended distribution? |
| Security posture | Are known vulnerabilities or risky transitive dependencies understood? |
| Offline impact | Does it compromise offline operation or require unavailable external service access? |
| Privacy impact | Does it send farm data/captures externally or widen access? |
| Deployment impact | Does it make local/self-hosted operation materially more difficult? |
| Portability impact | Does it lock core data or workflows into a proprietary provider? |
| Resource impact | Is it appropriate for modest mobile/local-server environments where relevant? |
| Replaceability | Is it isolated behind an appropriate boundary if it represents external infrastructure/provider behavior? |

## Special Scrutiny Categories

Heightened review is required for future dependencies involving synchronization engines, databases/storage systems, authentication/identity providers, cloud services, AI/model APIs, speech transcription, computer vision, maps/geolocation, analytics/telemetry, notification services, backup/storage providers, encryption/security libraries, mobile native permissions, and container/infrastructure dependencies.

## Open-Source and Licensing Posture

- Core functionality intended as part of the open-source platform must not be casually made dependent on a proprietary or source-restricted service without explicit architectural/business decision and documented alternatives/tradeoffs.
- License compatibility must be evaluated before adopting dependencies that affect redistribution, self-hosting, or hosted operation.
- Exact project license decisions remain outside this standard unless already accepted canonically.

## Vulnerability and Update Posture

Once dependencies exist, future implementation work must establish:

- Dependency version control/pinning strategy appropriate to the selected ecosystem.
- Vulnerability review/scanning in development and CI where feasible.
- Update procedures that consider breaking changes and operational record safety.
- Documentation for dependencies that become operational prerequisites.

This standard does not choose tooling.

## External-Service Data Transmission Rule

Any dependency or service that transmits source photos, audio, operational records, listing content, personal information, or other sensitive farm data outside the user-controlled deployment boundary requires explicit privacy/architecture review and likely ADR/update work before adoption.

## Avoid Developer Convenience Imposing Farmer Burden

Dependencies selected for developer convenience must not unnecessarily force ordinary farmers to install or administer infrastructure, accept cloud lock-in, lose offline capability, or accept unclear data transmission.
