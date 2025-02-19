import type { QuoteProps } from './Quote.types';
import type { Step } from '@rango-dev/ui';
import type { SwapResult } from 'rango-sdk';

import { i18n } from '@lingui/core';
import {
  Alert,
  Divider,
  FullExpandedQuote,
  InfoIcon,
  QuoteTag,
  StepDetails,
  TokenAmount,
  Tooltip,
  Typography,
} from '@rango-dev/ui';
import BigNumber from 'bignumber.js';
import React, { useRef, useState } from 'react';

import { GAS_FEE_MAX } from '../../constants/quote';
import {
  GAS_FEE_MAX_DECIMALS,
  GAS_FEE_MIN_DECIMALS,
  PERCENTAGE_CHANGE_MAX_DECIMALS,
  PERCENTAGE_CHANGE_MIN_DECIMALS,
  TOKEN_AMOUNT_MAX_DECIMALS,
  TOKEN_AMOUNT_MIN_DECIMALS,
  USD_VALUE_MAX_DECIMALS,
  USD_VALUE_MIN_DECIMALS,
} from '../../constants/routing';
import {
  FooterAlert,
  FooterStepAlarm,
} from '../../containers/QuoteInfo/QuoteInfo.styles';
import { useAppStore } from '../../store/AppStore';
import { QuoteErrorType, QuoteWarningType } from '../../types';
import { getContainer, getExpanded } from '../../utils/common';
import {
  getBlockchainShortNameFor,
  getSwapperDisplayName,
} from '../../utils/meta';
import {
  formatTooltipNumbers,
  numberToString,
  roundedSecondsToString,
  totalArrivalTime,
} from '../../utils/numbers';
import {
  getPriceImpact,
  getPriceImpactLevel,
  sortTags,
} from '../../utils/quote';
import { getTotalFeeInUsd, getUsdFeeOfStep } from '../../utils/swap';

import {
  AllRoutesButton,
  BasicInfoOutput,
  basicInfoStyles,
  ContainerInfoOutput,
  Content,
  FrameIcon,
  HorizontalSeparator,
  Line,
  QuoteContainer,
  stepsDetailsStyles,
  SummaryContainer,
  summaryHeaderStyles,
  summaryStyles,
  TagContainer,
} from './Quote.styles';
import { QuoteCostDetails } from './QuoteCostDetails';
import { QuoteSummary } from './QuoteSummary';
import { QuoteTrigger } from './QuoteTrigger';

