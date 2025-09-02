// Mock API client for testing
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

export const apiClient = mockApiClient;

export default mockApiClient;