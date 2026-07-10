import React from 'react';
import styles from './FoodSafetyChecklist.module.css';

export const SAFETY_ITEMS = [
  { key: 'properlyStored', label: 'Food is properly stored (sealed containers, off floor)' },
  { key: 'withinSafeTemp', label: 'Food is within safe temperature range' },
  { key: 'labeledCorrectly', label: 'Allergens and contents are clearly labeled' },
  { key: 'noCrossContamination', label: 'No cross-contamination risk identified' },
];

export const CATEGORIES = [
  { value: 'cooked', label: 'Cooked / prepared' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'packaged', label: 'Packaged' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'raw', label: 'Raw ingredients' },
];

export const STORAGE_TEMPS = [
  { value: 'hot', label: 'Hot (>60°C)' },
  { value: 'cold', label: 'Cold (0–4°C)' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'ambient', label: 'Ambient / room temp' },
];

function FoodSafetyChecklist({
  category,
  storageTemp,
  preparedAt,
  safety,
  onCategoryChange,
  onStorageTempChange,
  onPreparedAtChange,
  onSafetyChange,
  showMeta = true,
}) {
  const needsPreparedAt = category === 'cooked' || category === 'dairy' || category === 'bakery';

  return (
    <div className={styles.wrapper}>
      {showMeta && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="category">Food category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="storageTemp">Storage temperature</label>
            <select
              id="storageTemp"
              value={storageTemp}
              onChange={(e) => onStorageTempChange(e.target.value)}
              required
            >
              {STORAGE_TEMPS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {needsPreparedAt && (
            <div className={styles.formGroup}>
              <label htmlFor="preparedAt">Prepared / cooked at</label>
              <input
                id="preparedAt"
                type="datetime-local"
                value={preparedAt}
                onChange={(e) => onPreparedAtChange(e.target.value)}
                required
              />
              <p className={styles.hint}>
                Required for safety compliance ({category === 'cooked' ? 'cooked' : category === 'dairy' ? 'dairy' : 'bakery'} food safe window: {category === 'dairy' ? '1 hour' : category === 'bakery' ? '8 hours' : '2 hours'}).
              </p>
            </div>
          )}
        </>
      )}

      <fieldset className={styles.checklist}>
        <legend>Food safety checklist (all required)</legend>
        {SAFETY_ITEMS.map(({ key, label }) => (
          <label key={key} className={styles.checkItem}>
            <input
              type="checkbox"
              checked={Boolean(safety[key])}
              onChange={(e) => onSafetyChange({ ...safety, [key]: e.target.checked })}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

export default FoodSafetyChecklist;
