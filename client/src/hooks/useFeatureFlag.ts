import React from 'react';
import { featureFlags, isFeatureEnabled, anyFeatureEnabled, allFeaturesEnabled, type FeatureFlags } from '@shared/feature-flags';

/**
 * React hook to check if a feature is enabled
 * Usage: const isEnabled = useFeatureFlag('quotes_module');
 */
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return isFeatureEnabled(feature);
}

/**
 * React hook to get all feature flags
 */
export function useFeatureFlags(): FeatureFlags {
  return featureFlags;
}

/**
 * React hook to check if any feature is enabled
 */
export function useAnyFeature(...features: (keyof FeatureFlags)[]): boolean {
  return anyFeatureEnabled(...features);
}

/**
 * React hook to check if all features are enabled
 */
export function useAllFeatures(...features: (keyof FeatureFlags)[]): boolean {
  return allFeaturesEnabled(...features);
}

/**
 * HOC to conditionally render component based on feature flag
 */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  feature: keyof FeatureFlags,
  FallbackComponent?: React.ComponentType<P>
): React.FC<P> {
  return function FeatureFlaggedComponent(props: P) {
    if (isFeatureEnabled(feature)) {
      return React.createElement(Component, props);
    }

    if (FallbackComponent) {
      return React.createElement(FallbackComponent, props);
    }

    return null;
  };
}

