# ADR-0008: Mobile Pilot 1 Application Stack

- Status: accepted
- Date: 2026-05-28
- Last reviewed: 2026-05-28
- Deciders: project owner and contributors
- Canonical for: Mobile Pilot 1 mobile application framework, language, and pilot distribution posture
- Related docs: [Mobile Pilot 1 Implementation Scope](../product/mobile-pilot-1-implementation-scope.md), [Offline-First Mobile Architecture](../architecture/offline-first-mobile-architecture.md), [Mobile Pilot Data-Safety Requirements](../operations/mobile-pilot-data-safety-requirements.md), [Decision Readiness Register](decision-readiness-register.md)
- Supersedes: none
- Superseded by: none

## Context

Mobile Pilot 1 is the first buildable farmer-testing increment. It needs an installed mobile app that can support device-local offline recording, local history, and export/recovery-copy work without waiting for server infrastructure.

The stack decision should serve the narrow pilot and avoid choosing future server, synchronization, AI, authentication, or deployment technology.

## Decision

Use Expo, React Native, and TypeScript for the standalone Mobile Pilot 1 application.

Use Expo development builds and EAS/internal distribution for farmer testing. Preserve iOS and Android compatibility while allowing Android-first practical testing if pilot distribution requires it.

Do not assume Expo Go as the farmer-testing environment.

This ADR does not select server language, server framework, server database, synchronization technology, AI model/runtime, authentication technology, cloud provider, or deployment technology.

## Rationale

Expo and React Native provide a fast path to an installed mobile app while preserving a cross-platform path for farmer discovery.

TypeScript improves maintainability, code navigation, and boundary clarity for domain, application, infrastructure, and UI modules.

Expo development builds give practical native-module access for current local storage/export needs and future camera/audio experiments without implementing AI capture in Mobile Pilot 1.

The decision supports Mobile Pilot 1 without prematurely building server infrastructure.

## Alternatives Considered

### Alternative: Native Android or iOS First

- Benefits: direct platform integration and potentially smaller runtime surface.
- Drawbacks: narrows early cross-platform learning or requires duplicate implementation effort.
- Reason not selected: Mobile Pilot 1 benefits from a shared implementation path while farmer distribution details remain under discovery.

### Alternative: Web or Progressive Web App First

- Benefits: low installation friction and simpler distribution.
- Drawbacks: weaker fit for installed field use, offline local persistence, future native camera/audio experiments, and farmer device expectations.
- Reason not selected: the accepted pilot target is a mobile application installed and used directly during field work.

### Alternative: Defer Framework Choice Longer

- Benefits: preserves optionality.
- Drawbacks: blocks concrete project structure and implementation planning.
- Reason not selected: Mobile Pilot 1 is ready for stack-specific scaffolding.

## Consequences

### Positive

- Mobile Pilot 1 can use a practical Expo/React Native project structure.
- TypeScript boundaries can reflect canonical domain and application concepts.
- Future native-module work remains possible without changing the pilot stack.

### Negative / Tradeoffs

- The project accepts React Native and Expo ecosystem constraints for Mobile Pilot 1.
- Native build/distribution setup must be handled before farmer testing; Expo Go is not enough for the assumed pilot environment.

### Risks and Mitigations

- Risk: contributors may treat this as a full-stack architecture choice.
- Mitigation: the decision scope is explicitly limited to Mobile Pilot 1 and leaves server, sync, AI, authentication, and deployment technology deferred.
- Risk: Expo package versions may need alignment with a current SDK.
- Mitigation: dependency installation should use Expo-compatible package resolution and commit a lockfile in a later implementation-preparation step.

## Validation and Revisit Conditions

Revisit this ADR if farmer testing requires platform capabilities that Expo development builds cannot support, if distribution constraints block pilot participation, or if maintaining cross-platform compatibility becomes disproportionate to validated pilot needs.

## Documentation and Test Impact

Documentation and context routing must identify Expo, React Native, TypeScript, development builds, and EAS/internal distribution as accepted for Mobile Pilot 1 only.

Future implementation should add type-checking and mobile workflow verification after dependencies are installed and behavior exists.
