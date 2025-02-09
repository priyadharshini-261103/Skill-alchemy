import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000', // Your backend URL
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

export const getRecommendations = (userId, type) => {
    if (!userId || !type) {
        console.error(`userId and type must be provided for recommendation: ${userId} and ${type}`);
        return Promise.reject(new Error('Invalid userId or type'));
    }
    return API.get(`/recommend/${type}/${userId}`);
};

export const getCourses = () => API.get('/course/courses');

export const enrollCourse = (userId, courseId) => {
    if (!userId || !courseId) {
        console.error('userId and courseId must be provided to enroll in a course');
        return Promise.reject(new Error('Invalid userId or courseId'));
    }
    return API.post('/api/enroll', { userId, courseId });
};

export const getEnrolledCourses = (userId) => {
    if (!userId) {
        console.error('userId must be provided to get enrolled courses');
        return Promise.reject(new Error('Invalid userId'));
    }
    return API.get(`/api/enrolled_courses?userId=${userId}`);
};

export const getUserDetailsWithComprehensiveAnalysis = (userId) => {
    if (!userId) {
        console.error('userId must be provided to get user details with comprehensive analysis');
        return Promise.reject(new Error('Invalid userId'));
    }
    return API.get(`/api/user_details_with_comprehensive_analysis?userId=${userId}`);
};

export const getCourseDetails = async (courseId, userId) => {
    try {
        const response = await API.get(`/course/getCourseDetails?courseId=${courseId}&userId=${userId}`);
        // console.log(response);
        return response;
    } catch (error) {
        throw error;
    }
};
