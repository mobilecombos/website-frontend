import { useId } from 'react';

import SearchIcon from 'mdi-react/SearchIcon';

import Colors from '@data/colors.json';
import clsx from 'clsx';

interface IProps extends Omit<React.HTMLAttributes<HTMLInputElement>, 'onInput'> {
  /**
   * The type associated with the input element in the outputted HTML.
   */
  type?: 'text' | 'email' | 'password' | 'search';
  /**
   * Class for the outer-most element of the component (`<label>`).
   */
  className?: string;
  /**
   * The default value used to populate the input field.
   */
  value?: string;
  /**
   * A textual label to display on-screen.
   */
  label: string;
  /**
   * An optional label to override the standard label, read only to screenreaders.
   */
  screenReaderLabel?: string;
  /**
   * Callback triggered when text is inputted to the text input.
   */
  onInput: (val: string) => void;
  /**
   * Optional input placeholder.
   */
  placeholder?: string;
  /**
   * Optional helper text which appears under the textbox. Correctly linked via `aria-describedby`.
   */
  helpText?: React.ReactChild;
  /**
   * An optional element to display at the start of the input field.
   *
   * If used to show units, for example, you should set an appropriate `screenReaderLabel` as these adornments are hidden to screenreaders.
   */
  startAdornment?: React.ReactChild;
  /**
   * An optional element to display at the end of the input field.
   *
   * If used to show units, for example, you should set an appropriate `screenReaderLabel` as these adornments are hidden to screenreaders.
   */
  endAdornment?: React.ReactChild;
  /**
   * RegEx pattern for validation
   */
  pattern?: string;
  disabled?: boolean;
}

export default function TextBox({
  label,
  screenReaderLabel,
  onInput,
  type = 'text',
  className,
  value = '',
  placeholder,
  helpText,
  startAdornment: startAppendix,
  endAdornment: endAppendix,
  disabled = false,
  ...attrs
}: IProps) {
  const rootId = useId();
  const id = `textbox-${rootId}`;
  const helpTextId = `textbox-help-${rootId}`;

  return (
    <label
      htmlFor={id}
      className={clsx('textbox', className)}
      aria-label={screenReaderLabel}
      css={{
        '& > span': {
          display: 'block',
        },
      }}
    >
      <span className={clsx('textbox-label', 'text-speak-up')}>{label}</span>

      <div
        className="textbox-wrapper"
        css={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 8,
          position: 'relative',
          background: 'white',
          height: 40,

          border: '2px solid black',

          '&:focus-within': {
            borderColor: Colors.primaryRed,
          },
        }}
      >
        {startAppendix && (
          <span
            aria-hidden="true"
            className="textbox-startAppendix"
            css={{
              paddingLeft: 8,
            }}
          >
            {startAppendix}
          </span>
        )}
        {type === 'search' && (
          <SearchIcon
            role="presentation"
            className="textbox-searchIcon"
            css={{
              marginLeft: 8,
            }}
          />
        )}
        <input
          type={type}
          id={id}
          disabled={disabled}
          className="textbox-input"
          onInput={(e) => {
            const v = (e.target as HTMLInputElement).value;
            onInput(v);
          }}
          value={value}
          placeholder={placeholder}
          aria-describedby={helpText ? helpTextId : undefined}
          css={{
            padding: '6px 8px',
            border: 'none',
            font: 'inherit',
            width: '100%',

            '&:focus': {
              outline: 'none',
            },

            '&::-webkit-search-cancel-button': {
              WebkitAppearance: 'none',
              height: 24,
              width: 24,
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23777'><path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/></svg>")`,
              cursor: 'pointer',
            },
          }}
          {...attrs}
        />
        {endAppendix && (
          <span aria-hidden="true" className="textbox-endAppendix">
            {endAppendix}
          </span>
        )}
      </div>

      {helpText && (
        <p
          id={helpTextId}
          className={clsx('textbox-helptext', 'text-whisper')}
          css={{
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          {helpText}
        </p>
      )}
    </label>
  );
}
