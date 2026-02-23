import React, {
  useCallback,
  useMemo,
} from 'react';

import { AccordionSet } from '@folio/stripes/components';
import { useCustomFields } from '@folio/stripes/smart-components';
import {
  AcqCheckboxFilter,
  AcqDateRangeFilter,
  AcqTagsFilter,
  AcqUnitFilter,
  BooleanFilter,
  CUSTOM_FIELDS_ORDERS_BACKEND_NAME,
  CustomFieldsFilters,
  getAddressOptions,
  LocationFilterContainer,
  ORDER_FORMAT_OPTIONS,
  ORDER_TYPE_OPTIONS,
  PIECE_STATUS_OPTIONS,
  PluggableOrganizationFilter,
  PluggableUserFilter,
  SelectionFilter,
  useAddresses,
} from '@folio/stripes-acq-components';

import { CUSTOM_FIELDS_ENTITY_TYPE_PO_LINE } from '../../../../constants';
import { FILTERS } from '../../constants';
import MaterialTypeMultiSelectFilter from './MaterialTypeMultiSelectFilter';

import type { ActiveFilters } from '../../types';

interface Props {
  activeFilters: ActiveFilters;
  applyFilters: (name: string, value: ACQ.FilterValue) => void;
  disabled: boolean;
  tenantId?: string;
}

type FilterDataShape = { name: string, values: ACQ.FilterValue };

const applyFiltersAdapter = (applyFilters: Props['applyFilters']) => ({ name, values }: FilterDataShape) => applyFilters(name, values);

