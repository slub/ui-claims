import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import {
  Button,
  Col,
  Datepicker,
  Headline,
  Loading,
  MessageBanner,
  Modal,
  Row,
  TextArea,
} from '@folio/stripes/components';
import { ModalFooter } from '@folio/stripes-acq-components';

import { ClaimPreviewList } from './ClaimPreviewList';
import { useClaimPreview } from './hooks';

const MESSAGE_PREFIX = 'ui-claims.claiming.sendClaimPreview';

interface Props {
  claims: ACQ.Claim[];
  onCancel: () => void;
}

/*
  PoC: shows how each selected piece would be claimed. Sending stays disabled until
  the backend evaluates the claim sequence stages.
*/
export const SendClaimPreviewModal: React.FC<Props> = ({
  claims,
  onCancel,
}) => {
  const intl = useIntl();
  const modalLabel = intl.formatMessage({ id: `${MESSAGE_PREFIX}.modal.heading` });

  const { rows, isLoading, isError } = useClaimPreview(claims);

  const [selection, setSelection] = useState<Record<string, boolean> | null>(null);
  const [claimExpiryDate, setClaimExpiryDate] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [externalNote, setExternalNote] = useState('');

  // Initialised once the rows are loaded, so the defaults reflect the real matches
  useEffect(() => {
    if (!isLoading && !isError && selection === null) {
      setSelection(rows.reduce<Record<string, boolean>>((acc, { claim, isSelectable }) => {
        acc[claim.id] = isSelectable;

        return acc;
      }, {}));
    }
  }, [isLoading, isError, rows, selection]);

  const onToggle = (pieceId: string) => {
    setSelection((prev) => ({ ...prev, [pieceId]: !prev?.[pieceId] }));
  };

  const withSequence = useMemo(() => rows.filter(({ hasSequence }) => hasSequence), [rows]);
  const withoutSequence = useMemo(() => rows.filter(({ hasSequence }) => !hasSequence), [rows]);

  const countSelected = (list: typeof rows) => list.filter(({ claim }) => selection?.[claim.id]).length;
  const selectedCount = countSelected(rows);
  const sentTwiceCount = rows.filter(({ status }) => status === 'sentTwice').length;
  const blockedCount = rows.filter(({ isSelectable }) => !isSelectable).length;

  const start = (
    <Button
      marginBottom0
      onClick={onCancel}
    >
      <FormattedMessage id="stripes-acq-components.FormFooter.cancel" />
    </Button>
  );
  const end = (
    <Button
      buttonStyle="primary"
      disabled
      marginBottom0
    >
      <FormattedMessage id={`${MESSAGE_PREFIX}.send`} values={{ count: selectedCount }} />
    </Button>
  );

  const footer = (
    <ModalFooter
      renderStart={start}
      renderEnd={end}
    />
  );

  const renderSection = (id: string, headingId: string, list: typeof rows) => (
    <>
      <Headline size="medium" margin="medium">
        <FormattedMessage
          id={headingId}
          values={{ selected: countSelected(list), total: list.length }}
        />
      </Headline>
      <ClaimPreviewList
        id={id}
        rows={list}
        selection={selection ?? {}}
        onToggle={onToggle}
      />
    </>
  );

  const renderContent = () => {
    // Without the lookup every piece would read "no matching claiming integration"
    if (isError) {
      return (
        <MessageBanner type="error">
          <FormattedMessage id={`${MESSAGE_PREFIX}.loadError`} />
        </MessageBanner>
      );
    }

    if (isLoading || selection === null) return <Loading />;

    return (
      <>
        {(sentTwiceCount > 0 || blockedCount > 0) && (
          <MessageBanner type="warning">
            {sentTwiceCount > 0 && (
              <FormattedMessage id={`${MESSAGE_PREFIX}.banner.sentTwice`} values={{ count: sentTwiceCount }} />
            )}
            {sentTwiceCount > 0 && blockedCount > 0 && ' '}
            {blockedCount > 0 && (
              <FormattedMessage id={`${MESSAGE_PREFIX}.banner.blocked`} values={{ count: blockedCount }} />
            )}
          </MessageBanner>
        )}

        {withSequence.length > 0 && renderSection(
          'send-claim-preview-with-sequence',
          `${MESSAGE_PREFIX}.section.withSequence`,
          withSequence,
        )}

        {withoutSequence.length > 0 && (
          <>
            {renderSection(
              'send-claim-preview-without-sequence',
              `${MESSAGE_PREFIX}.section.withoutSequence`,
              withoutSequence,
            )}
            <Row>
              <Col xs={4}>
                <Datepicker
                  label={<FormattedMessage id={`${MESSAGE_PREFIX}.field.claimExpiryDate`} />}
                  value={claimExpiryDate}
                  onChange={(_e, formatted) => setClaimExpiryDate(formatted)}
                />
              </Col>
            </Row>
          </>
        )}

        <Headline size="medium" margin="medium">
          <FormattedMessage id={`${MESSAGE_PREFIX}.section.notes`} values={{ count: selectedCount }} />
        </Headline>
        <Row>
          <Col xs={6}>
            <TextArea
              label={<FormattedMessage id={`${MESSAGE_PREFIX}.field.internalNote`} />}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
            />
          </Col>
          <Col xs={6}>
            <TextArea
              label={<FormattedMessage id={`${MESSAGE_PREFIX}.field.externalNote`} />}
              value={externalNote}
              onChange={(e) => setExternalNote(e.target.value)}
            />
          </Col>
        </Row>
      </>
    );
  };

  return (
    <Modal
      open
      id="send-claim-preview-modal"
      size="large"
      footer={footer}
      label={modalLabel}
      aria-label={modalLabel}
      dismissible
      onClose={onCancel}
    >
      {renderContent()}
    </Modal>
  );
};
