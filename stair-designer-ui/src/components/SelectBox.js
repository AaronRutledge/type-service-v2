import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select } from 'antd';
import {formItemLayout } from '../Util/styles';

const SelectBox = (props) => {
    const { value, options, label, stateKey, callBack, disabledItems, style } = props;
    const items = options.map(option => <Select.Option value={option.key} key={option.key} disabled={disabledItems.includes(option.key)}>{option.label}</Select.Option>);
    

    return (
        <Form.Item label={label}  {...style} >
            <Select
                value={value}
                style={{ width: 200 }}
                onChange={(value) => callBack(stateKey, value)}
                key={stateKey}>
                {items}
            </Select>
        </Form.Item >
    )
};

SelectBox.defaultProps = {
    disabledItems: [],
    style: {...formItemLayout}
}

SelectBox.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    options: PropTypes.array,
    label: PropTypes.string,
    stateKey: PropTypes.string,
    callBack: PropTypes.func,
    disabledItems: PropTypes.array
}

export default SelectBox;