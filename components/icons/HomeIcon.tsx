/* eslint-disable react/no-unknown-property */

import React from 'react';

interface Props {
  fillColor?: string;
  isActive: boolean;
}

function HomeIcon({ fillColor = 'black', isActive }: Props) {
  return isActive ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17" fill="none">
      <path
        d="M0.666748 8.83334L8.41091 1.08917C8.56719 0.932947 8.77911 0.845184 9.00008 0.845184C9.22105 0.845184 9.43297 0.932947 9.58925 1.08917L17.3334 8.83334H15.6667V15.5C15.6667 15.721 15.579 15.933 15.4227 16.0893C15.2664 16.2455 15.0544 16.3333 14.8334 16.3333H10.6667V10.5H7.33341V16.3333H3.16675C2.94573 16.3333 2.73377 16.2455 2.57749 16.0893C2.42121 15.933 2.33341 15.721 2.33341 15.5V8.83334H0.666748Z"
        fill="black"
      />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17" fill="none">
      <path
        d="M8.99991 0.621246L8.55054 1.05062L0.425537 9.17562L1.32491 10.075L2.12491 9.27312V16.5H7.74991V10.25H10.2499V16.5H15.8749V9.27312L16.6755 10.0744L17.5743 9.17562L9.44929 1.05062L8.99991 0.621246ZM8.99991 2.39875L14.6249 8.02375V15.25H11.4999V9H6.49991V15.25H3.37491V8.02312L8.99991 2.39875Z"
        fill={fillColor}
      />
    </svg>
  );
}

export default HomeIcon;
