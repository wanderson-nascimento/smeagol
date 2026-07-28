import React from 'react';
import smeagolLogo from './smeagol-logo';

const Bruno = ({ width }) => {
  return (
    <img
      src={smeagolLogo}
      width={width}
      height={width}
      alt="Smeagol"
      style={{ objectFit: 'contain' }}
      draggable={false}
    />
  );
};

export default Bruno;
