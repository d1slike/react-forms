import React from 'react';
import {Form, Input, Select} from 'antd';
import {observer} from 'mobx-react';

export const FormField = observer(
    ({
        bind, label, required, type = 'text', wrapperProps = {}, extra, error, ...rest
    }) => {
        const Component = type === 'textarea' ? Input.TextArea : Input;
        return (
            <Form.Item
                label={label}
                required={required}
                validateStatus={error ? 'error' : undefined}
                help={error || undefined}
                extra={extra}
                {...wrapperProps}
            >
                <Component {...bind} {...rest} type={type} />
            </Form.Item>
        );
    },
);

export const FormSelect = observer(
    ({
        bind, error, label, required, type = 'text', wrapperProps = {}, extra, options = [], ...rest
    }) => (
        <Form.Item
            label={label}
            required={required}
            validateStatus={error ? 'error' : undefined}
            help={error || undefined}
            extra={extra}
            {...wrapperProps}
        >
            <Select {...bind} {...rest} type={type}>
                {options.map(({value, label: oLabel}) => (
                    <Select.Option key={value} value={value}>
                        {oLabel}
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>
    ),
);
