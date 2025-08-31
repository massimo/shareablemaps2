import { z } from 'zod';

// Map Validation Schemas
export const createMapSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tags: z.string().optional().transform((val) => 
    val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []
  ),
});

export const updateMapSchema = createMapSchema.partial();

// Marker Validation Schemas
export const markerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  categoryId: z.string().optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  tips: z.string().transform((val) => 
    val ? val.split('\n').map(tip => tip.trim()).filter(Boolean) : []
  ),
  icon: z.object({
    library: z.enum(['default', 'heroicons']),
    name: z.string(),
    color: z.string().optional(),
  }).optional(),
});

// Category Validation Schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().optional(),
});

// Share Validation Schemas
export const shareSchema = z.object({
  mapId: z.string().min(1, 'Map ID is required'),
  mode: z.enum(['link', 'link+password']),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  notifyTargets: z.array(z.string().email()).optional(),
}).refine((data) => {
  if (data.mode === 'link+password') {
    return data.password && data.password.length >= 6;
  }
  return true;
}, {
  message: 'Password is required for password-protected shares',
  path: ['password'],
});

// Verification Validation Schemas
export const verifySchema = z.object({
  publicId: z.string().min(1, 'Public ID is required'),
  password: z.string().min(1, 'Password is required'),
});

// Comment Validation Schemas
export const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment must be less than 500 characters'),
});

// Search Validation Schemas
export const searchSchema = z.object({
  q: z.string().min(1, 'Query is required').max(100, 'Query must be less than 100 characters'),
  limit: z.number().min(1).max(20).optional().default(10),
});

// Location coordinate validation
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Export types for use in components
export type CreateMapForm = z.infer<typeof createMapSchema>;
export type UpdateMapForm = z.infer<typeof updateMapSchema>;
export type MarkerForm = z.infer<typeof markerSchema>;
export type CategoryForm = z.infer<typeof categorySchema>;
export type ShareForm = z.infer<typeof shareSchema>;
export type VerifyForm = z.infer<typeof verifySchema>;
export type CommentForm = z.infer<typeof commentSchema>;
export type SearchForm = z.infer<typeof searchSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
