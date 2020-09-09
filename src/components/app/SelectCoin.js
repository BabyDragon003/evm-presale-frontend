import * as React from 'react';
import PropTypes from 'prop-types';
import SelectUnstyled, { selectUnstyledClasses } from '@mui/base/SelectUnstyled';
import OptionUnstyled from '@mui/base/OptionUnstyled';
import { styled } from '@mui/system';
import { PopperUnstyled } from '@mui/base';

const StyledButton = styled('button')(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  z-index: 99;

  &.${selectUnstyledClasses.expanded} {
    &::after {
      content: '▴';
    }
  }

  &::after {
    content: '▾';
    float: right;
  }`,
);

const StyledListbox = styled('ul')(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-size: 1rem;
  box-sizing: border-box;
  padding: 5px;
  margin: 0px 0;
  background: white;
  border-radius: 0.75em;
  overflow: auto;
  outline: 0px;
  `,
);

const StyledOption = styled(OptionUnstyled)(
  ({ theme }) => `
  background: transparent;
  list-style: none;
  padding: 8px;
  border-radius: 0.45em;
  cursor: default;
  display: flex;
  flex-direction: row;
  align-items: center;
  &:hover {
    background: #B2B7B6;
  }
  &:last-of-type {
    border-bottom: none;
  }
  & img {
    margin-right: 10px;
  }`,
);

const StyledPopper = styled(PopperUnstyled)`
  z-index: 1;
`;

const CustomSelect = React.forwardRef(function CustomSelect(props, ref) {
  const components = {
    Root: StyledButton,
    Listbox: StyledListbox,
    Popper: StyledPopper,
    ...props.components,
  };

  return <SelectUnstyled {...props} ref={ref} components={components} />;
});

CustomSelect.propTypes = {
  /**
   * The components used for each slot inside the Select.
   * Either a string to use a HTML element or a component.
   * @default {}
   */
  components: PropTypes.shape({
    Listbox: PropTypes.elementType,
    Popper: PropTypes.func,
    Root: PropTypes.elementType,
  }),
};

const def_coins = [
  { code: 0, label: 'BNB' },
  { code: 1, label: 'BUSD' }
];

export default function UnstyledSelectRichOptions({ value, coins = def_coins, onChange, disabled }) {
  return (
    <CustomSelect defaultValue={0} value={value} onChange={onChange} disabled={disabled}>
      {coins.map((c) => (
        <StyledOption key={c.code} value={c.code}>
          <img
            loading="lazy"
            width="25"
            src={`/images/icons/${c.label.toLowerCase()}.png`}
            alt={`${c.label}`}
          />
          <span className='text-[16px] app-brown'>{c.label}</span>
        </StyledOption>
      ))}
    </CustomSelect>
  );
}