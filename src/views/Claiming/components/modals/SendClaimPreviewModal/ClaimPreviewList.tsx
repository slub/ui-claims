import sortBy from 'lodash/sortBy';
import React, { useMemo } from 'react';
import {
  FormattedDate,
  FormattedMessage,
  useIntl,
} from 'react-intl';

import {
  Checkbox,
  Icon,
  MultiColumnList,
  NoValue,
} from '@folio/stripes/components';

import type {
  ClaimPreviewRow,
  ExportConfig,
} from './types';

const VISIBLE_COLUMNS = ['selected', 'title', 'vendor', 'nextStage', 'sentVia', 'claimExpiryDate', 'stageNote', 'status'] as const;

type Column = typeof VISIBLE_COLUMNS[number];

// Fixed widths switch off the MCL measuring, so long texts wrap instead of widening the modal.
// Status fits "Ready to send" and the date header fits on one line; the sum stays below the
// width of a large modal.
const COLUMN_WIDTHS: Record<Column, string> = {
  selected: '40px',
  title: '180px',
  vendor: '110px',
  nextStage: '130px',
  sentVia: '150px',
  claimExpiryDate: '140px',
  stageNote: '160px',
  status: '130px',
};

const MESSAGE_PREFIX = 'ui-claims.claiming.sendClaimPreview';

// The full title stays available as a tooltip
const MAX_TITLE_LENGTH = 50;

const truncate = (value = '', maxLength = MAX_TITLE_LENGTH): string => (
  value.length > maxLength ? `${value.slice(0, maxLength)}…` : value
);

const addDays = (days: number): Date => {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return date;
};

const formatConfig = (config: ExportConfig): string => {
  const { configName, transmissionMethod } = config.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig ?? {};

  return [transmissionMethod, configName].filter(Boolean).join(' · ');
};

interface Props {
  id: string;
  rows: ClaimPreviewRow[];
  selection: Record<string, boolean>;
  onToggle: (pieceId: string) => void;
}

export const ClaimPreviewList: React.FC<Props> = ({
  id,
  rows,
  selection,
  onToggle,
}) => {
  const intl = useIntl();

  const contentData = useMemo(() => sortBy(rows, ['claim.vendorName', 'claim.title']), [rows]);

  const columnMapping = useMemo<Record<Column, React.ReactNode>>(() => ({
    selected: null,
    title: <FormattedMessage id={`${MESSAGE_PREFIX}.column.title`} />,
    vendor: <FormattedMessage id={`${MESSAGE_PREFIX}.column.vendor`} />,
    nextStage: <FormattedMessage id={`${MESSAGE_PREFIX}.column.nextStage`} />,
    sentVia: <FormattedMessage id={`${MESSAGE_PREFIX}.column.sentVia`} />,
    claimExpiryDate: <FormattedMessage id={`${MESSAGE_PREFIX}.column.claimExpiryDate`} />,
    stageNote: <FormattedMessage id={`${MESSAGE_PREFIX}.column.stageNote`} />,
    status: <FormattedMessage id={`${MESSAGE_PREFIX}.column.status`} />,
  }), []);

  const formatter: Record<Column, (row: ClaimPreviewRow) => React.ReactNode> = {
    selected: ({ claim, isSelectable }) => (
      <Checkbox
        checked={Boolean(selection[claim.id])}
        disabled={!isSelectable}
        onChange={() => onToggle(claim.id)}
        aria-label={intl.formatMessage({ id: `${MESSAGE_PREFIX}.selectPiece` }, { title: claim.title })}
      />
    ),
    // MCL cells are flex rows, the wrapper keeps the lines stacked
    title: ({ claim }) => (
      <div>
        <div title={claim.title}>{truncate(claim.title)}</div>
        {claim.displaySummary && <div>{claim.displaySummary}</div>}
      </div>
    ),
    vendor: ({ claim }) => claim.vendorName || claim.vendorCode || <NoValue />,
    nextStage: ({ isCompleted, nextStage, stageCount }) => {
      if (isCompleted) {
        return <FormattedMessage id={`${MESSAGE_PREFIX}.nextStage.completed`} values={{ count: stageCount }} />;
      }

      if (!nextStage) return <NoValue />;

      return (
        <FormattedMessage
          id={`${MESSAGE_PREFIX}.nextStage.value`}
          values={{ name: nextStage.stage.name, number: nextStage.number, count: nextStage.count }}
        />
      );
    },
    sentVia: ({ status, configs }) => {
      if (status === 'manual') return <FormattedMessage id={`${MESSAGE_PREFIX}.sentVia.manual`} />;

      if (!configs.length) return <NoValue />;

      return (
        <div>
          {configs.map((config) => <div key={config.id}>{formatConfig(config)}</div>)}
        </div>
      );
    },
    claimExpiryDate: ({ hasSequence, isSelectable, nextStage }) => {
      if (nextStage) return <FormattedDate value={addDays(nextStage.stage.interval)} />;

      if (!hasSequence && isSelectable) return <FormattedMessage id={`${MESSAGE_PREFIX}.claimExpiryDate.asEntered`} />;

      return <NoValue />;
    },
    stageNote: ({ nextStage }) => nextStage?.stage.externalNote || nextStage?.stage.internalNote || <NoValue />,
    status: ({ status }) => {
      const message = <FormattedMessage id={`${MESSAGE_PREFIX}.status.${status}`} />;

      if (status === 'sentTwice') {
        return (
          <Icon icon="exclamation-circle" size="small" status="warn">
            {message}
          </Icon>
        );
      }

      return message;
    },
  };

  return (
    <MultiColumnList
      id={id}
      columnIdPrefix={id}
      contentData={contentData}
      visibleColumns={[...VISIBLE_COLUMNS] as unknown as (keyof ClaimPreviewRow)[]}
      columnMapping={columnMapping as unknown as Record<keyof ClaimPreviewRow, React.ReactNode>}
      columnWidths={COLUMN_WIDTHS as Partial<Record<keyof ClaimPreviewRow, string>>}
      formatter={formatter as unknown as Record<keyof ClaimPreviewRow, (row: ClaimPreviewRow) => React.ReactNode>}
      interactive={false}
    />
  );
};
