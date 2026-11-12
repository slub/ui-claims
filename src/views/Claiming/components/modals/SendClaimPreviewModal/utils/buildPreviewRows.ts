import type {
  ClaimPreviewRow,
  ClaimPreviewStatus,
  ConfigCriteria,
  ExportConfig,
  ResolvedClaim,
} from '../types';

export const getCriteriaKey = ({
  vendorId,
  acquisitionMethod,
  transmissionMethod,
}: ConfigCriteria): string => [vendorId, acquisitionMethod ?? '', transmissionMethod ?? ''].join('|');

const getStatus = (resolved: ResolvedClaim, configs: ExportConfig[]): ClaimPreviewStatus => {
  if (!resolved.isLate) return 'notLate';

  if (resolved.isCompleted) return 'completed';

  if (resolved.nextStage?.stage.deliveryType === 'MANUAL') return 'manual';

  if (!configs.length) return 'noIntegration';

  return configs.length === 1 ? 'ready' : 'sentTwice';
};

const NOT_SELECTABLE: ClaimPreviewStatus[] = ['noIntegration', 'completed', 'notLate'];

export const buildPreviewRows = (
  resolvedClaims: ResolvedClaim[],
  configsByKey: Record<string, ExportConfig[]>,
): ClaimPreviewRow[] => {
  return resolvedClaims.map((resolved) => {
    const configs = resolved.criteria ? (configsByKey[getCriteriaKey(resolved.criteria)] ?? []) : [];
    const status = getStatus(resolved, configs);

    return {
      ...resolved,
      status,
      isSelectable: !NOT_SELECTABLE.includes(status),
      configs,
    };
  });
};
