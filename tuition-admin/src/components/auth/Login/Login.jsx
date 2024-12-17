import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './styles.css';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // In your Login component
const onFinish = async (values) => {
    try {
        console.log('Form values:', values);
        setLoading(true);
        const success = await login(values);
        console.log('Login success:', success);
        console.log('Token after login:', localStorage.getItem('adminToken'));
        if (success) {
            message.success('Welcome back, Admin!');
            navigate('/');
        }
    } catch (error) {
        console.error('Login error:', error);
        message.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="login-container">
            <Card className="login-card">
                <div className="login-header">
                    <h1>Admin Portal</h1>
                    <p>Please login to continue</p>
                </div>
                
                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: 'Please input your username!' },
                           
                        ]}
                    >
                        <Input 
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="Username"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;