const ClaimingListFilters: React.FC<Props> = ({
  activeFilters,
  applyFilters,
  disabled,
  tenantId,
}) => {
  const adaptedApplyFilters = useCallback((data: FilterDataShape) => {
    return applyFiltersAdapter(applyFilters)(data);
  }, [applyFilters]);

  const [
    customFields,
    isLoadingCustomFields,
  ] = useCustomFields(CUSTOM_FIELDS_ORDERS_BACKEND_NAME, CUSTOM_FIELDS_ENTITY_TYPE_PO_LINE);

  const {
    addresses,
    isLoading: isAddressesLoading,
  } = useAddresses();

  const addressOptions = useMemo(() => getAddressOptions(addresses), [addresses]);

  return (
    <AccordionSet>
      <PluggableOrganizationFilter
        id={`filter-${FILTERS.ORDER_ORGANIZATION}`}
        activeFilters={activeFilters[FILTERS.ORDER_ORGANIZATION]}
        disabled={disabled}
        labelId={`ui-claims.claiming.filters.${FILTERS.ORDER_ORGANIZATION}`}
        name={FILTERS.ORDER_ORGANIZATION}
        onChange={adaptedApplyFilters}
        tenantId={tenantId}
      />

      <AcqCheckboxFilter
        id={`filter-${FILTERS.ORDER_TYPE}`}
        activeFilters={activeFilters[FILTERS.ORDER_TYPE]}
        disabled={disabled}
        labelId={`ui-claims.claiming.filters.${FILTERS.ORDER_TYPE}`}
        name={FILTERS.ORDER_TYPE}
        onChange={adaptedApplyFilters}
        options={ORDER_TYPE_OPTIONS}
      />

      <MaterialTypeMultiSelectFilter
        id={`filter-${FILTERS.MATERIAL_TYPE}`}
        activeFilters={activeFilters[FILTERS.MATERIAL_TYPE]}
        disabled={disabled}
        labelId={`ui-claims.claiming.filters.${FILTERS.MATERIAL_TYPE}`}
        name={FILTERS.MATERIAL_TYPE}
        onChange={adaptedApplyFilters}
        tenantId={tenantId}
      />

      <AcqCheckboxFilter
        id={`filter-${FILTERS.ORDER_FORMAT}`}
        activeFilters={activeFilters[FILTERS.ORDER_FORMAT]}
        disabled={disabled}
        labelId={`ui-claims.claiming.filters.${FILTERS.ORDER_FORMAT}`}
        name={FILTERS.ORDER_FORMAT}
        onChange={adaptedApplyFilters}
        options={ORDER_FORMAT_OPTIONS}
      />

      <AcqTagsFilter
        id={`filter-${FILTERS.POL_TAGS}`}
        activeFilters={activeFilters[FILTERS.POL_TAGS]}
        disabled={disabled}
        name={FILTERS.POL_TAGS}
        onChange={adaptedApplyFilters}
        tenantId={tenantId}
      />

      <LocationFilterContainer
        id={`filter-${FILTERS.LOCATION}`}
        activeFilter={activeFilters[FILTERS.LOCATION]}
        disabled={disabled}
        labelId={`ui-claims.claiming.filters.${FILTERS.LOCATION}`}
        name={FILTERS.LOCATION}
        onChange={adaptedApplyFilters}
      />

      <BooleanFilter
        id={`filter-${FILTERS.POL_CLAIMING_ACTIVE}`}
        activeFilters={activeFilters[FILTERS.POL_CLAIMING_ACTIVE]}
        disabled={disabled}
        labelId={`ui-claims.claiming.filters.${FILTERS.POL_CLAIMING_ACTIVE}`}
        name={FILTERS.POL_CLAIMING_ACTIVE}
        onChange={adaptedApplyFilters}
      />

      <AcqCheckboxFilter
        id={`filter-${FILTERS.RECEIVING_STATUS}`}
        activeFilters={activeFilters[FILTERS.RECEIVING_STATUS]}
        disabled={disabled}
        labelId={`ui-claims.claiming.filters.${FILTERS.RECEIVING_STATUS}`}
        name={FILTERS.RECEIVING_STATUS}
        onChange={adaptedApplyFilters}
        options={PIECE_STATUS_OPTIONS}
      />

      <AcqUnitFilter
        id={`filter-${FILTERS.ACQUISITIONS_UNIT}`}
        activeFilters={activeFilters[FILTERS.ACQUISITIONS_UNIT]}
        disabled={disabled}
        name={FILTERS.ACQUISITIONS_UNIT}
        onChange={adaptedApplyFilters}
        tenantId={tenantId}
      />

      <BooleanFilter
        id={`filter-${FILTERS.RUSH}`}
        activeFilters={activeFilters[FILTERS.RUSH]}
        disabled={disabled}
        labelId={`ui-claims.claiming.filters.${FILTERS.RUSH}`}
        name={FILTERS.RUSH}
        onChange={adaptedApplyFilters}
      />

      <AcqDateRangeFilter
        activeFilters={activeFilters[FILTERS.RECEIVED_DATE]}
        labelId={`ui-claims.claiming.filters.${FILTERS.RECEIVED_DATE}`}
        name={FILTERS.RECEIVED_DATE}
        onChange={adaptedApplyFilters}
        disabled={disabled}
      />

      <AcqDateRangeFilter
        activeFilters={activeFilters[FILTERS.EXPECTED_RECEIPT_DATE]}
        labelId={`ui-claims.claiming.filters.${FILTERS.EXPECTED_RECEIPT_DATE}`}
        name={FILTERS.EXPECTED_RECEIPT_DATE}
        onChange={adaptedApplyFilters}
        disabled={disabled}
      />

      <AcqDateRangeFilter
        activeFilters={activeFilters[FILTERS.RECEIPT_DUE]}
        labelId={`ui-claims.claiming.filters.${FILTERS.RECEIPT_DUE}`}
        name={FILTERS.RECEIPT_DUE}
        onChange={adaptedApplyFilters}
        disabled={disabled}
      />

      <PluggableUserFilter
        id={FILTERS.PIECE_CREATED_BY}
        activeFilters={activeFilters[FILTERS.PIECE_CREATED_BY]}
        labelId={`ui-claims.claiming.filters.${FILTERS.PIECE_CREATED_BY}`}
        name={FILTERS.PIECE_CREATED_BY}
        onChange={adaptedApplyFilters}
        disabled={disabled}
        tenantId={tenantId}
      />

      <AcqDateRangeFilter
        id={FILTERS.PIECE_DATE_CREATED}
        activeFilters={activeFilters[FILTERS.PIECE_DATE_CREATED]}
        labelId={`ui-claims.claiming.filters.${FILTERS.PIECE_DATE_CREATED}`}
        name={FILTERS.PIECE_DATE_CREATED}
        onChange={adaptedApplyFilters}
        disabled={disabled}
      />

      <PluggableUserFilter
        id={FILTERS.PIECE_UPDATED_BY}
        activeFilters={activeFilters[FILTERS.PIECE_UPDATED_BY]}
        labelId={`ui-claims.claiming.filters.${FILTERS.PIECE_UPDATED_BY}`}
        name={FILTERS.PIECE_UPDATED_BY}
        onChange={adaptedApplyFilters}
        disabled={disabled}
        tenantId={tenantId}
      />

      <AcqDateRangeFilter
        id={FILTERS.PIECE_DATE_UPDATED}
        activeFilters={activeFilters[FILTERS.PIECE_DATE_UPDATED]}
        labelId={`ui-claims.claiming.filters.${FILTERS.PIECE_DATE_UPDATED}`}
        name={FILTERS.PIECE_DATE_UPDATED}
        onChange={adaptedApplyFilters}
        disabled={disabled}
      />

      <PluggableUserFilter
        id={FILTERS.TITLE_CREATED_BY}
        activeFilters={activeFilters[FILTERS.TITLE_CREATED_BY]}
        labelId={`ui-claims.claiming.filters.${FILTERS.TITLE_CREATED_BY}`}
        name={FILTERS.TITLE_CREATED_BY}
        onChange={adaptedApplyFilters}
        disabled={disabled}
        tenantId={tenantId}
      />

      <AcqDateRangeFilter
        id={FILTERS.TITLE_DATE_CREATED}
        activeFilters={activeFilters[FILTERS.TITLE_DATE_CREATED]}
        labelId={`ui-claims.claiming.filters.${FILTERS.TITLE_DATE_CREATED}`}
        name={FILTERS.TITLE_DATE_CREATED}
        onChange={adaptedApplyFilters}
        disabled={disabled}
      />

      <PluggableUserFilter
        id={FILTERS.TITLE_UPDATED_BY}
        activeFilters={activeFilters[FILTERS.TITLE_UPDATED_BY]}
        labelId={`ui-claims.claiming.filters.${FILTERS.TITLE_UPDATED_BY}`}
        name={FILTERS.TITLE_UPDATED_BY}
        onChange={adaptedApplyFilters}
        disabled={disabled}
        tenantId={tenantId}
      />

      <AcqDateRangeFilter
        id={FILTERS.TITLE_DATE_UPDATED}
        activeFilters={activeFilters[FILTERS.TITLE_DATE_UPDATED]}
        labelId={`ui-claims.claiming.filters.${FILTERS.TITLE_DATE_UPDATED}`}
        name={FILTERS.TITLE_DATE_UPDATED}
        onChange={adaptedApplyFilters}
        disabled={disabled}
      />

      <SelectionFilter
        activeFilters={activeFilters[FILTERS.SHIP_TO]}
        options={addressOptions}
        disabled={disabled || isAddressesLoading}
        id={FILTERS.SHIP_TO}
        labelId={`ui-claims.claiming.filters.${FILTERS.SHIP_TO}`}
        name={FILTERS.SHIP_TO}
        onChange={adaptedApplyFilters}
      />

      <CustomFieldsFilters
        activeFilters={activeFilters}
        customFields={customFields}
        disabled={disabled || isLoadingCustomFields}
        id={FILTERS.CUSTOM_FIELDS}
        name={FILTERS.CUSTOM_FIELDS}
        onChange={adaptedApplyFilters}
      />
    </AccordionSet>
  );
};

export default ClaimingListFilters;
