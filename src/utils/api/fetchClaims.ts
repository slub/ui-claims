import keyBy from 'lodash/keyBy';

import type {
  HTTPClient,
  HTTPClientOptions,
} from '@folio/stripes-acq-components';

import {
  fetchOrganizationsByIds,
} from '@folio/stripes-acq-components';

import { fetchWrapperPieces } from './fetchWrapperPieces';

interface DataShape {
  claims: ACQ.Claim[];
  totalRecords: number;
}

export const fetchClaims = (httpClient: HTTPClient) => async (options: HTTPClientOptions): Promise<DataShape> => {
  const { signal } = options;
  const { wrapperPieces, totalRecords } = await fetchWrapperPieces(httpClient)(options);

  const organizationIdsSet = new Set<string>(wrapperPieces.map(({ vendorId }) => vendorId));
  const { organizations } = await fetchOrganizationsByIds(httpClient)(
    Array.from(organizationIdsSet), { signal },
  );

  const organizationsDict = keyBy(organizations, 'id');

  return {
    claims: wrapperPieces.map(({ piece, vendorId, poLine, title }) => {
      const vendor = organizationsDict[vendorId];

      return {
        ...piece,
        title: title.title,
        vendorCode: vendor.code,
        vendorName: vendor.name,
        poLineNumber: poLine.poLineNumber,
        vendorId,
        acquisitionMethod: poLine.acquisitionMethod,
        claimSequenceId: poLine.claimSequenceId,
      };
    }),
    totalRecords,
  };
};
