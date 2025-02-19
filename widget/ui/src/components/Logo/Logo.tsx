import type { SvgIconProps } from '../SvgIcon';

import React from 'react';

import { SvgWithColor } from '../SvgIcon/SvgIcon.style';

export function Logo(props: SvgIconProps) {
  const { size = '30', color } = props;
  const commonProps = {
    width: size,
    height: size,
    color: color,
    className: '_icon',
  };
  return (
    <SvgWithColor
      {...commonProps}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="c-lekKBq">
      <g clipPath="url(#clip0_612_3553)">
        <path
          d="M41.4149 42.7043L44.5836 52.0632H37.4355L40.7885 42.7043H41.4149ZM58.5114 57.0743H53.2793V58.9166H66.1754V57.0743H61.0169V42.3359H66.1754V40.4936H53.2793V42.3359H58.5114V57.0743ZM34.9668 58.9166L36.7354 53.9792H45.2468L46.9049 58.9166H49.6315L42.9992 40.4936H39.2409L32.4981 58.9166H34.9668ZM76.4554 76.4553H23.5446V23.5444H76.4554V76.4553Z"
          fill="black"
        />
        <path
          d="M55.1584 99.9998C78.7768 97.5679 97.5684 78.7765 100 55.1582H93.7732C91.5624 75.6446 76.0502 91.9673 55.1584 94.2886V99.9998Z"
          fill="black"
        />
        <path
          d="M0 55.1582C2.43184 78.7765 21.2233 97.5679 44.8416 99.9998V94.2886C23.9499 91.9673 8.47458 75.6077 6.22697 55.1582H0Z"
          fill="black"
        />
        <path
          d="M100 44.8416C97.5684 21.2233 78.7768 2.43183 55.1584 0V5.71113C76.0502 8.03242 91.5256 24.392 93.7732 44.8416H100Z"
          fill="black"
        />
        <path
          d="M44.8415 0C21.2233 2.43183 2.43183 21.2233 0 44.8415H6.22697C8.43773 24.3552 23.9499 8.03242 44.8415 5.71113V0Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_612_3553">
          <rect width="100" height="100" fill="white" />
        </clipPath>
      </defs>
    </SvgWithColor>
  );
}
