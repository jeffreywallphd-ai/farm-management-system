# Sourcing and Local Network Model

- Status: proposed
- Last reviewed: 2026-05-28
- Canonical for: private supply needs, future intentionally shared listings, local farm network concepts, and standalone-pilot sourcing boundaries
- Related ADRs: [ADR-0004](../adr/ADR-0004-private-by-default-intentional-sharing.md), [ADR-0007](../adr/ADR-0007-standalone-mobile-pilot-before-server-connected-features.md)
- Related docs: [Glossary](glossary.md), [Operational Event Catalog](operational-event-catalog.md), [Inventory and Reconciliation Rules](inventory-and-reconciliation-rules.md), [Privacy, Visibility, and Sharing Rules](privacy-visibility-and-sharing-rules.md), [Identity, Privacy, and Sharing Architecture](../architecture/identity-privacy-and-sharing.md), [Local Coordination and Sharing Validation Plan](../product/local-coordination-and-sharing-validation-plan.md), [Product Vision and Scope](../product/product-vision-and-scope.md), [Initial Vertical Slice](../product/initial-vertical-slice.md), [Field Workflows](../product/field-workflows.md)
- Related tests: not yet implemented
- Supersedes: none

## Purpose

This document defines the minimum product-domain language for the original motivating problem: sourcing needed materials and coordinating selectively with nearby farms.

It establishes intentional sharing without designing a social network, marketplace, ordering system, payment system, or implementation-level privacy architecture.

## Domain Purpose

The platform may later help farms express selected needs or availability to trusted local contacts, particularly where sourcing materials informally is difficult or inefficient.

The standalone mobile pilot is limited to private device-local supply-need capture if useful for discovery. Converting a farm-recognized material need into an intentionally shared need listing is deferred server-connected functionality.

## Internal Supply Need Versus Shared Need Listing

A **supply need** is a private farm recognition that a material or resource is needed.

A **need listing** is a future intentionally shared representation of selected information about that need.

Key invariant:

> A supply need does not become visible outside the farm in the standalone mobile pilot. Later publication requires an explicit server-connected sharing workflow and product/ADR authorization.

## Need Listing

Minimum future conceptual content:

- Description of what is needed.
- Requested quantity/unit if the farm chooses to provide it.
- Desired timing.
- Optional pickup, delivery, or geographic note later.
- Intended audience/visibility, governed by [Privacy, Visibility, and Sharing Rules](privacy-visibility-and-sharing-rules.md).
- A basic path for another farm to respond, if later product scope includes it.

A future listing must not automatically expose:

- Underlying inventory count.
- Full material-use history.
- Supplier relationships.
- Production records.
- Financial information.
- Unrelated farm activities.
- Source captures, AI drafts, private attachments, or provenance/correction details unless a later explicit sharing feature and consent policy permits it.

## Availability Listing

Availability listings are a closely related later function:

- A farm may intentionally offer a selected item, quantity, service, equipment access, or capacity.
- An offered quantity is not a full disclosure of internal inventory.
- The farm controls the amount offered; the listing is not a view into total holdings or private inventory history.
- Whether availability listings are included in a release must follow canonical product scope.

Canonical product scope no longer includes need listings in the standalone mobile pilot. Need listings, availability listings, and responses are deferred unless product scope and ADRs are intentionally revised.

## Local Farm Network

A local farm network is a group or audience with which a farm may intentionally share listings.

It is likely to include trusted nearby farms or related agricultural participants.

Exact invitation, membership, visibility, location, public/private, and access-control behavior is defined only at a conceptual level in the privacy and architecture documents. Do not assume a public marketplace.

Membership in a local farm network does not grant access to private farm operations, inventory records, AI drafts, source captures, or attachments. It only defines a possible audience for intentionally published shared representations.

## Publication and Synchronization Boundary

Listing publication, withdrawal, response, and fulfillment behavior are future server-connected concerns and must follow privacy/visibility and synchronization rules if implemented later.

- A listing may be drafted or a publication request may be created while offline only if later product scope supports it.
- A pending offline publication request is not externally visible until synchronized and accepted by the appropriate server boundary.
- Withdrawing or closing a listing must distinguish local intent from synchronized shared state.
- A shared listing contains only intentionally selected shareable fields, not the internal records that motivated it.
- Source captures, AI drafts, and private attachments are not listing content by default.
- The standalone pilot sourcing scope is private need recognition only if scoped, not a marketplace, order system, payment system, publication workflow, response workflow, or general social network.

## Response and Resolution

A **response** is a communication or indication that another permitted participant may be able to help with a listing.

A **resolution** means a listing is fulfilled, withdrawn, expired, cancelled, or otherwise no longer active.

This document does not define ordering, contracting, payment, shipping, logistics, or dispute-resolution systems.

## First-Slice Boundary

| Capability | Standalone mobile pilot status |
| --- | --- |
| Recognize a private material/supply need | Optional private discovery workflow |
| Convert selected need information into a shared listing | Deferred server-connected functionality |
| Prevent automatic disclosure of private operational data | Required |
| Allow minimal response/contact pathway | Deferred |
| Publish offers/availability | Deferred unless product scope is intentionally revised |
| Shared ordering or bulk purchasing | Deferred |
| Payments | Excluded |
| General social feed or public marketplace | Excluded |
| Server federation between independent networks | Excluded |

## Questions Requiring Farmer Validation

- What types of materials or resources would farmers request locally?
- Would they share requests with selected contacts, a regional group, or the public?
- Would they offer extra materials, equipment access, labor, transportation, or produce?
- What details would they refuse to share?
- Is messaging necessary, or would sharing contact information initially be enough?
- Would group purchasing be more valuable than one-off needs listings?
