import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import api from '../../services/api';
import './styles.css';

const Dashboard = () => {
    return (
        <div className="dashboard">
            {/* Overview Section */}
            <div className="overview-section">
                <h2 className="section-title">Overview</h2>
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-label">Total Students</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-label">Total Parents</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-label">Total Teachers</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications Section */}
            <div className="applications-section">
                <h2 className="section-title">Teacher Applications</h2>
                <div className="stats-container">
                    <div className="stat-card status-pending">
                        <div className="stat-content">
                            <span className="stat-label">Pending Applications</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                    <div className="stat-card status-approved">
                        <div className="stat-content">
                            <span className="stat-label">Approved Teachers</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                    <div className="stat-card status-rejected">
                        <div className="stat-content">
                            <span className="stat-label">Rejected Applications</span>
                            <span className="stat-value">0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;