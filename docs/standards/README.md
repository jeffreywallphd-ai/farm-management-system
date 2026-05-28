# Standards Documentation

`docs/standards/` is canonical for repository-wide implementation and review requirements.

Standards operationalize accepted ADRs and canonical product, domain, architecture, and operations guidance. They do not replace those sources, and they must not silently decide technologies or feature priorities that the [Decision Readiness Register](../adr/decision-readiness-register.md) keeps deferred.

Later language/framework-specific standards may be added only after accepted technology decisions. Contributors and automated agents must use the [Change Impact Matrix](change-impact-matrix.md) when planning and reviewing meaningful behavior changes.

Task-specific context packs in [Context Documentation](../context/README.md) help assemble minimum-sufficient prompt context. Standards remain canonical for implementation/review obligations; packs only route and summarize.

## Current Standards Documents

| Standards document | Canonical purpose |
| --- | --- |
| [Documentation Standards](documentation-standards.md) | Authority, metadata, change completeness, canonical-doc maintenance |
| [Coding Standards](coding-standards.md) | Implementation discipline and boundary-safe coding expectations |
| [Naming and Domain Language Standards](naming-and-domain-language-standards.md) | Farmer-centered terminology and boundary-revealing names |
| [Testing and Verification Standards](testing-and-verification-standards.md) | Required behavioral/invariant verification strategy |
| [Logging and Diagnostics Standards](logging-and-diagnostics-standards.md) | Privacy-safe diagnosability and failure visibility |
| [Security and Privacy Engineering Standards](security-and-privacy-engineering-standards.md) | Private-by-default engineering obligations |
| [Accessibility and Field Usability Standards](accessibility-and-field-usability-standards.md) | Real farm-use and accessibility quality requirements |
| [Dependency and Supply Chain Standards](dependency-and-supply-chain-standards.md) | Dependency, external-service, license, and operational-burden review |
| [AI-Agent Development Standards](ai-agent-development-standards.md) | Safe automated development behavior |
| [Change Impact Matrix](change-impact-matrix.md) | Cross-document/test/ADR impact routing for future changes |

## Standards Rules

- Standards must be actionable enough to support review, tests, future tooling, or explicit acceptance criteria.
- Standards must preserve accepted ADR constraints for offline operation, record integrity, AI confirmation, intentional sharing, and recoverability.
- Standards must stay technology-neutral until later ADRs select a stack or tool.
- Standards must remain proportional to the first vertical slice and avoid process that serves only deferred product areas.
- When implementation practices change, update the applicable standards documentation in the same change.
