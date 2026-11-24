import { useCallback } from 'react';

import {
  ResponseErrorsContainer,
  useShowCallout,
} from '@folio/stripes-acq-components';

import type {
  CallbacksDict,
  ResponseErrorCode,
} from './handlers';

import { RESPONSE_ERROR_CODE } from '../../constants';
import {
  claimSequenceErrorStrategy,
  expectedLateStatusForPieceStrategy,
  genericErrorStrategy,
  noIntegrationStrategy,
} from './handlers';

interface HandlerOptions {
  callbacksDict?: CallbacksDict,
  defaultMessageId?: string,
}

interface ClaimErrorsHandlerReturnType {
  handlerErrorResponse: (response: Response, options?: HandlerOptions) => Promise<void>,
}

export const useClaimErrorsHandler = (): ClaimErrorsHandlerReturnType => {
  const showCallout = useShowCallout();

  const handlerErrorResponse = useCallback(async (response: Response, options?: HandlerOptions) => {
    const { handler } = await ResponseErrorsContainer.create(response);

    const errorCode = handler.getError().code;
    const getCallback = (code: ResponseErrorCode) => options?.callbacksDict?.[code];

    switch (errorCode) {
      case RESPONSE_ERROR_CODE.cannotFindPiecesWithLatestStatusToProcess: {
        handler.handle(expectedLateStatusForPieceStrategy({
          callback: getCallback(errorCode),
          showCallout,
        }));
        break;
      }
      case RESPONSE_ERROR_CODE.claimSequenceCompleted:
      case RESPONSE_ERROR_CODE.claimSequenceInactive:
      case RESPONSE_ERROR_CODE.claimSequenceNotFound:
      case RESPONSE_ERROR_CODE.claimSequenceStageRequiresIntegration: {
        handler.handle(claimSequenceErrorStrategy({
          callback: getCallback(errorCode),
          code: errorCode,
          showCallout,
        }));
        break;
      }
      case RESPONSE_ERROR_CODE.unableToGenerateClaimsForOrgNoIntegrationDetails: {
        handler.handle(noIntegrationStrategy({
          callback: getCallback(errorCode),
          showCallout,
        }));
        break;
      }
      case RESPONSE_ERROR_CODE.genericError:
      default: {
        handler.handle(genericErrorStrategy({
          callback: getCallback(RESPONSE_ERROR_CODE.genericError),
          defaultMessageId: options?.defaultMessageId,
          showCallout,
        }));
        break;
      }
    }
  }, [showCallout]);

  return {
    handlerErrorResponse,
  };
};
