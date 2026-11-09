import axiosClient from './axiosClient';

/**
 * ==========================================
 * LIBRARY INVENTORY & CIRCULATION API
 * ==========================================
 */

/**
 * Catalogs a new book asset into the institution's library inventory.
 *
 * @param {Object} bookData { title, author, isbn, totalCopies }
 * @returns {Promise<Object>} Created BookAsset response
 */
export const addBook = async (bookData) => {
  const response = await axiosClient.post('/api/v1/enterprise-ops/library/books', bookData);
  return response.data;
};

/**
 * Retrieves all cataloged book assets for the active tenant.
 *
 * @returns {Promise<Array>} List of books with total & available copy counts
 */
export const getBooks = async () => {
  const response = await axiosClient.get('/api/v1/enterprise-ops/library/books');
  return response.data;
};

/**
 * Retrieves a single book asset by its ID.
 *
 * @param {number|string} bookId
 * @returns {Promise<Object>}
 */
export const getBookById = async (bookId) => {
  const response = await axiosClient.get(`/api/v1/enterprise-ops/library/books/${bookId}`);
  return response.data;
};

/**
 * Issues a copy of a book to an enrolled student.
 *
 * @param {Object} issueData { bookId, studentId }
 * @returns {Promise<Object>} Created LibraryIssue circulation record
 */
export const issueBook = async (issueData) => {
  const response = await axiosClient.post('/api/v1/enterprise-ops/library/issues', issueData);
  return response.data;
};

/**
 * Marks an active book issue as returned and restores library available inventory.
 *
 * @param {number|string} issueId
 * @returns {Promise<Object>} Updated LibraryIssue record
 */
export const returnBook = async (issueId) => {
  const response = await axiosClient.post(`/api/v1/enterprise-ops/library/issues/${issueId}/return`);
  return response.data;
};

/**
 * Retrieves all currently active (issued/loaned) book circulation records.
 *
 * @returns {Promise<Array>} List of active issues
 */
export const getActiveIssues = async () => {
  const response = await axiosClient.get('/api/v1/enterprise-ops/library/issues/active');
  return response.data;
};

/**
 * ==========================================
 * FLEET TRANSPORT & ROUTE LOGISTICS API
 * ==========================================
 */

/**
 * Registers a new transport vehicle in the institution fleet.
 *
 * @param {Object} vehicleData { registrationNumber, capacity, driverName }
 * @returns {Promise<Object>} Created Vehicle response
 */
export const createVehicle = async (vehicleData) => {
  const response = await axiosClient.post('/api/v1/enterprise-ops/transport/vehicles', vehicleData);
  return response.data;
};

/**
 * Retrieves all fleet vehicles for the active tenant.
 *
 * @returns {Promise<Array>} List of transport vehicles
 */
export const getVehicles = async () => {
  const response = await axiosClient.get('/api/v1/enterprise-ops/transport/vehicles');
  return response.data;
};

/**
 * Defines a new transport route mapped to a vehicle with stops and monthly fee.
 *
 * @param {Object} routeData { routeName, stops, vehicleId, monthlyFee }
 * @returns {Promise<Object>} Created TransportRoute response
 */
export const createRoute = async (routeData) => {
  const response = await axiosClient.post('/api/v1/enterprise-ops/transport/routes', routeData);
  return response.data;
};

/**
 * Retrieves all transport routes with live seating occupancy KPI indicators.
 *
 * @returns {Promise<Array>} List of transport routes with capacity metrics
 */
export const getRoutes = async () => {
  const response = await axiosClient.get('/api/v1/enterprise-ops/transport/routes');
  return response.data;
};

/**
 * Assigns an enrolled student to a transport route with pickup stop.
 * Enforces vehicle capacity restrictions before assignment.
 *
 * @param {Object} assignmentData { studentId, routeId, pickupStop }
 * @returns {Promise<Object>} Created RouteAssignment response
 */
export const assignStudent = async (assignmentData) => {
  const response = await axiosClient.post('/api/v1/enterprise-ops/transport/assignments', assignmentData);
  return response.data;
};

/**
 * Retrieves all passenger assignments for a specific route.
 *
 * @param {number|string} routeId
 * @returns {Promise<Array>} List of passenger assignments
 */
export const getRouteAssignments = async (routeId) => {
  const response = await axiosClient.get(`/api/v1/enterprise-ops/transport/routes/${routeId}/assignments`);
  return response.data;
};

/**
 * Retrieves all active student route assignments across all routes.
 *
 * @returns {Promise<Array>}
 */
export const getAllAssignments = async () => {
  const response = await axiosClient.get('/api/v1/enterprise-ops/transport/assignments');
  return response.data;
};

export default {
  addBook,
  getBooks,
  getBookById,
  issueBook,
  returnBook,
  getActiveIssues,
  createVehicle,
  getVehicles,
  createRoute,
  getRoutes,
  assignStudent,
  getRouteAssignments,
  getAllAssignments,
};
