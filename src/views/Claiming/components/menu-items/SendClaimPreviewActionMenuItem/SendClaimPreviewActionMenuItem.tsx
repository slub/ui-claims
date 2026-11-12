import React from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Icon,
} from '@folio/stripes/components';

interface SendClaimPreviewActionMenuItemProps {
  disabled?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const SendClaimPreviewActionMenuItem: React.FC<SendClaimPreviewActionMenuItemProps> = ({
  disabled,
  onClick,
}) => {
  return (
    <Button
      data-testid="send-claim-preview-button"
      buttonStyle="dropdownItem"
      disabled={disabled}
      onClick={onClick}
    >
      <Icon icon="envelope">
        <FormattedMessage id="ui-claims.claiming.action.sendClaimPreview" />
      </Icon>
    </Button>
  );
};
