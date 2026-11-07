import axiosClient from './axiosClient';

/**
 * Academic API service layer providing multi-tenant operations for
 * Faculty, Course catalogs, and CourseOffering instructor assignments.
 */

export const createFaculty = async (facultyData) => {
  const response = await axiosClient.post('/api/v1/academic/faculty', facultyData);
  return response.data;
};

export const getFaculty = async () => {
  const response = await axiosClient.get('/api/v1/academic/faculty');
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await axiosClient.post('/api/v1/academic/courses', courseData);
  return response.data;
};

export const getCourses = async () => {
  const response = await axiosClient.get('/api/v1/academic/courses');
  return response.data;
};

export const assignCourseOffering = async (offeringData) => {
  const response = await axiosClient.post('/api/v1/academic/offerings', offeringData);
  return response.data;
};

export const getCourseOfferings = async () => {
  const response = await axiosClient.get('/api/v1/academic/offerings');
  return response.data;
};

const academicService = {
  createFaculty,
  getFaculty,
  createCourse,
  getCourses,
  assignCourseOffering,
  getCourseOfferings,
};

export default academicService;
