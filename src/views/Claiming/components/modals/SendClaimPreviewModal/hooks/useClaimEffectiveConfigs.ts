import { useMemo } from 'react';
import { useQueries } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { EFFECTIVE_EXPORT_CONFIGS_API } from '../../../../../../constants';
import type {
  ConfigCriteria,
  ExportConfig,
} from '../types';
import { getCriteriaKey } from '../utils';

// FOLIO_EXPORT_TYPE.CLAIMS from stripes-acq-components, not in @folio/stripes-types
const CLAIMS_EXPORT_TYPE = 'CLAIMS';

// mod-orders caches this lookup for 30 seconds as well (MODORDERS-1491)
const STALE_TIME = 30_000;

interface Options {
  enabled: boolean;
}

interface EffectiveConfigsResponse {
  configs?: ExportConfig[];
}

interface ReturnData {
  configsByKey: Record<string, ExportConfig[]>;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
}

/*
  One query per combination, so reopening with a changed selection only fetches
  the combinations that are new.
*/
export const useClaimEffectiveConfigs = (criteriaList: ConfigCriteria[], { enabled }: Options): ReturnData => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'claim-effective-configs' });

  const results = useQueries(criteriaList.map((criteria) => ({
    queryKey: [namespace, criteria.vendorId, criteria.acquisitionMethod, criteria.transmissionMethod],
    queryFn: ({ signal }: { signal?: AbortSignal }) => ky
      .get(EFFECTIVE_EXPORT_CONFIGS_API, {
        searchParams: { type: CLAIMS_EXPORT_TYPE, ...criteria },
        signal,
      })
      .json<EffectiveConfigsResponse>(),
    enabled,
    retry: false,
    staleTime: STALE_TIME,
  })));

  // useQueries returns a new array on every render, the timestamps change only with the data
  const updatedAt = results.map(({ dataUpdatedAt }) => dataUpdatedAt).join();

  const configsByKey = useMemo(() => {
    return criteriaList.reduce<Record<string, ExportConfig[]>>((acc, criteria, index) => {
      const data = results[index]?.data as EffectiveConfigsResponse | undefined;

      acc[getCriteriaKey(criteria)] = data?.configs ?? [];

      return acc;
    }, {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteriaList, updatedAt]);

  return {
    configsByKey,
    isError: results.some(({ isError }) => isError),
    isFetching: results.some(({ isFetching }) => isFetching),
    isLoading: results.some(({ isLoading }) => isLoading),
  };
};
