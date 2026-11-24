import type {
  ErrorHandlingStrategy,
  ResponseErrorsContainer,
} from '@folio/stripes-acq-components';

import type {
  ErrorHandlingStrategyBaseParams,
  ResponseErrorCode,
} from './handlers';

interface ErrorHandlingStrategyParams extends ErrorHandlingStrategyBaseParams {
  code: ResponseErrorCode,
}

// For the errors mod-orders reports per piece when the claim sequence of its PO line cannot be applied
export const claimSequenceErrorStrategy = ({
  callback,
  code,
  showCallout,
}: ErrorHandlingStrategyParams): ErrorHandlingStrategy => {
  const handle = async (errorsContainer: ResponseErrorsContainer) => {
    const error = errorsContainer.getError();

    const pieceIds = error.parameters
      .filter(({ key }) => key === 'pieceId')
      .map(({ value }) => value);

    await callback?.({ pieceIds });

    showCallout({
      messageId: `ui-claims.error.code.${code}`,
      type: 'error',
    });
  };

  return { handle };
};
