import React, { useMemo } from 'react';

import { MultiSelectionFilter } from '@folio/stripes/smart-components';
import { FilterAccordion } from '@folio/stripes-acq-components';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useMaterialTypes } from '@folio/stripes-acq-components/lib/hooks';

interface Props {
  activeFilters?: ACQ.FilterValue;
  closedByDefault?: boolean;
  disabled?: boolean;
  id: string;
  labelId: string;
  name: string;
  onChange: (data: { name: string; values: ACQ.FilterValue }) => void;
  tenantId?: string;
}

const MaterialTypeMultiSelectFilter: React.FC<Props> = ({
  activeFilters,
  closedByDefault = true,
  disabled = false,
  id,
  labelId,
  name,
  onChange,
  tenantId,
}) => {
  const { materialTypes } = useMaterialTypes({ tenantId });

  const dataOptions = useMemo(() => {
    return materialTypes.map((mt: { id: string; name: string }) => ({
      value: mt.id,
      label: mt.name,
    }));
  }, [materialTypes]);

  const selectedValues = useMemo(() => {
    if (!activeFilters) return [];

    return Array.isArray(activeFilters) ? activeFilters : [activeFilters];
  }, [activeFilters]);

  return (
    <FilterAccordion
      activeFilters={activeFilters}
      closedByDefault={closedByDefault}
      disabled={disabled}
      id={id}
      labelId={labelId}
      name={name}
      onChange={onChange}
    >
      <MultiSelectionFilter
        dataOptions={dataOptions}
        name={name}
        onChange={onChange}
        selectedValues={selectedValues}
      />
    </FilterAccordion>
  );
};

export default MaterialTypeMultiSelectFilter;
