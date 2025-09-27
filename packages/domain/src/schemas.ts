import Ajv, { JSONSchemaType } from 'ajv';

const ajv = new Ajv({ allErrors: true });

// Base event schema
const baseEventSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    user_id: { type: 'string', nullable: true },
    date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    created_at: { type: 'string', nullable: true },
    updated_at: { type: 'string', nullable: true },
  },
  required: ['id', 'date'],
  additionalProperties: false,
} as const;

// Feed schema
export const feedSchema: JSONSchemaType<Feed> = {
  ...baseEventSchema,
  properties: {
    ...baseEventSchema.properties,
    time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    amount: { type: 'integer', minimum: 1, maximum: 1000, nullable: true },
    unit: { type: 'string', enum: ['ml', 'oz'], nullable: true },
    method: { type: 'string', enum: ['breast', 'bottle'] },
    side: { type: 'string', enum: ['left', 'right'], nullable: true },
    duration_sec: { type: 'integer', minimum: 1, maximum: 7200, nullable: true },
    milk_type: { type: 'string', nullable: true },
    note: { type: 'string', nullable: true },
  },
  required: [...baseEventSchema.required, 'time', 'method'],
};

// Diaper schema
export const diaperSchema: JSONSchemaType<Diaper> = {
  ...baseEventSchema,
  properties: {
    ...baseEventSchema.properties,
    time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    pee: { type: 'boolean' },
    poop: { type: 'boolean' },
    note: { type: 'string', nullable: true },
  },
  required: [...baseEventSchema.required, 'time', 'pee', 'poop'],
};

// Sleep schema
export const sleepSchema: JSONSchemaType<Sleep> = {
  ...baseEventSchema,
  properties: {
    ...baseEventSchema.properties,
    start: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    end: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    note: { type: 'string', nullable: true },
  },
  required: [...baseEventSchema.required, 'start', 'end'],
};

// Vitamin schema
export const vitaminSchema: JSONSchemaType<Vitamin> = {
  ...baseEventSchema,
  properties: {
    ...baseEventSchema.properties,
    time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    dose: { type: 'string', nullable: true },
    note: { type: 'string', nullable: true },
  },
  required: [...baseEventSchema.required, 'time', 'name'],
};

// Weight schema
export const weightSchema: JSONSchemaType<Weight> = {
  ...baseEventSchema,
  properties: {
    ...baseEventSchema.properties,
    time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    kg: { type: 'number', minimum: 0.5, maximum: 50 },
    note: { type: 'string', nullable: true },
  },
  required: [...baseEventSchema.required, 'time', 'kg'],
};

// Height schema
export const heightSchema: JSONSchemaType<Height> = {
  ...baseEventSchema,
  properties: {
    ...baseEventSchema.properties,
    time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    cm: { type: 'number', minimum: 30, maximum: 150 },
    note: { type: 'string', nullable: true },
  },
  required: [...baseEventSchema.required, 'time', 'cm'],
};

// Other schema
export const otherSchema: JSONSchemaType<Other> = {
  ...baseEventSchema,
  properties: {
    ...baseEventSchema.properties,
    time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
    note: { type: 'string', minLength: 1 },
  },
  required: [...baseEventSchema.required, 'time', 'note'],
};

// Baby profile schema
export const babyProfileSchema: JSONSchemaType<BabyProfile> = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    sex: { type: 'string', enum: ['Female', 'Male'] },
    date_of_birth: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
    created_at: { type: 'string', nullable: true },
    updated_at: { type: 'string', nullable: true },
  },
  required: ['name', 'sex', 'date_of_birth'],
  additionalProperties: false,
};

// Export bundle schema
export const exportBundleSchema: JSONSchemaType<ExportBundle> = {
  type: 'object',
  properties: {
    version: { type: 'string', const: '1.0.0' },
    exported_at: { type: 'string' },
    profile: babyProfileSchema,
    store: {
      type: 'object',
      patternProperties: {
        '^\\d{4}-\\d{2}-\\d{2}$': {
          type: 'object',
          properties: {
            feeds: { type: 'array', items: feedSchema },
            diapers: { type: 'array', items: diaperSchema },
            sleeps: { type: 'array', items: sleepSchema },
            vitamins: { type: 'array', items: vitaminSchema },
            weights: { type: 'array', items: weightSchema },
            heights: { type: 'array', items: heightSchema },
            others: { type: 'array', items: otherSchema },
          },
          required: ['feeds', 'diapers', 'sleeps', 'vitamins', 'weights', 'heights', 'others'],
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
  required: ['version', 'exported_at', 'profile', 'store'],
  additionalProperties: false,
};

// Compiled validators
export const validateFeed = ajv.compile(feedSchema);
export const validateDiaper = ajv.compile(diaperSchema);
export const validateSleep = ajv.compile(sleepSchema);
export const validateVitamin = ajv.compile(vitaminSchema);
export const validateWeight = ajv.compile(weightSchema);
export const validateHeight = ajv.compile(heightSchema);
export const validateOther = ajv.compile(otherSchema);
export const validateBabyProfile = ajv.compile(babyProfileSchema);
export const validateExportBundle = ajv.compile(exportBundleSchema);

// Event validator function
export function validateEvent(type: EventType, data: any): boolean {
  switch (type) {
    case 'feed':
      return validateFeed(data);
    case 'diaper':
      return validateDiaper(data);
    case 'sleep':
      return validateSleep(data);
    case 'vitamin':
      return validateVitamin(data);
    case 'weight':
      return validateWeight(data);
    case 'height':
      return validateHeight(data);
    case 'other':
      return validateOther(data);
    default:
      return false;
  }
}

// Get validation errors
export function getValidationErrors(validator: any): string[] {
  if (!validator.errors) return [];
  return validator.errors.map((error: any) => 
    `${error.instancePath || 'root'}: ${error.message}`
  );
}
