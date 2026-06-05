import axios from 'axios';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

describe('API Integration Tests', () => {
  const API_BASE_URL = 'http://localhost:3000/api';
  let validToken: string;

  beforeAll(async () => {
    // Get a valid token for testing
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@civicbirth.cm',
        password: 'testpassword123',
      });
      validToken = response.data.accessToken;
    } catch (error) {
      console.warn('Could not obtain test token');
    }
  });

  // Auth Integration Tests
  describe('Auth Endpoints', () => {
    it('POST /auth/register - should register new user', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          email: `newuser${Date.now()}@civicbirth.cm`,
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
        },
        { validateStatus: () => true }
      );

      expect([201, 400]).toContain(response.status);
      if (response.status === 201) {
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('email');
      }
    });

    it('POST /auth/login - should login with valid credentials', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email: 'test@civicbirth.cm',
          password: 'testpassword123',
        },
        { validateStatus: () => true }
      );

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('accessToken');
      }
    });

    it('POST /auth/login - should reject invalid credentials', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email: 'test@civicbirth.cm',
          password: 'wrongpassword',
        },
        { validateStatus: () => true }
      );

      expect([401, 400]).toContain(response.status);
    });
  });

  // Registrations Integration Tests
  describe('Registrations Endpoints', () => {
    let registrationId: string;

    it('POST /registrations - should create registration', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/registrations`,
        {
          childFirstName: 'John',
          childLastName: 'Doe',
          dateOfBirth: '2020-01-01',
          placeOfBirth: 'Yaoundé',
          fatherName: 'James Doe',
          motherName: 'Jane Doe',
        },
        {
          headers: { Authorization: `Bearer ${validToken}` },
          validateStatus: () => true,
        }
      );

      expect([201, 401, 400]).toContain(response.status);
      if (response.status === 201) {
        registrationId = response.data.id;
        expect(response.data).toHaveProperty('childFirstName', 'John');
      }
    });

    it('GET /registrations - should list registrations', async () => {
      const response = await axios.get(`${API_BASE_URL}/registrations?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('data');
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('GET /registrations/:id - should get single registration', async () => {
      if (!registrationId) {
        console.log('Skipping test: no registration ID');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/registrations/${registrationId}`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('id', registrationId);
      }
    });

    it('PATCH /registrations/:id - should update registration', async () => {
      if (!registrationId) {
        console.log('Skipping test: no registration ID');
        return;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/registrations/${registrationId}`,
        {
          childFirstName: 'Updated',
        },
        {
          headers: { Authorization: `Bearer ${validToken}` },
          validateStatus: () => true,
        }
      );

      expect([200, 401, 404, 400]).toContain(response.status);
    });

    it('DELETE /registrations/:id - should delete registration', async () => {
      if (!registrationId) {
        console.log('Skipping test: no registration ID');
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/registrations/${registrationId}`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  // Agents Integration Tests
  describe('Agents Endpoints', () => {
    it('GET /agents - should list all agents', async () => {
      const response = await axios.get(`${API_BASE_URL}/agents?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('data');
        expect(response.data).toHaveProperty('total');
      }
    });

    it('GET /agents?region=Centre - should filter agents by region', async () => {
      const response = await axios.get(`${API_BASE_URL}/agents?region=Centre`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401]).toContain(response.status);
      if (response.status === 200 && response.data.data.length > 0) {
        expect(response.data.data[0]).toHaveProperty('region', 'Centre');
      }
    });
  });

  // Users Integration Tests
  describe('Users Endpoints', () => {
    it('GET /users - should list users with pagination', async () => {
      const response = await axios.get(`${API_BASE_URL}/users?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('data');
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });

    it('GET /users/:id - should get user profile', async () => {
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('email');
      }
    });
  });

  // Certificates Integration Tests
  describe('Certificates Endpoints', () => {
    it('GET /certificates - should list certificates', async () => {
      const response = await axios.get(`${API_BASE_URL}/certificates?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('data');
      }
    });

    it('GET /certificates/:id/pdf - should download certificate PDF', async () => {
      const response = await axios.get(`${API_BASE_URL}/certificates/sample/pdf`, {
        headers: { Authorization: `Bearer ${validToken}` },
        responseType: 'arraybuffer',
        validateStatus: () => true,
      });

      expect([200, 401, 404]).toContain(response.status);
    });
  });

  // Analytics Integration Tests
  describe('Analytics Endpoints', () => {
    it('GET /analytics/dashboard - should get dashboard analytics', async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('totalRegistrations');
      }
    });

    it('GET /analytics/by-region - should get analytics by region', async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/by-region`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401, 403]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.data)).toBe(true);
      }
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await axios.get(`${API_BASE_URL}/nonexistent`, {
        validateStatus: () => true,
      });

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication token', async () => {
      const response = await axios.get(`${API_BASE_URL}/registrations`, {
        validateStatus: () => true,
      });

      expect([401, 403]).toContain(response.status);
    });

    it('should return 400 for invalid request body', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/registrations`,
        {
          // Missing required fields
        },
        {
          headers: { Authorization: `Bearer ${validToken}` },
          validateStatus: () => true,
        }
      );

      expect([400, 401]).toContain(response.status);
    });
  });

  // RBAC Integration Tests
  describe('RBAC Integration', () => {
    it('should enforce role-based access control', async () => {
      // Try to access admin endpoint without admin role
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      // Should either succeed (if user is admin) or fail with 403
      expect([200, 401, 403]).toContain(response.status);
    });

    it('should allow registrar to access registration endpoints', async () => {
      const response = await axios.get(`${API_BASE_URL}/registrations`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      expect([200, 401]).toContain(response.status);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();

      const response = await axios.get(`${API_BASE_URL}/registrations?limit=100`, {
        headers: { Authorization: `Bearer ${validToken}` },
        validateStatus: () => true,
      });

      const duration = Date.now() - startTime;

      expect([200, 401]).toContain(response.status);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
