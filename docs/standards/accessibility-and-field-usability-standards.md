# Accessibility and Field Usability Standards

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: practical farm-field usability, accessibility posture, offline status clarity, and manual alternatives
- Related ADRs: [ADR-0001](../adr/ADR-0001-offline-first-field-operation.md), [ADR-0003](../adr/ADR-0003-ai-interpretations-require-confirmation.md), [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md)
- Related docs: [Product Vision and Scope](../product/product-vision-and-scope.md), [Field Workflows](../product/field-workflows.md), [AI-Assisted Capture Validation Plan](../product/ai-assisted-capture-validation-plan.md), [Deployment and Data-Control Validation Plan](../product/deployment-and-data-control-validation-plan.md), [Naming and Domain Language Standards](naming-and-domain-language-standards.md)
- Related tests: not yet implemented
- Supersedes: none

## Field Usability Is a Product-Quality Requirement

The platform is intended for conditions that may include bright sunlight, gloves or dirty/wet hands, standing or moving users, barns, tunnels, fields, greenhouses, storage sheds, wash/pack areas, limited attention/time, poor or unavailable connectivity, and mobile devices used briefly during physical work.

A technically correct interface that is too burdensome to use during farm work fails the product purpose.

## Core Field-Usability Standards

Future user-facing implementation must prioritize:

- Short, direct workflows for frequent activity recording.
- Large and clear primary actions appropriate for mobile use.
- Visible offline, synchronization, and publication state.
- Minimal forced typing where practical.
- Clear confirmation before AI-assisted records become facts.
- Clear distinction between private internal records and externally shared information.
- Safe recovery from interruption or failed connectivity.
- Plain farmer-facing language consistent with the glossary.
- Avoidance of technical infrastructure or sync jargon in ordinary field workflows.

## Accessibility Baseline

Future implementation must account for:

- Readable text and contrast.
- Touch-target usability.
- Screen-reader and semantic labeling where interfaces are implemented.
- Keyboard/accessibility support where web or desktop administration exists.
- Error messages that identify corrective action.
- Avoiding reliance on color alone for pending, synchronized, failed, or shared states.
- Support for users who prefer non-voice workflows.
- Equivalent manual pathways for AI-assisted features.

## Voice and Camera Usability Requirements

- Voice features must not be the only way to record a supported activity.
- Camera-count features must not be the only way to record an inventory observation.
- Users must be able to review and correct assisted results.
- Noise, poor lighting, clutter, occlusion, and connectivity limitations must be included in later validation.
- Repeated AI correction burden is a usability failure even if inference is technically operational.

## Offline-State Usability Requirements

Future interfaces must make clear:

- Work has been saved locally.
- Work awaits synchronization.
- Synchronization has succeeded.
- Publication is pending versus visible.
- Something requires attention.
- Network-dependent content may not be current while offline.

## Usability Validation Posture

Later workflow evaluation with actual or representative farm users is required before broadening:

- Voice-assisted activity capture.
- Photo counting categories.
- Local server setup.
- Local-network sharing.
- Complex inventory/reconciliation.
- Administrative/export/recovery workflows.

## Deferred Details

This standard does not define visual design system, component library, platform accessibility implementation, exact screen flows, exact button size/contrast specification, or usability-testing tooling.
