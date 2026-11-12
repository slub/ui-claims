import { useMemo } from 'react';

import { useStripes } from '@folio/stripes/core';

import type {
  ClaimPreviewRow,
  ConfigCriteria,
} from '../types';
import {
  buildPreviewRows,
  getCriteriaKey,
  resolveClaim,
} from '../utils';
import { useClaimEffectiveConfigs } from './useClaimEffectiveConfigs';
import { useClaimSequencesById } from './useClaimSequencesById';

interface ClaimPreview {
  rows: ClaimPreviewRow[];
  isLoading: boolean;
  /** A lookup failed or a permission is missing. */
  isError: boolean;
}

export const useClaimPreview = (claims: ACQ.Claim[]): ClaimPreview => {
  const stripes = useStripes();
  const needsSequences = useMemo(() => claims.some(({ claimSequenceId }) => Boolean(claimSequenceId)), [claims]);
  const canLoad = Boolean(stripes.hasPerm('data-export.effective-configs.collection.get'))
    && (!needsSequences || Boolean(stripes.hasPerm('orders-storage.claim-sequences.collection.get')));

  const {
    sequencesById,
    isError: isSequencesError,
    isLoading: isSequencesLoading,
  } = useClaimSequencesById({ enabled: canLoad && needsSequences });

  // Pieces must not be resolved against a missing sequence list
  const sequencesReady = !needsSequences || (!isSequencesLoading && !isSequencesError);

  const resolvedClaims = useMemo(
    () => claims.map((claim) => resolveClaim(claim, sequencesById)),
    [claims, sequencesById],
  );

  const criteriaList = useMemo(() => {
    const byKey = new Map<string, ConfigCriteria>();

    resolvedClaims.forEach(({ criteria }) => {
      if (criteria) byKey.set(getCriteriaKey(criteria), criteria);
    });

    return Array.from(byKey.values());
  }, [resolvedClaims]);

  const {
    configsByKey,
    isError: isConfigsError,
    isLoading: isConfigsLoading,
  } = useClaimEffectiveConfigs(criteriaList, { enabled: canLoad && sequencesReady });

  const rows = useMemo(
    () => buildPreviewRows(resolvedClaims, configsByKey),
    [resolvedClaims, configsByKey],
  );

  const isError = !canLoad || isSequencesError || isConfigsError;

  return {
    rows,
    isError,
    isLoading: !isError && (!sequencesReady || isConfigsLoading),
  };
};
