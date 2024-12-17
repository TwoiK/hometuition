import React, { useState, useEffect } from 'react';
import { 
    Table, Tag, Button, Space, Modal, message, Tooltip, Tabs, Card, 
    Form, Input, Select, Row, Col, Statistic 
} from 'antd';
import { 
    EyeOutlined, FilePdfOutlined, CheckOutlined, CloseOutlined,
    PlusOutlined, BookOutlined, UserOutlined, DeleteOutlined,
    EditOutlined 
} from '@ant-design/icons';
import apiService from '../../services/api';
import './styles.css';

const { TabPane } = Tabs;

const TeacherList = () => {
    // State management
    const [activeTab, setActiveTab] = useState('applications');
    const [teachers, setTeachers] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState({
        addVacancy: false,
        editVacancy: false,
        viewTeacher: false,
        selectedTeacher: null,
        selectedVacancy: null,
    });
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [form] = Form.useForm();

    // Data fetching
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [teachersData, vacanciesData] = await Promise.all([
                apiService.getAllTeachers(),
                apiService.getAllVacancies()
            ]);
            setTeachers(teachersData);
            setVacancies(vacanciesData);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Modal handlers
    const toggleModal = (modalType, data = null) => {
        setModalState(prev => ({
            ...prev,
            [modalType]: !prev[modalType],
            selectedTeacher: modalType === 'viewTeacher' ? data : prev.selectedTeacher,
            selectedVacancy: modalType === 'editVacancy' ? data : prev.selectedVacancy,
        }));
        if (!data) form.resetFields();
    };

    // Vacancy handlers
    const handleVacancySubmit = async (values) => {
        try {
            if (modalState.selectedVacancy) {
                await apiService.updateVacancy(modalState.selectedVacancy.id, values);
                message.success('Vacancy updated successfully');
            } else {
                await apiService.createVacancy(values);
                message.success('Vacancy added successfully');
            }
            toggleModal(modalState.selectedVacancy ? 'editVacancy' : 'addVacancy');
            fetchData();
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleDeleteVacancy = async (id) => {
        try {
            await apiService.deleteVacancy(id);
            message.success('Vacancy deleted successfully');
            fetchData();
        } catch (error) {
            message.error('Failed to delete vacancy');
        }
    };

    // Teacher handlers
    const handleStatusUpdate = async (teacherId, newStatus) => {
        try {
            await apiService.updateTeacherStatus(teacherId, newStatus);
            message.success(`Teacher ${newStatus} successfully`);
            fetchData();
        } catch (error) {
            message.error('Failed to update status');
        }
    };

    const handleViewTeacher = (teacher) => {
        setSelectedTeacher(teacher);
        setViewModalVisible(true);
    };

    // Helper function
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'orange';
            case 'approved':
                return 'green';
            case 'rejected':
                return 'red';
            default:
                return 'gray';
        }
    };
    

    // Update the CV button click handler
const handleViewCV = async (teacherId) => {
    try {
        const cvData = await apiService.getTeacherCV(teacherId);
        window.open(cvData.url, '_blank');
    } catch (error) {
        message.error('Failed to fetch CV');
    }
};



    // Column definitions
    const teacherColumns = [
        {
            title: 'Name',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: (a, b) => a.fullName.localeCompare(b.fullName)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone'
        },
        {
            title: 'Subjects',
            dataIndex: 'subjects',
            key: 'subjects',
            render: (subjects) => (
                <>
                    {subjects.map(subject => (
                        <Tag key={subject} color="blue">
                            {subject}
                        </Tag>
                    ))}
                </>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            ),
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Approved', value: 'approved' },
                { text: 'Rejected', value: 'rejected' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => handleViewTeacher(record)}
                        />
                    </Tooltip>
                    <Tooltip title="View CV">
                        <Button 
                            icon={<FilePdfOutlined />}
                            onClick={() => window.open(record.cv, '_blank')}
                        />
                    </Tooltip>
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="Approve">
                                <Button 
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleStatusUpdate(record._id, 'approved')}
                                />
                            </Tooltip>
                            <Tooltip title="Reject">
                                <Button 
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={() => handleStatusUpdate(record._id, 'rejected')}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            )
        }
    ];

    const vacancyColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            render: (subject) => (
                <Tag color="blue">{subject}</Tag>
            )
        },
        {
            title: 'Requirements',
            dataIndex: 'requirements',
            key: 'requirements',
            ellipsis: true,
        },
        {
            title: 'Applied',
            dataIndex: 'appliedTeachers',
            key: 'appliedTeachers',
            width: 100,
            render: (teachers) => (
                <Button type="link">
                    {teachers?.length || 0} teachers
                </Button>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button 
                            icon={<EditOutlined />} 
                            onClick={() => toggleModal('editVacancy', record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button 
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteVacancy(record.id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    // Render methods
    const renderVacancyForm = () => (
        <Form
            form={form}
            onFinish={handleVacancySubmit}
            layout="vertical"
            initialValues={modalState.selectedVacancy}
        >
            <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true }]}
            >
                <Select>
                    <Select.Option value="mathematics">Mathematics</Select.Option>
                    <Select.Option value="physics">Physics</Select.Option>
                    <Select.Option value="chemistry">Chemistry</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item
                name="requirements"
                label="Requirements"
                rules={[{ required: true }]}
            >
                <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {modalState.selectedVacancy ? 'Update' : 'Add'} Vacancy
                    </Button>
                    <Button onClick={() => toggleModal(modalState.selectedVacancy ? 'editVacancy' : 'addVacancy')}>
                        Cancel
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );

    


    return (
        <div className="teacher-list">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane 
                    tab={<span><UserOutlined />Applications</span>} 
                    key="applications"
                >
                    <Card className="stats-card">
                        <Row gutter={[24, 24]} className="stats-row">
                            <Col xs={24} sm={8}>
                                <Statistic 
                                    title="Total Applications" 
                                    value={teachers.length} 
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Statistic 
                                    title="Pending" 
                                    value={teachers.filter(t => t.status === 'pending').length}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Statistic 
                                    title="Approved" 
                                    value={teachers.filter(t => t.status === 'approved').length}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                        </Row>
                    </Card>
                    
                    <Table 
                        columns={teacherColumns} 
                        dataSource={teachers}
                        loading={loading}
                        rowKey="_id"
                        className="main-table"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total, range) => 
                                `${range[0]}-${range[1]} of ${total} items`
                        }}
                    />
                </TabPane>
                
                <TabPane 
                    tab={<span><BookOutlined />Vacancies</span>} 
                    key="vacancies"
                >
                    <div className="vacancy-section">
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => toggleModal('addVacancy')}
                            className="action-button"
                            size="large"
                        >
                            Add Vacancy
                        </Button>
                        
                        <Table 
                            columns={vacancyColumns} 
                            dataSource={vacancies}
                            loading={loading}
                            rowKey="id"
                            className="main-table"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total, range) => 
                                    `${range[0]}-${range[1]} of ${total} items`
                            }}
                        />
                    </div>
                </TabPane>
            </Tabs>

            

            {/* Modals */}
            <Modal
                title={modalState.selectedVacancy ? "Edit Vacancy" : "Add New Vacancy"}
                visible={modalState.addVacancy || modalState.editVacancy}
                onCancel={() => toggleModal(modalState.selectedVacancy ? 'editVacancy' : 'addVacancy')}
                footer={null}
            >
                {renderVacancyForm()}
            </Modal>

            {/* Teacher Details Modal */}
            <Modal
                title="Teacher Details"
                visible={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedTeacher && (
                    <div className="teacher-details">
                        <h2>{selectedTeacher.fullName}</h2>
                        <div className="detail-row">
                            <strong>Email:</strong> {selectedTeacher.email}
                        </div>
                        <div className="detail-row">
                            <strong>Phone:</strong> {selectedTeacher.phone}
                        </div>
                        <div className="detail-row">
                            <strong>Subjects:</strong>
                            {selectedTeacher.subjects.map(subject => (
                                <Tag key={subject} color="blue">{subject}</Tag>
                            ))}
                        </div>
                        <div className="detail-row">
                            <strong>Status:</strong>
                            <Tag color={getStatusColor(selectedTeacher.status)}>
                                {selectedTeacher.status.toUpperCase()}
                            </Tag>
                        </div>
                        <div className="detail-row">
                            <strong>Documents:</strong>
                            <Button 
                                icon={<FilePdfOutlined />}
                                onClick={() => window.open(selectedTeacher.cv, '_blank')}
                            >
                                View CV
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TeacherList;