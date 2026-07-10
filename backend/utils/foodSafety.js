const SAFETY_CHECKLIST_KEYS = [
  'properlyStored',
  'withinSafeTemp',
  'labeledCorrectly',
  'noCrossContamination',
];

const CATEGORY_RULES = {
  cooked: { maxAmbientHours: 2, requiresPreparedAt: true, allowedStorage: ['hot', 'ambient'] },
  dairy: { maxAmbientHours: 1, requiresPreparedAt: true, allowedStorage: ['cold', 'frozen'] },
  raw: { maxAmbientHours: 4, requiresPreparedAt: false, allowedStorage: ['cold', 'ambient', 'frozen'] },
  packaged: { maxAmbientHours: 24, requiresPreparedAt: false, allowedStorage: ['ambient', 'cold'] },
  bakery: { maxAmbientHours: 8, requiresPreparedAt: true, allowedStorage: ['ambient', 'hot'] },
};

const CHECKLIST_LABELS = {
  properlyStored: 'Food is properly stored (sealed containers, off floor)',
  withinSafeTemp: 'Food is within safe temperature range',
  labeledCorrectly: 'Allergens and contents are clearly labeled',
  noCrossContamination: 'No cross-contamination risk identified',
};

const normalizeChecklist = (checklist = {}) => {
  const normalized = {};
  for (const key of SAFETY_CHECKLIST_KEYS) {
    normalized[key] = Boolean(checklist[key]);
  }
  return normalized;
};

const isChecklistComplete = (checklist) =>
  SAFETY_CHECKLIST_KEYS.every((key) => Boolean(checklist?.[key]));

const hoursSince = (date) => {
  if (!date) return null;
  const ms = Date.now() - new Date(date).getTime();
  return ms / (1000 * 60 * 60);
};

const evaluateListingSafety = (listing) => {
  const checklist = normalizeChecklist(listing.safetyChecklist);
  const rules = CATEGORY_RULES[listing.category] || CATEGORY_RULES.cooked;
  const warnings = [];
  const errors = [];

  if (!isChecklistComplete(checklist)) {
    errors.push('Complete all food safety checklist items before publishing.');
  }

  if (rules.requiresPreparedAt && !listing.preparedAt) {
    errors.push(`Prepared/cooked time is required for ${listing.category} items.`);
  }

  if (listing.preparedAt) {
    const ageHours = hoursSince(listing.preparedAt);
    if (ageHours != null && ageHours > rules.maxAmbientHours) {
      errors.push(
        `${listing.category} food exceeds safe ambient window (${rules.maxAmbientHours}h). Cannot publish.`
      );
    } else if (ageHours != null && ageHours > rules.maxAmbientHours * 0.75) {
      warnings.push(`Food is approaching the safe time limit (${Math.round(ageHours * 10) / 10}h old).`);
    }
  }

  if (listing.expiresAt) {
    const expiresTime = new Date(listing.expiresAt).getTime();
    if (expiresTime < Date.now()) {
      errors.push('Pickup deadline must be in the future.');
    }
  }

  if (listing.preparedAt && listing.expiresAt) {
    const prepTime = new Date(listing.preparedAt).getTime();
    const expiresTime = new Date(listing.expiresAt).getTime();
    if (prepTime > expiresTime) {
      errors.push('Prepared/cooked time cannot be after the pickup deadline.');
    } else {
      const windowHours = (expiresTime - prepTime) / (1000 * 60 * 60);
      if (windowHours > rules.maxAmbientHours) {
        errors.push(
          `Pickup window duration (${Math.round(windowHours * 10) / 10}h) exceeds the safe ambient window (${rules.maxAmbientHours}h) for ${listing.category} items.`
        );
      }
    }
  }

  if (listing.storageTemp && rules.allowedStorage && !rules.allowedStorage.includes(listing.storageTemp)) {
    warnings.push(
      `${listing.category} items are typically stored ${rules.allowedStorage.join(' or ')}; current: ${listing.storageTemp}.`
    );
  }

  if (listing.category === 'dairy' && listing.storageTemp !== 'cold' && listing.storageTemp !== 'frozen') {
    errors.push('Dairy items must be stored cold or frozen.');
  }

  const expiresInHours = listing.expiresAt
    ? (new Date(listing.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
    : null;
  if (expiresInHours != null && expiresInHours < 1 && expiresInHours >= 0) {
    warnings.push('Listing expires in less than 1 hour — urgent pickup required.');
  }

  const safetyStatus = errors.length ? 'pending' : 'verified';

  return {
    checklist,
    warnings,
    errors,
    safetyStatus,
    canPublish: errors.length === 0 && isChecklistComplete(checklist),
    rules,
  };
};

const appendAuditEntry = (listing, action, userId, note = '') => {
  if (!listing.safetyAuditLog) listing.safetyAuditLog = [];
  listing.safetyAuditLog.push({
    action,
    by: userId,
    at: new Date(),
    note,
  });
};

const validatePickupConfirmation = (confirmation) => {
  const required = ['receivedInSafeCondition', 'tempVerified', 'packagingIntact', 'withinTimeLimit'];
  const missing = required.filter((key) => !confirmation?.[key]);
  if (missing.length) {
    return { valid: false, message: 'Complete all pickup safety confirmations before marking picked up.' };
  }
  return { valid: true };
};

const validateDeliveryConfirmation = (confirmation) => {
  const required = ['distributedSafely', 'recipientsInformed'];
  const missing = required.filter((key) => !confirmation?.[key]);
  if (missing.length) {
    return { valid: false, message: 'Complete all delivery safety confirmations before completing.' };
  }
  return { valid: true };
};

module.exports = {
  SAFETY_CHECKLIST_KEYS,
  CATEGORY_RULES,
  CHECKLIST_LABELS,
  normalizeChecklist,
  isChecklistComplete,
  evaluateListingSafety,
  appendAuditEntry,
  validatePickupConfirmation,
  validateDeliveryConfirmation,
};
