# Product Documentation

`docs/product/` is canonical for product vision, target users and validated user needs, field workflow descriptions, initial release scope, explicit non-goals, roadmap sequencing, and research findings or product assumptions.

## Current Product Documents

- [Product Vision and Scope](product-vision-and-scope.md): central product statement, problem framing, intended users, product principles, initial product areas, and open questions.
- [Initial Vertical Slice](initial-vertical-slice.md): first implementation target, included capabilities, explicit non-goals, success criteria, and deferred decisions.
- [Field Workflows](field-workflows.md): representative farmer-facing workflows that should guide later domain modeling, UX, offline behavior, and acceptance testing.
- [User Research and Validation](user-research-and-validation.md): current evidence level, hypotheses, interview guide, observation targets, and assumption status mechanism.
- [AI-Assisted Capture Validation Plan](ai-assisted-capture-validation-plan.md): product hypotheses, field-testing expectations, and gates for expanding assisted-capture scope.
- [Local Coordination and Sharing Validation Plan](local-coordination-and-sharing-validation-plan.md): product hypotheses and validation gates for local sourcing, controlled sharing, listing audiences, and privacy expectations.
- [Deployment and Data-Control Validation Plan](deployment-and-data-control-validation-plan.md): product hypotheses and validation gates for hosted use, local operation, technical self-hosting, cooperative hosting, export, backup, and data-control preferences.
- [Roadmap](roadmap.md): product sequencing and conditional future opportunities.

## Product Documentation Rules

Product documents must clearly distinguish:

- Observed farmer needs.
- Assumptions requiring validation.
- Accepted release scope.
- Deferred ideas.

Technical architecture must not be justified solely by speculative product features. If a feature is not validated or accepted into scope, architecture documents and ADRs may reference it only as a possible future consideration, not as a binding requirement.

Future product documents should continue to separate product scope, user evidence, deferred opportunities, and implementation-independent product requirements.

Implementation work that affects product behavior must also consult [Documentation Standards](../standards/documentation-standards.md) and the [Change Impact Matrix](../standards/change-impact-matrix.md). Standards do not expand product scope; they route future changes back to product validation and canonical scope documents.
