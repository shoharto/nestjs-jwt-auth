import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    jwtStrategy = moduleRef.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return the payload', async () => {
      const payload = { userId: 1, email: 'test@example.com' };

      const result = await jwtStrategy.validate(payload);

      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException when payload is invalid', async () => {
      const invalidPayload = { foo: 'bar' };

      await expect(jwtStrategy.validate(invalidPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
