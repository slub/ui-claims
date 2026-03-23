import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  act,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import {
  useClaimsDelay,
  useClaimsSend,
  useLocationSorting,
  usePiecesStatusBatchUpdate,
} from '@folio/stripes-acq-components';
import { dayjs } from '@folio/stripes/components';

import { claim } from 'fixtures';
import { Claiming } from './Claiming';
import { CLAIMING_HIDDEN_LIST_COLUMNS } from './constants';
import { useClaiming } from './hooks';

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  // eslint-disable-next-line react/prop-types
  PersistedPaneset: (props: { children: React.ReactNode }) => <div>{props.children}</div>,
  useCustomFields: jest.fn(() => ([[]])),
}));
jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  AcqTagsFilter: () => 'AcqTagsFilter',
  AcqUnitFilter: () => 'AcqUnitFilter',
  CustomFieldsFilters: () => 'CustomFieldsFilters',
  LocationFilterContainer: () => 'LocationFilterContainer',
  MaterialTypeFilterContainer: () => 'MaterialTypeFilterContainer',
  PluggableOrganizationFilter: () => 'PluggableOrganizationFilter',
  PluggableUserFilter: () => 'PluggableUserFilter',
  useAddresses: jest.fn(() => ({ addresses: [] })),
  useItemToView: jest.fn(() => ({
    itemToView: 'itemToView',
    setItemToView: jest.fn(),
    deleteItemToView: jest.fn(),
  })),
  useClaimsDelay: jest.fn(),
  useClaimsSend: jest.fn(),
  useFiltersToogle: jest.fn(() => ({ isFiltersOpened: true, toggleFilters: jest.fn() })),
  usePiecesStatusBatchUpdate: jest.fn(),
  useLocationSorting: jest.fn(),
}));
jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useClaiming: jest.fn(),
}));

const renderComponent = (props = {}) => render(
  <Claiming {...props} />,
  { wrapper: MemoryRouter },
);

describe('Claiming', () => {
  const delayClaims = jest.fn();
  const sendClaims = jest.fn();
  const updatePiecesStatus = jest.fn();
  const changeSorting = jest.fn();

  beforeEach(() => {
    (useClaiming as jest.Mock).mockReturnValue({
      claims: [claim],
      refetch: jest.fn(),
    });
    (useClaimsDelay as jest.Mock).mockReturnValue({ delayClaims });
    (useClaimsSend as jest.Mock).mockReturnValue({ sendClaims });
    (usePiecesStatusBatchUpdate as jest.Mock).mockReturnValue({ updatePiecesStatus });
    (useLocationSorting as jest.Mock).mockReturnValue([
      null,
      null,
      changeSorting,
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render component', () => {
    renderComponent();

    expect(screen.getByText('ui-claims.claiming.results.title')).toBeInTheDocument();
  });

  describe('Group by Org', () => {
    it('should sort group by org', async () => {
      const { container } = renderComponent();

      await act(async () => {
        await userEvent.click(container.querySelector('[data-test-pane-header-actions-button]'));
        await userEvent.click(screen.getByTestId('group-by-org-button'));
      });

      expect(changeSorting).toHaveBeenCalledWith(expect.anything(), { name: CLAIMING_HIDDEN_LIST_COLUMNS.vendorId });
    });
  });

  describe('Send claim', () => {
    it('should handle action submit', async () => {
      const { container } = renderComponent();

      /* No selected records */
      await userEvent.click(container.querySelector('[data-test-pane-header-actions-button]'));
      expect(screen.getByTestId('send-claim-button')).toBeDisabled();

      /* Select record */
      await act(async () => {
        await userEvent.click(screen.getByRole('checkbox', { name: 'ui-claims.claiming.results.columns.select' }));
      });

      expect(screen.getByRole('checkbox', { name: 'ui-claims.claiming.results.columns.select' })).toBeChecked();
      expect(screen.getByTestId('send-claim-button')).toBeEnabled();

      /* Open send claim modal */
      await act(async () => {
        await userEvent.click(screen.getByTestId('send-claim-button'));
      });

      expect(screen.getByText('stripes-acq-components.claiming.modal.sendClaim.heading')).toBeInTheDocument();

      /* Fill the form - use the Datepicker's placeholder as the format
         to be locale-independent (the Datepicker derives its format from the system locale) */
      const sendDateInput = screen.getByRole('textbox', { name: 'stripes-acq-components.claiming.modal.sendClaim.field.claimExpiryDate' });
      const sendDateFormat = (sendDateInput as HTMLInputElement).placeholder;

      await userEvent.type(sendDateInput, dayjs().add(5, 'days').format(sendDateFormat));
      await userEvent.click(screen.getByRole('button', { name: 'stripes-acq-components.FormFooter.save' }));

      expect(sendClaims).toHaveBeenCalled();
    });
  });

  describe('Delay claim', () => {
    it('should handle action submit', async () => {
      const { container } = renderComponent();

      /* No selected records */
      await userEvent.click(container.querySelector('[data-test-pane-header-actions-button]'));
      expect(screen.getByTestId('delay-claim-button')).toBeDisabled();

      /* Select record */
      await act(async () => {
        await userEvent.click(screen.getByRole('checkbox', { name: 'ui-claims.claiming.results.columns.select' }));
      });

      expect(screen.getByRole('checkbox', { name: 'ui-claims.claiming.results.columns.select' })).toBeChecked();
      expect(screen.getByTestId('delay-claim-button')).toBeEnabled();

      /* Open delay claim modal */
      await act(async () => {
        await userEvent.click(screen.getByTestId('delay-claim-button'));
      });

      expect(screen.getByText('stripes-acq-components.claiming.modal.delayClaim.heading')).toBeInTheDocument();

      /* Fill the form - use the Datepicker's placeholder as the format */
      const delayDateInput = screen.getByRole('textbox', { name: 'stripes-acq-components.claiming.modal.delayClaim.field.delayTo' });
      const delayDateFormat = (delayDateInput as HTMLInputElement).placeholder;

      await userEvent.type(delayDateInput, dayjs().add(5, 'days').format(delayDateFormat));
      await userEvent.click(screen.getByRole('button', { name: 'stripes-acq-components.FormFooter.save' }));

      expect(delayClaims).toHaveBeenCalled();
    });
  });

  describe('Mark unreceivable', () => {
    it('should handle action submit', async () => {
      const { container } = renderComponent();

      /* No selected records */
      await userEvent.click(container.querySelector('[data-test-pane-header-actions-button]'));
      expect(screen.getByTestId('unreceivable-button')).toBeDisabled();

      /* Select record */
      await act(async () => {
        await userEvent.click(screen.getByRole('checkbox', { name: 'ui-claims.claiming.results.columns.select' }));
      });

      expect(screen.getByRole('checkbox', { name: 'ui-claims.claiming.results.columns.select' })).toBeChecked();
      expect(screen.getByTestId('unreceivable-button')).toBeEnabled();

      /* Open delay claim modal */
      await act(async () => {
        await userEvent.click(screen.getByTestId('unreceivable-button'));
      });

      expect(screen.getByText('ui-claims.claiming.markUnreceivable.modal.message')).toBeInTheDocument();

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'stripes-acq-components.FormFooter.save' }));
      });

      expect(updatePiecesStatus).toHaveBeenCalled();
    });
  });
});
