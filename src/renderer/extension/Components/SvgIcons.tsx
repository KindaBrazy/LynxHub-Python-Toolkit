import {ReactElement} from 'react';

import {SvgProps} from '../../src/assets/icons/SvgIconsContainer';

export function Python_Color_Icon(props: SvgProps): ReactElement {
  return (
    <svg {...props} width="256" height="255" viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" fill="none" height="255" />
      <defs>
        <linearGradient x1="12.959%" x2="79.639%" y1="12.039%" y2="78.201%" id="logosPython0">
          <stop offset="0%" stopColor="#387eb8" />
          <stop offset="100%" stopColor="#366994" />
        </linearGradient>
        <linearGradient x1="19.128%" x2="90.742%" y1="20.579%" y2="88.429%" id="logosPython1">
          <stop offset="0%" stopColor="#ffe052" />
          <stop offset="100%" stopColor="#ffc331" />
        </linearGradient>
      </defs>
      <path
        d={
          'M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.1' +
          '45 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.6' +
          '32-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072M92.802 19.66a11.' +
          '12 11.12 0 0 1 11.13 11.13a11.12 11.12 0 0 1-11.13 11.13a11.12 11.12 0 0 1-11.13-11.13a1' +
          '1.12 11.12 0 0 1 11.13-11.13'
        }
        fill="url(#logosPython0)"
      />
      <path
        d={
          'M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s' +
          '41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21' +
          '-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897m34.11' +
          '4-19.586a11.12 11.12 0 0 1-11.13-11.13a11.12 11.12 0 0 1 11.13-11.131a11.12 11.12 0 0 1 ' +
          '11.13 11.13a11.12 11.12 0 0 1-11.13 11.13'
        }
        fill="url(#logosPython1)"
      />
    </svg>
  );
}

export function Warn_Icon(props: SvgProps): ReactElement {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d={
          'M3 10.417c0-3.198 0-4.797.378-5.335c.377-.537 1.88-1.052 4.887-2.081l.573-.196C10.40' +
          '5 2.268 11.188 2 12 2s1.595.268 3.162.805l.573.196c3.007 1.029 4.51 1.544 4.887 2.08' +
          '1C21 5.62 21 7.22 21 10.417v1.574c0 5.638-4.239 8.375-6.899 9.536C13.38 21.842 13.02' +
          ' 22 12 22s-1.38-.158-2.101-.473C7.239 20.365 3 17.63 3 11.991z'
        }
        opacity="0.5"
        fill="currentColor"
      />
      <path
        fill="currentColor"
        d="M12 7.25a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75M12 16a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
      />
    </svg>
  );
}

export function Python_Icon(props: SvgProps): ReactElement {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="none" />
      <g fill="none">
        <g fill="currentColor" clipPath="url(#akarIconsPythonFill0)">
          <path
            d={
              'M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969s3.' +
              '403 5.96 3.403 5.96h2.03v-2.867s-.109-3.42 3.35-3.42h5.766s3.24.052 3.24-3.148V3.2' +
              '02S18.28 0 11.913 0M8.708 1.85c.578 0 1.046.47 1.046 1.052c0 .581-.468 1.051-1.046 1.0' +
              '51s-1.046-.47-1.046-1.051c0-.582.467-1.052 1.046-1.052'
            }
          />
          <path
            d={
              'M12.087 24c6.092 0 5.712-2.656 5.712-2.656l-.007-2.752h-5.814v-.826h8.123s3.9.445 3.9' +
              '-5.735s-3.404-5.96-3.404-5.96h-2.03v2.867s.109 3.42-3.35 3.42H9.452s-3.24-.052-3.24 3.' +
              '148v5.292S5.72 24 12.087 24m3.206-1.85c-.579 0-1.046-.47-1.046-1.052c0-.581.467-1.051 1' +
              '.046-1.051c.578 0 1.046.47 1.046 1.051c0 .582-.468 1.052-1.046 1.052'
            }
          />
        </g>
        <defs>
          <clipPath id="akarIconsPythonFill0">
            <path fill="#fff" d="M0 0h24v24H0z" />
          </clipPath>
        </defs>
      </g>
    </svg>
  );
}

export function Packages_Icon(props: SvgProps): ReactElement {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="none" />
      <path
        d={
          'm17.578 4.432l-2-1.05C13.822 2.461 12.944 2 12 2s-1.822.46-3.578 1.382l-.321.169l8.' +
          '923 5.099l4.016-2.01c-.646-.732-1.688-1.279-3.462-2.21m4.17 3.534l-3.998 2V13a.75.7' +
          '5 0 0 1-1.5 0v-2.286l-3.5 1.75v9.44c.718-.179 1.535-.607 2.828-1.286l2-1.05c2.151-1' +
          '.129 3.227-1.693 3.825-2.708c.597-1.014.597-2.277.597-4.8v-.117c0-1.893 0-3.076-.252' +
          '-3.978M11.25 21.904v-9.44l-8.998-4.5C2 8.866 2 10.05 2 11.941v.117c0 2.525 0 3.788.5' +
          '97 4.802c.598 1.015 1.674 1.58 3.825 2.709l2 1.049c1.293.679 2.11 1.107 2.828 1.286M' +
          '2.96 6.641l9.04 4.52l3.411-1.705l-8.886-5.078l-.103.054c-1.773.93-2.816 1.477-3.462 2.21'
        }
        fill="currentColor"
      />
    </svg>
  );
}

export function Env_Icon(props: SvgProps): ReactElement {
  return (
    <svg {...props} width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient
          y1="-202.91"
          y2="-202.84"
          x1="-133.268"
          x2="-133.198"
          id="vscodeIconsFileTypePyenv0"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(189.38 0 0 189.81 25243.061 38519.17)">
          <stop offset="0" stopColor="#6f6f6f" />
          <stop offset="1" stopColor="#5e5e5e" />
        </linearGradient>
        <linearGradient
          x1="-133.575"
          x2="-133.495"
          y1="-203.203"
          y2="-203.133"
          id="vscodeIconsFileTypePyenv1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(189.38 0 0 189.81 25309.061 38583.42)">
          <stop offset="0" stopColor="#dadada" />
          <stop offset="1" stopColor="#c5c5c5" />
        </linearGradient>
      </defs>
      <path
        d={
          'M15.885 2.1c-7.1 0-6.651 3.07-6.651 3.07v3.19h6.752v1H6.545S2 8.8 2 16.005s4.013 6.912 ' +
          '4.013 6.912H8.33v-3.361s-.13-4.013 3.9-4.013h6.762s3.772.06 3.772-3.652V5.8s.572-3.712' +
          '-6.842-3.712Zm-3.732 2.137a1.214 1.214 0 1 1-1.183 1.244v-.02a1.214 1.214 0 0 1 1.214-' +
          '1.214Z'
        }
        fill="url(#vscodeIconsFileTypePyenv0)"
      />
      <path
        d={
          'M16.085 29.91c7.1 0 6.651-3.08 6.651-3.08v-3.18h-6.751v-1h9.47S30 23.158 30 15.995s' +
          '-4.013-6.912-4.013-6.912H23.64V12.4s.13 4.013-3.9 4.013h-6.765S9.2 16.356 9.2 20.068' +
          'V26.2s-.572 3.712 6.842 3.712h.04Zm3.732-2.147A1.214 1.214 0 1 1 21 26.519v.03a1.21' +
          '4 1.214 0 0 1-1.214 1.214z'
        }
        fill="url(#vscodeIconsFileTypePyenv1)"
      />
    </svg>
  );
}
