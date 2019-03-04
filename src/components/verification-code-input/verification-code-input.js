import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {Input} from 'antd';

const InputGroup = Input.Group;

const handleFocus = e => {
  e.target.select(e);
};

export default function VerificationCodeInput({onComplete, length = 4}) {
  const [values, setValues] = useState(new Array(length).fill(''));

  const inputStyle = {
    width: `${100 / length}%`,
    textAlign: 'center'
  };

  const refs = useMemo(() => {
    return new Array(length).fill('').map(() => React.createRef());
  }, [length]);

  useEffect(() => {
    const val = values.join('');
    if (onComplete && val.length >= length) {
      onComplete(val);
    }
  }, [values, length]);

  const handleInputChange = useCallback(e => {
    if (!e.target.validity.valid) {
      return;
    }

    const index = parseInt(e.target.dataset.id, 10);
    let {value} = e.target;

    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const nextValues = [...values];
    const next = refs[index + 1];
    nextValues[index] = value;
    setValues(nextValues);

    if (next) {
      next.current.focus();
      next.current.select();
    }
  }, [values]);

  return (
    <InputGroup compact>
      {values.map((val, idx) => (
        <Input
          ref={refs[idx]}
          // eslint-disable-next-line react/no-array-index-key
          key={`verification-code-input-${idx}`}
          style={inputStyle}
          pattern='[0-9]'
          size='large'
          autoFocus={idx === 0}
          data-id={idx}
          value={val}
          onChange={handleInputChange}
          onFocus={handleFocus}
        />
      ))}
    </InputGroup>
  );
}
