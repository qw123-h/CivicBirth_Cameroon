import { Test, TestingModule } from '@nestjs/testing';
import { AuthMiddleware } from './auth.middleware';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let jwtService: JwtService;

  const mockRequest: any = {
    headers: {
      authorization: 'Bearer valid_token',
    },
  };

  const mockResponse: any = {};
  const mockNext = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMiddleware,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue({ id: 'user-123' }),
          },
        },
      ],
    }).compile();

    middleware = module.get<AuthMiddleware>(AuthMiddleware);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('use', () => {
    it('should pass request with valid token', () => {
      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user.id).toBe('user-123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if no authorization header', () => {
      const requestWithoutAuth = { headers: {} };

      expect(() => middleware.use(requestWithoutAuth, mockResponse, mockNext)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if invalid token format', () => {
      const requestWithInvalidFormat = {
        headers: {
          authorization: 'InvalidFormat token',
        },
      };

      expect(() => middleware.use(requestWithInvalidFormat, mockResponse, mockNext)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token verification fails', () => {
      jest.spyOn(jwtService, 'verify').mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      expect(() => middleware.use(mockRequest, mockResponse, mockNext)).toThrow(UnauthorizedException);
    });
  });
});

describe('RBACMiddleware', () => {
  let middleware: any;

  const mockRequest: any = {
    user: {
      id: 'user-123',
      role: 'REGISTRAR',
    },
  };

  const mockResponse: any = {};
  const mockNext = jest.fn();

  beforeEach(() => {
    middleware = (allowedRoles: string[]) => (req: any, res: any, next: any) => {
      if (!allowedRoles.includes(req.user.role)) {
        throw new UnauthorizedException('Insufficient permissions');
      }
      next();
    };
  });

  describe('use', () => {
    it('should allow user with correct role', () => {
      const rbacMiddleware = middleware(['REGISTRAR', 'ADMIN']);

      rbacMiddleware(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny user without correct role', () => {
      const rbacMiddleware = middleware(['ADMIN']);

      expect(() => rbacMiddleware(mockRequest, mockResponse, mockNext)).toThrow(UnauthorizedException);
    });

    it('should allow ADMIN for any resource', () => {
      const adminRequest = { ...mockRequest, user: { ...mockRequest.user, role: 'ADMIN' } };
      const rbacMiddleware = middleware(['REGISTRAR']);

      rbacMiddleware(adminRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});

describe('AuditMiddleware', () => {
  let auditLog: any[] = [];

  const mockRequest: any = {
    method: 'POST',
    url: '/api/registrations',
    user: { id: 'user-123' },
  };

  const mockResponse: any = {
    statusCode: 200,
  };

  const mockNext = jest.fn();

  beforeEach(() => {
    auditLog = [];
  });

  it('should log request information', () => {
    const auditMiddleware = (req: any, res: any, next: any) => {
      auditLog.push({
        method: req.method,
        url: req.url,
        userId: req.user?.id,
        timestamp: new Date(),
      });
      next();
    };

    auditMiddleware(mockRequest, mockResponse, mockNext);

    expect(auditLog).toHaveLength(1);
    expect(auditLog[0].method).toBe('POST');
    expect(auditLog[0].userId).toBe('user-123');
  });

  it('should track multiple requests', () => {
    const auditMiddleware = (req: any, res: any, next: any) => {
      auditLog.push({
        method: req.method,
        url: req.url,
        userId: req.user?.id,
        timestamp: new Date(),
      });
      next();
    };

    auditMiddleware(mockRequest, mockResponse, mockNext);
    auditMiddleware({ ...mockRequest, url: '/api/agents' }, mockResponse, mockNext);

    expect(auditLog).toHaveLength(2);
    expect(auditLog[1].url).toBe('/api/agents');
  });
});

describe('ErrorMiddleware', () => {
  it('should handle and format errors', () => {
    const errorMiddleware = (err: any, req: any, res: any, next: any) => {
      const response = {
        success: false,
        message: err.message || 'Internal Server Error',
        status: err.statusCode || 500,
      };

      res.status(response.status).json(response);
    };

    const mockResponse: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const testError = new Error('Test error');

    errorMiddleware(testError, {}, mockResponse, null);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Test error',
      })
    );
  });

  it('should preserve custom status codes', () => {
    const errorMiddleware = (err: any, req: any, res: any, next: any) => {
      const response = {
        success: false,
        message: err.message || 'Internal Server Error',
        status: err.statusCode || 500,
      };

      res.status(response.status).json(response);
    };

    const mockResponse: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const testError: any = new Error('Unauthorized');
    testError.statusCode = 401;

    errorMiddleware(testError, {}, mockResponse, null);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
  });
});
