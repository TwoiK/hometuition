import React from 'react';
import { Layout, Button, Space } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;

const Header = () => {
  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  return (
    <AntHeader style={{ padding: '0 24px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
        <Space>
          <span>
            <UserOutlined /> Admin
          </span>
          <Button type="link" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;