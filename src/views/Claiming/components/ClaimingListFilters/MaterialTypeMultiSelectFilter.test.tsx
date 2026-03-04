import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import {
  act,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { useMaterialTypes } from '@folio/stripes-acq-components/lib/hooks';

import MaterialTypeMultiSelectFilter from './MaterialTypeMultiSelectFilter';

jest.mock('@folio/stripes-acq-components/lib/hooks', () => ({
  useMaterialTypes: jest.fn(),
}));

const mockMaterialTypes = [
  { id: 'mt-1', name: 'book' },
  { id: 'mt-2', name: 'dvd' },
  { id: 'mt-3', name: 'text' },
];

const defaultProps = {
  id: 'filter-materialType',
  labelId: 'ui-claims.claiming.filters.title.materialType',
  name: 'title.materialType',
  onChange: jest.fn(),
};

const renderComponent = (props = {}) => render(
  <MaterialTypeMultiSelectFilter
    {...defaultProps}
    {...props}
  />,
  { wrapper: MemoryRouter },
);

describe('MaterialTypeMultiSelectFilter', () => {
  beforeEach(() => {
    (useMaterialTypes as jest.Mock).mockReturnValue({
      materialTypes: mockMaterialTypes,
      isLoading: false,
    });
    defaultProps.onChange.mockClear();
  });

  it('should render the filter accordion', () => {
    renderComponent();

    expect(screen.getByText('ui-claims.claiming.filters.title.materialType')).toBeInTheDocument();
  });

  it('should render material type options', async () => {
    renderComponent();

    const input = screen.getByRole('combobox');

    await userEvent.click(input);

    expect(screen.getByText('book')).toBeInTheDocument();
    expect(screen.getByText('dvd')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('should call onChange when selecting a material type', async () => {
    renderComponent();

    await act(async () => {
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('book'));
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      name: 'title.materialType',
      values: ['mt-1'],
    });
  });

  it('should display selected values as tokens', () => {
    renderComponent({ activeFilters: ['mt-1', 'mt-2'] });

    expect(screen.getAllByText('book').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('dvd').length).toBeGreaterThanOrEqual(1);
  });

  it('should call onChange with empty values when clearing filter via accordion', async () => {
    const { container } = renderComponent({ activeFilters: ['mt-1'] });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const clearButton = container.querySelector('[data-test-clear-button]')!;

    await act(async () => {
      await userEvent.click(clearButton);
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      name: 'title.materialType',
      values: [],
    });
  });

  it('should pass tenantId to useMaterialTypes', () => {
    renderComponent({ tenantId: 'test-tenant' });

    expect(useMaterialTypes).toHaveBeenCalledWith({ tenantId: 'test-tenant' });
  });
});
