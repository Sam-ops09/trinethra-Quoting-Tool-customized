import type { Request, Response, NextFunction } from 'express';
import { featureFlags, isFeatureEnabled, type FeatureFlags } from '../shared/feature-flags';

/**
 * Middleware to check if a feature is enabled
 * Returns 404 if feature is disabled
 * Permissions are still enforced - this adds an additional layer
 */
export function requireFeature(feature: keyof FeatureFlags) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isFeatureEnabled(feature)) {
      return res.status(404).json({
        error: 'Feature not available',
        message: `The ${feature} feature is currently disabled`,
      });
    }
    next();
  };
}

/**
 * Middleware to add feature flags to response locals
 */
export function addFeatureFlagsToResponse(req: Request, res: Response, next: NextFunction) {
  res.locals.featureFlags = featureFlags;
  next();
}

/**
 * API endpoint to get feature flags (for debugging/client sync)
 */
export function getFeatureFlagsEndpoint(req: Request, res: Response) {
  res.json(featureFlags);
}

