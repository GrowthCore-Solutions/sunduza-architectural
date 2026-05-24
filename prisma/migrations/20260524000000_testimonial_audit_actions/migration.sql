-- Add testimonial-specific audit actions to the AuditAction enum.
-- Previously testimonial writes were logged under PROJECT_* values, which
-- made audit queries for testimonial activity return false positives when
-- filtering on project events. These three values give the audit log a
-- clean separation between the two entity types.

ALTER TYPE "AuditAction" ADD VALUE 'TESTIMONIAL_CREATE';
ALTER TYPE "AuditAction" ADD VALUE 'TESTIMONIAL_UPDATE';
ALTER TYPE "AuditAction" ADD VALUE 'TESTIMONIAL_DELETE';
