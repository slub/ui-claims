import keyBy from 'lodash/keyBy';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import {
  ALL_RECORDS_CQL,
  LIMIT_MAX,
} from '@folio/stripes-acq-components';

import { CLAIM_SEQUENCES_API } from '../../../../../../constants';
import type { ClaimSequence } from '../types';

// Same as for the effective configs, so reopening the modal soon after reuses the list
const STALE_TIME = 30_000;

interface Options {
  enabled: boolean;
}

interface ClaimSequencesResponse {
  claimSequences?: ClaimSequence[];
}

interface ReturnData {
  sequencesById: Record<string, ClaimSequence>;
  isError: boolean;
  isFetching: boolean;
  isLoading: boolean;
}

export const useClaimSequencesById = ({ enabled }: Options): ReturnData => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'claim-sequences' });

  const {
    data,
    isError,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: [namespace],
    queryFn: ({ signal }) => ky
      .get(CLAIM_SEQUENCES_API, { searchParams: { query: ALL_RECORDS_CQL, limit: LIMIT_MAX }, signal })
      .json<ClaimSequencesResponse>(),
    enabled,
    retry: false,
    staleTime: STALE_TIME,
  });

  const sequencesById = useMemo<Record<string, ClaimSequence>>(
    () => keyBy(data?.claimSequences ?? [], 'id'),
    [data],
  );

  return {
    sequencesById,
    isError,
    isFetching,
    isLoading,
  };
};
