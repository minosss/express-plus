import React, {useState, useRef} from 'react';
import {Tag, Input} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

interface TagListProps {
	value: any[];
	editable: boolean;
	onChange: (tags: any[]) => void;
}

export default function TagList({
	value = [],
	editable = false,
	onChange = () => {},
}: TagListProps) {
	const [addNew, setAddNew] = useState(false);
	const inputRef = useRef<Input>(null);

	const handleClose = (removedTag: any) => {
		const nextTags = value.filter((t) => t !== removedTag);
		onChange(nextTags);
	};

	const handleInputConfirm = () => {
		const inputValue = inputRef.current!.input.value;
		if (inputValue && value.indexOf(inputValue) === -1) {
			const nextTags = [...value, inputValue];
			onChange(nextTags);
		}

		setAddNew(false);
	};

	return (
		<div>
			{value.map((tag, _) => {
				return (
					<Tag
						key={tag}
						closable
						onClose={() => {
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
					<PlusOutlined /> 添加
				</Tag>
			)}
		</div>
	);
}
