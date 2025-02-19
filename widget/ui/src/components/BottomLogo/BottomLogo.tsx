import { i18n } from '@lingui/core';
import React from 'react';

import { Divider } from '../Divider';
import { Logo } from '../Logo';
import { Typography } from '../Typography';

import { Container, StyledAnchor } from './BottomLogo.styles';

export function BottomLogo() {
  return (
    <Container>
      <Typography variant="body" size="xsmall" color="$neutral700">
        {i18n.t('Powered By')}
      </Typography>
      <Divider direction="horizontal" size={8} />
      <StyledAnchor href="https://orai.io" target="_blank">
        <Logo />
        <Divider direction="horizontal" size={4} />

        <Typography variant="body" size="xsmall" color="neutral700">
          Oraichain
        </Typography>
      </StyledAnchor>
    </Container>
  );
}
