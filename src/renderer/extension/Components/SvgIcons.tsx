import {ReactElement} from 'react';

import {SvgProps} from '../../src/assets/icons/SvgIconsContainer';

export function Python_Icon(props: SvgProps): ReactElement {
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

export function WarnIcon(props: SvgProps): ReactElement {
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
