import type { LegalWebViewParams } from '@/navigation/types';

/** Parent stacks that register `LegalWebView` satisfy this shape. */
export type LegalNavigationMinimal = {
  navigate(name: 'LegalWebView', params: LegalWebViewParams): void;
};

export function asLegalNavigation(nav: unknown): LegalNavigationMinimal {
  return nav as LegalNavigationMinimal;
}