export function Quote(props: QuoteProps) {
  const {
    quote,
    input,
    output,
    error,
    warning,
    type,
    selected = false,
    tagHidden = true,
    showModalFee = true,
    onClickAllRoutes,
    fullExpandedMode = false,
    container: propContainer,
  } = props;
  const blockchains = useAppStore().blockchains();
  const tokens = useAppStore().tokens();
  const swappers = useAppStore().swappers();
  const [expanded, setExpanded] = useState(props.expanded);
  const quoteRef = useRef<HTMLButtonElement | null>(null);
  const roundedInput = numberToString(
    input.value,
    TOKEN_AMOUNT_MIN_DECIMALS,
    TOKEN_AMOUNT_MAX_DECIMALS
  );
  const roundedOutput = numberToString(
    output.value,
    TOKEN_AMOUNT_MIN_DECIMALS,
    TOKEN_AMOUNT_MAX_DECIMALS
  );
  const roundedOutputUsdValue = output.usdValue
    ? numberToString(
        output.usdValue,
        USD_VALUE_MIN_DECIMALS,
        USD_VALUE_MAX_DECIMALS
      )
    : '';
  const priceImpact = getPriceImpact(input.usdValue, output.usdValue ?? null);
  const percentageChange = numberToString(
    priceImpact,
    PERCENTAGE_CHANGE_MIN_DECIMALS,
    PERCENTAGE_CHANGE_MAX_DECIMALS
  );
  const priceImpactWarningLevel = getPriceImpactLevel(priceImpact ?? 0);

  const getQuoteSteps = (
    swaps: SwapResult[],
    internalSwap?: boolean
  ): Step[] => {
    return swaps.map((swap, index) => {
      let stepState: 'error' | 'warning' | undefined = undefined;
      const hasBridgeLimitError =
        error?.type === QuoteErrorType.BRIDGE_LIMIT &&
        error.swap.swapperId === swap.swapperId;

      const hasSlippageError =
        error?.type === QuoteErrorType.INSUFFICIENT_SLIPPAGE &&
        error.recommendedSlippages?.has(index);

      const hasSlippageWarning =
        warning?.type === QuoteWarningType.INSUFFICIENT_SLIPPAGE &&
        warning.recommendedSlippages?.has(index);

      const stepHasError = hasBridgeLimitError || hasSlippageError;
      const stepHasWarning = hasSlippageWarning;

      if (stepHasError) {
        stepState = 'error';
      } else if (stepHasWarning) {
        stepState = 'warning';
      }

      let alertTitle = stepHasError
        ? i18n.t('Slippage Error')
        : i18n.t('Slippage Warning');

      if (hasBridgeLimitError) {
        alertTitle = error?.recommendation;
      }

      return {
        swapper: {
          displayName: getSwapperDisplayName(swap.swapperId, swappers),
          image: swap.swapperLogo,
        },
        from: {
          token: { displayName: swap.from.symbol, image: swap.from.logo },
          chain: {
            displayName: getBlockchainShortNameFor(
              swap.from.blockchain,
              blockchains
            ),
            image: swap.from.blockchainLogo,
          },
          price: {
            value:
              index === 0 && !internalSwap
                ? numberToString(
                    input.value,
                    TOKEN_AMOUNT_MIN_DECIMALS,
                    TOKEN_AMOUNT_MAX_DECIMALS
                  )
                : numberToString(
                    swap.fromAmount,
                    TOKEN_AMOUNT_MIN_DECIMALS,
                    TOKEN_AMOUNT_MAX_DECIMALS
                  ),
            usdValue: numberToString(
              (swap.from.usdPrice ?? 0) * parseFloat(swap.fromAmount),
              USD_VALUE_MIN_DECIMALS,
              USD_VALUE_MAX_DECIMALS
            ),
            realValue: formatTooltipNumbers(
              index === 0 ? input.value : swap.fromAmount
            ),
            realUsdValue: formatTooltipNumbers(
              new BigNumber(swap.from.usdPrice ?? 0).multipliedBy(
                swap.fromAmount
              )
            ),
          },
        },
        to: {
          token: { displayName: swap.to.symbol, image: swap.to.logo },
          chain: {
            displayName: getBlockchainShortNameFor(
              swap.to.blockchain,
              blockchains
            ),
            image: swap.to.blockchainLogo,
          },
          price: {
            value: numberToString(
              swap.toAmount,
              TOKEN_AMOUNT_MIN_DECIMALS,
              TOKEN_AMOUNT_MAX_DECIMALS
            ),
            usdValue: numberToString(
              (swap.to.usdPrice ?? 0) * parseFloat(swap.toAmount),
              USD_VALUE_MIN_DECIMALS,
              USD_VALUE_MAX_DECIMALS
            ),
            realValue: formatTooltipNumbers(swap.toAmount),
            realUsdValue: formatTooltipNumbers(
              new BigNumber(swap.to.usdPrice ?? 0).multipliedBy(swap.toAmount)
            ),
          },
        },
        state: stepState,
        alerts:
          stepHasError || stepHasWarning ? (
            <FooterStepAlarm dense={fullExpandedMode}>
              <Alert
                variant="alarm"
                type={stepHasError ? 'error' : 'warning'}
                title={alertTitle}
                footer={
                  !fullExpandedMode ? (
                    <FooterAlert>
                      {hasBridgeLimitError && (
                        <>
                          <Typography
                            size="xsmall"
                            variant="body"
                            color="neutral900">
                            {error.fromAmountRangeError}
                          </Typography>
                          <Divider direction="horizontal" size={8} />
                          <Typography
                            size="xsmall"
                            variant="body"
                            color="neutral900">
                            |
                          </Typography>
                          <Divider direction="horizontal" size={8} />
                          <Typography
                            size="xsmall"
                            variant="body"
                            color="neutral900">
                            {i18n.t({
                              id: 'Yours: {amount} {symbol}',
                              values: {
                                amount: numberToString(
                                  swap.fromAmount,
                                  TOKEN_AMOUNT_MIN_DECIMALS,
                                  TOKEN_AMOUNT_MAX_DECIMALS
                                ),
                                symbol: swap?.from.symbol,
                              },
                            })}
                          </Typography>
                        </>
                      )}
                      {(hasSlippageError || hasSlippageWarning) &&
                        !hasBridgeLimitError && (
                          <Typography
                            size="xsmall"
                            variant="body"
                            color="neutral900">
                            {i18n.t({
                              id: 'Minimum required slippage is {minRequiredSlippage}',
                              values: {
                                ...(error?.type ===
                                  QuoteErrorType.INSUFFICIENT_SLIPPAGE && {
                                  minRequiredSlippage:
                                    error.recommendedSlippages?.get(index),
                                }),
                                ...(warning?.type ===
                                  QuoteWarningType.INSUFFICIENT_SLIPPAGE && {
                                  minRequiredSlippage:
                                    warning.recommendedSlippages?.get(index),
                                }),
                              },
                            })}
                          </Typography>
                        )}
                    </FooterAlert>
                  ) : null
                }
              />
            </FooterStepAlarm>
          ) : undefined,
        time: roundedSecondsToString(swap.estimatedTimeInSeconds),
        fee: numberToString(
          getUsdFeeOfStep(swap, tokens),
          GAS_FEE_MIN_DECIMALS,
          GAS_FEE_MAX_DECIMALS
        ),
        internalSwaps: swap.internalSwaps
          ? getQuoteSteps(swap.internalSwaps)
          : undefined,
      };
    });
  };
  const steps = getQuoteSteps(quote?.swaps ?? []);

  const numberOfSteps = steps.length;
  const container = propContainer || getContainer();
  const sortedQuoteTags = sortTags(props.quote.tags || []);
  const showAllRoutesButton = !!onClickAllRoutes;
  const totalTime = roundedSecondsToString(totalArrivalTime(quote?.swaps));
  const totalFee = getTotalFeeInUsd(quote?.swaps ?? [], tokens);
  const fee = numberToString(
    totalFee,
    GAS_FEE_MIN_DECIMALS,
    GAS_FEE_MAX_DECIMALS
  );

  const feeWarning = totalFee.gte(new BigNumber(GAS_FEE_MAX));

  return fullExpandedMode ? (
    <FullExpandedQuote
      selected={selected}
      fee={fee}
      time={totalTime}
      tooltipContainer={getExpanded()}
      steps={steps}
      tags={sortedQuoteTags}
      feeWarning={feeWarning}
      percentageChange={percentageChange}
      warningLevel={priceImpactWarningLevel}
      outputPrice={{
        value: roundedOutput,
        usdValue: roundedOutputUsdValue,
        realValue: formatTooltipNumbers(output.value),
        realUsdValue: formatTooltipNumbers(output.usdValue),
      }}
    />
  ) : (
    <SummaryContainer
      selected={selected}
      listItem={type === 'list-item'}
      basic={type === 'basic'}>
      <div className={summaryStyles()}>
        {!tagHidden && sortedQuoteTags.length ? (
          <>
            <TagContainer>
              {sortedQuoteTags.map((tag, index) => {
                const key = `${tag.value}_${index}`;
                return (
                  <React.Fragment key={key}>
                    <QuoteTag label={tag.label} value={tag.value} />
                    <Divider size={4} direction="horizontal" />
                  </React.Fragment>
                );
              })}
            </TagContainer>
            <Line />
            {!showAllRoutesButton && <Divider size={4} />}
          </>
        ) : null}
        <div id="portal-root" className={summaryHeaderStyles()}>
          <QuoteCostDetails
            quote={quote}
            time={totalTime}
            fee={fee}
            feeWarning={feeWarning}
            showModalFee={showModalFee}
            steps={numberOfSteps}
          />

          {showAllRoutesButton && (
            <AllRoutesButton
              onClick={(e) => {
                e.stopPropagation();
                onClickAllRoutes();
              }}
              size="xxsmall"
              type="secondary"
              variant="default">
              <Typography color="secondary" variant="label" size="medium">
                {i18n.t('See All Routes')}
              </Typography>
            </AllRoutesButton>
          )}
        </div>
        {type === 'basic' && (
          <div className={basicInfoStyles()}>
            <FrameIcon>
              <InfoIcon size={12} color="gray" />
            </FrameIcon>
            <ContainerInfoOutput>
              <BasicInfoOutput size="small" variant="body">
                {`${roundedInput} ${steps[0].from.token.displayName} = `}
              </BasicInfoOutput>
              <Tooltip
                content={formatTooltipNumbers(output.value)}
                container={container}
                open={!output.value ? false : undefined}>
                <BasicInfoOutput size="small" variant="body">
                  &nbsp;
                  {`${roundedOutput} ${
                    steps[steps.length - 1].to.token.displayName
                  }`}
                </BasicInfoOutput>
              </Tooltip>
            </ContainerInfoOutput>
            <Tooltip
              content={formatTooltipNumbers(output.usdValue)}
              container={container}>
              <Divider size={2} direction="horizontal" />
              <Typography color="$neutral600" size="xsmall" variant="body">
                {`($${roundedOutputUsdValue})`}
              </Typography>
            </Tooltip>
          </div>
        )}
        {type === 'list-item' && (
          <TokenAmount
            tooltipContainer={container}
            type="output"
            direction="vertical"
            price={{
              value: roundedOutput,
              usdValue: roundedOutputUsdValue,
              realValue: formatTooltipNumbers(output.value),
              realUsdValue: formatTooltipNumbers(output.usdValue),
            }}
            token={{
              displayName: steps[numberOfSteps - 1].to.token.displayName,
              image: steps[numberOfSteps - 1].to.token.image,
            }}
            chain={{ image: steps[numberOfSteps - 1].to.chain.image }}
            percentageChange={percentageChange}
            warningLevel={priceImpactWarningLevel}
          />
        )}
        {type === 'swap-preview' && (
          <>
            <QuoteSummary
              from={steps[0].from}
              to={steps[numberOfSteps - 1].to}
              percentageChange={percentageChange}
              warningLevel={priceImpactWarningLevel}
            />
            <Divider size={4} />
          </>
        )}
      </div>
      <QuoteContainer
        selected={selected}
        listItem={type === 'list-item'}
        open={expanded}
        className="quote_container"
        onOpenChange={setExpanded}>
        <QuoteTrigger
          type={type}
          quoteRef={quoteRef}
          selected={selected}
          setExpanded={setExpanded}
          container={container}
          expanded={expanded}
          steps={steps}
        />
        <Content open={expanded}>
          <HorizontalSeparator />
          <div className={stepsDetailsStyles()}>
            {steps.map((step, index) => {
              const key = `item-${index}`;
              return (
                <StepDetails
                  type="quote-details"
                  key={key}
                  tooltipContainer={container}
                  step={step}
                  hasSeparator={index !== steps.length - 1}
                  state={step.state}
                />
              );
            })}
          </div>
        </Content>
      </QuoteContainer>
    </SummaryContainer>
  );
}
