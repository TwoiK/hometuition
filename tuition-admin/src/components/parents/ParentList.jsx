import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Modal } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const ParentList = () => {
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedParent, setSelectedParent] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/parents');
            const data = await response.json();
            setParents(data.data);
        } catch (error) {
            message.error('Failed to fetch parents');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/parents/${id}`, {
                method: 'DELETE'
            });
            message.success('Parent application deleted successfully');
            fetchParents();
        } catch (error) {
            message.error('Failed to delete parent application');
        }
    };

    const columns = [
        {
            title: 'Parent Name',
            dataIndex: 'parentName',
            key: 'parentName',
            sorter: (a, b) => a.parentName.localeCompare(b.parentName)
        },
        {
            title: 'Student Name',
            dataIndex: 'studentName',
            key: 'studentName'
        },
        {
            title: 'Relationship',
            dataIndex: 'relationship',
            key: 'relationship'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => {
                            setSelectedParent(record);
                            setViewModalVisible(true);
                        }}
                    />
                    <Button 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(record._id)}
                    />
                </Space>
            )
        }
    ];

    return (
        <div className="parent-list">
            <h2>Parent Applications</h2>
            <Table 
                columns={columns} 
                dataSource={parents}
                loading={loading}
                rowKey="_id"
            />

            <Modal
                title="Parent Details"
                visible={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={null}
            >
                {selectedParent && (
                    <div>
                        <p><strong>Parent Name:</strong> {selectedParent.parentName}</p>
                        <p><strong>Student Name:</strong> {selectedParent.studentName}</p>
                        <p><strong>Relationship:</strong> {selectedParent.relationship}</p>
                        <p><strong>Email:</strong> {selectedParent.email}</p>
                        <p><strong>Phone:</strong> {selectedParent.phone}</p>
                        <p><strong>Address:</strong> {selectedParent.address}</p>
                        <p><strong>Grade:</strong> {selectedParent.grade}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ParentList;