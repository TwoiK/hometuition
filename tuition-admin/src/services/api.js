import axios from 'axios';
import ErrorHandler from '../utils/handlers/errorHandler';



const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return ErrorHandler.handle(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Connection timeout. Please check if your server is running at http://localhost:5000');
        } else if (!error.response) {
            console.error('Network error. Please check your server connection');
        }
        return ErrorHandler.handle(error);
    }
);



const apiService = {
    // Dashboard Statistics
    getDashboardStats: async () => {
        try {
            const [students, parents, teachers] = await Promise.all([
                api.get('/student-apply/all'),
                api.get('/parent-apply/all'),
                api.get('/teacher-apply/all')
            ]);

            return {
                students: students.data.length,
                parents: parents.data.length,
                teachers: {
                    total: teachers.data.length,
                    pending: teachers.data.filter(t => t.status === 'pending').length,
                    approved: teachers.data.filter(t => t.status === 'approved').length,
                    rejected: teachers.data.filter(t => t.status === 'rejected').length
                }
            };
        } catch (error) {
            throw error;
        }
    },

    // Teachers
    getAllTeachers: async () => {
        const response = await api.get('/teacher-apply/all');
        return response.data;
    },

    getTeacherCV: async (teacherId) => {
        const response = await api.get(`/teacher-apply/${teacherId}/cv`);
        return response.data;
    },

    updateTeacherStatus: async (teacherId, status) => {
        const response = await api.put(`/teacher-apply/${teacherId}/status`, { status });
        return response.data;
    },

    // Students
    getAllStudents: async () => {
        try {
            const response = await api.get('/student-apply/all');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteStudent: async (id) => {
        try {
            const response = await api.delete(`/student-apply/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Parents
    getAllParents: async () => {
        const response = await api.get('/parent-apply/all');
        return response.data;
    },

    deleteParent: async (id) => {
        const response = await api.delete(`/parent-apply/delete/${id}`);
        return response.data;
    },

    // Auth
    login: async (credentials) => {
        try {
            console.log('Attempting login to http://localhost:5000/api/admin/login');
            const response = await api.post('/admin/login', credentials);
            
            if (response.token) {
                localStorage.setItem('adminToken', response.token);
            }
            
            return response;
        } catch (error) {
            console.error('Login failed:', error.message);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
    },


    // Vacancies

    getAllVacancies: async () => {
        const response = await api.get('/vacancies');
        return response.data;
    },

    createVacancy: async (vacancyData) => {
        const response = await api.post('/vacancies', vacancyData);
        return response.data;
    },

    updateVacancy: async (id, data) => {
        const response = await api.put(`/vacancies/${id}`, data);
        return response.data;
    },

    deleteVacancy: async (id) => {
        const response = await api.delete(`/vacancies/${id}`);
        return response.data;
    }


};





export default apiService;