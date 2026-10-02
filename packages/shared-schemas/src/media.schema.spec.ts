import {
  mediaCategorySchema,
  uploadMediaOptionsSchema,
  deleteMediaParamsSchema,
} from './media.schema';

describe('Media Schemas', () => {
  describe('mediaCategorySchema', () => {
    it('accepts valid media categories', () => {
      expect(() => mediaCategorySchema.parse('STUDENT_AVATAR')).not.toThrow();
      expect(() => mediaCategorySchema.parse('DAILY_REPORT')).not.toThrow();
      expect(() => mediaCategorySchema.parse('GENERAL')).not.toThrow();
    });

    it('rejects invalid category', () => {
      expect(() => mediaCategorySchema.parse('UNKNOWN_CATEGORY')).toThrow();
    });
  });

  describe('uploadMediaOptionsSchema', () => {
    it('accepts empty or valid category option', () => {
      expect(() => uploadMediaOptionsSchema.parse({})).not.toThrow();
      expect(() => uploadMediaOptionsSchema.parse({ category: 'PORTFOLIO' })).not.toThrow();
    });
  });

  describe('deleteMediaParamsSchema', () => {
    it('accepts non-empty id', () => {
      expect(() => deleteMediaParamsSchema.parse({ id: 'med-123' })).not.toThrow();
    });

    it('rejects empty id', () => {
      expect(() => deleteMediaParamsSchema.parse({ id: '' })).toThrow();
    });
  });
});
