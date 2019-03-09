import React, {useState, useRef} from 'react';
import {Input, Tag, Icon} from 'antd';

function TagGroup({defaultTags = [], editable = false, onChange = () => {}}) {
  const [addNew, setAddNew] = useState(false);
  const [tags, setTags] = useState(defaultTags);
  const inputRef = useRef(null);

  const handleClose = removedTag => {
    const nextTags = tags.filter(t => t !== removedTag);
    // SetTags(nextTags);
    onChange(nextTags);
  };

  const handleInputConfirm = () => {
    const inputValue = inputRef.current.input.value;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      const nextTags = [...tags, inputValue];
      setTags(nextTags);
      onChange(nextTags);
    }

    setAddNew(false);
  };

  return (
    <div>
      {tags.map((tag, _) => {
        return (
          <Tag
            key={tag}
            closable
            afterClose={() => {
              handleClose(tag);
            }}
          >
            {tag}
          </Tag>
        );
      })}
      {addNew && (
        <Input
          ref={inputRef}
          autoFocus
          size='small'
          style={{width: 78}}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      )}
      {editable && !addNew && (
        <Tag
          style={{background: '#fff', borderStyle: 'dashed'}}
          onClick={() => {
            setAddNew(true);
          }}
        >
          <Icon type='plus' /> 添加
        </Tag>
      )}
    </div>
  );
}

export default TagGroup;
