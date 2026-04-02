import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { ORDER_TYPES } from '@folio/stripes-acq-components';

import { FILTERS } from '../../constants';
import ClaimingListFilters from './ClaimingListFilters';

jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  AcqTagsFilter: () => 'AcqTagsFilter',
  AcqUnitFilter: () => 'AcqUnitFilter',
  CustomFieldsFilters: () => 'CustomFieldsFilters',
  LocationFilterContainer: () => 'LocationFilterContainer',
  PluggableOrganizationFilter: () => 'PluggableOrganizationFilter',
  PluggableUserFilter: () => 'PluggableUserFilter',
  useAddresses: jest.fn(() => ({ addresses: [] })),
  useMaterialTypes: jest.fn(() => ({ materialTypes: [], isLoading: false })),
}));

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  useCustomFields: jest.fn(() => ([[]])),
}));

const defaultProps: Parameters<typeof ClaimingListFilters>[0] = {
  activeFilters: {},
  applyFilters: jest.fn(),
  disabled: false,
};

const renderComponent = (props = {}) => render(
  <ClaimingListFilters
    {...defaultProps}
    {...props}
  />,
  { wrapper: MemoryRouter },
);

describe('ClaimingListFilters', () => {
  it('should apply filter', async () => {
    renderComponent();

    await userEvent.click(screen.getByText('stripes-acq-components.order.type.oneTime'));

    expect(defaultProps.applyFilters).toHaveBeenCalledWith(FILTERS.ORDER_TYPE, [ORDER_TYPES.oneTime]);
  });
});
