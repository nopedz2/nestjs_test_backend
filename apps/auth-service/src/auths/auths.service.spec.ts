/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { verify } from 'jsonwebtoken';
import { comparePasswordHelpers, hashPasswordHelpers } from 'y/common';
import { AuthsService } from './auths.service';
import { UsersRepository } from '../users/user.repository';

// jest.mock('uuid',() =>({
//   v4: jest.fn(()=>'mock-uuid'),
// }));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('y/common', () => ({
  comparePasswordHelpers: jest.fn(),
  hashPasswordHelpers: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('AuthsService', () => {
  let service: AuthsService;
  let repo: any;
  let jwtService: any;
  let mailerService: any;
  let httpService: any;
  let configService: any;
  let coreClient: any;

  beforeEach(async () => {
    repo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      exists: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    mailerService = {
      sendMail: jest.fn(),
    };

    httpService = {
      get: jest.fn(),
    };

    configService = {
      get: jest.fn(),
    };

    coreClient = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthsService,
        { provide: UsersRepository, useValue: repo },
        { provide: JwtService, useValue: jwtService },
        { provide: MailerService, useValue: mailerService },
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
        { provide: 'CORE_SERVICE', useValue: coreClient },
      ],
    }).compile();

    service = module.get<AuthsService>(AuthsService);
  });

  // it('validateUser returns null when user is not found', async () => {
  //   repo.findByEmail.mockResolvedValue(null);

  //   const result = await service.validateUser('a@test.com', '123456');

  //   expect(result).toBeNull();
  // });

  it('validateUser throws UnauthorizedException when user is not found', async () => {
    repo.findByEmail.mockResolvedValue(null); 
    await expect(service.validateUser('a@test.com', '123456'))
    .rejects.toBeInstanceOf(UnauthorizedException); 
  });

  it('validateUser throws UnauthorizedException when password is invalid', async () => {
    repo.findByEmail.mockResolvedValue({
      email: 'a@test.com',
      password: 'hashedPassword',
    });
    (comparePasswordHelpers as jest.Mock).mockResolvedValue(false);

    await expect(service.validateUser('a@test.com', 'wrong-pass')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('validateUser returns user when password is valid', async () => {
    const user = {
      _id: '123',
      email: 'a@test.com',
      password: 'hashedPassword',
    };

    repo.findByEmail.mockResolvedValue(user);
    (comparePasswordHelpers as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('a@test.com', 'correct-pass');

    expect(result).toEqual(user);
  });

  it('handleRegister throws when email or password is missing', async () => {
    await expect(
      service.handleRegister({ email: '', password: '123456' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('handleRegister creates user successfully when email is new', async () => {
    repo.exists.mockResolvedValue(false);
    (hashPasswordHelpers as jest.Mock).mockResolvedValue('hashed-pass');
    repo.create.mockResolvedValue({ _id: '123', email: 'a@test.com' });

    const result = await service.handleRegister({
      email: 'a@test.com',
      password: '123456',
    });

    expect(repo.exists).toHaveBeenCalledWith({ email: 'a@test.com' });
    expect(repo.create).toHaveBeenCalled();
    expect(result).toEqual({ _id: '123', email: 'a@test.com' });
  });

  it('handleRegister throws when email already exists', async () => {
    repo.exists.mockResolvedValue(true);

    await expect(
      service.handleRegister({ email: 'a@test.com', password: '123456' } as any),
    ).rejects.toThrow(BadRequestException);

    expect(repo.create).not.toHaveBeenCalled();
  });

  it('generateToken returns access and refresh tokens and stores refresh hash', async () => {
    jwtService.signAsync.mockResolvedValueOnce('access-token');
    jwtService.signAsync.mockResolvedValueOnce('refresh-token');
    (hashPasswordHelpers as jest.Mock).mockResolvedValue('hashed-refresh');

    const result = await service.generateToken('123', 'a@test.com');

    expect(result).toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
    expect(repo.updateRefreshToken).toHaveBeenCalledWith(
      '123',
      'hashed-refresh',
    );
  });

  it('getPublicKey formats the certificate from Keycloak JWKS response', async () => {
    configService.get.mockReturnValue('https://issuer.example.com');
    httpService.get.mockReturnValue(
      of({ data: { keys: [{ x5c: ['MIIB...certificate...'] }] } }),
    );

    const result = await service.getPublicKey();

    expect(result).toContain('-----BEGIN CERTIFICATE-----');
    expect(result).toContain('MIIB');
    expect(result).toContain('-----END CERTIFICATE-----');
  });

  it('getPublicKey throws InternalServerErrorException when issuer is missing', async () => {
    configService.get.mockReturnValue(undefined);

    await expect(service.getPublicKey()).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('verifyExternalToken throws UnauthorizedException for invalid token', async () => {
    jest.spyOn(service as any, 'getPublicKey').mockResolvedValue('pem');
    (verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(service.verifyExternalToken('bad-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('refreshToken returns a new access token when refresh token is valid', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: '123' });
    repo.findById.mockResolvedValue({
      _id: '123',
      email: 'a@test.com',
      refreshToken: 'hashed-refresh',
    });
    (comparePasswordHelpers as jest.Mock).mockResolvedValue(true);

    jwtService.signAsync.mockResolvedValue('new-access-token');
    const result = await service.refreshToken('valid-refresh-token');
    expect(result).toEqual({ access_token: 'new-access-token' });
  });

    it('refreshToken throws UnauthorizedException when refresh token is invalid', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: '123' });
    repo.findById.mockResolvedValue({
      _id: '123',
      email: 'a@test.com',
      refreshToken: 'hashed-refresh',
    });
    (comparePasswordHelpers as jest.Mock).mockResolvedValue(false);
    await expect(service.refreshToken('invalid-refresh-token')).rejects.toThrow(UnauthorizedException);
    expect(repo.updateRefreshToken).toHaveBeenCalledWith('123', null);
  });
      it('refreshToken throws UnauthorizedException when user is invalid', async () => {
    jwtService.verifyAsync.mockResolvedValue({sub :'123'});
    repo.findById.mockResolvedValue(null);
    await expect(service.refreshToken('some-refresh-token')).rejects.toThrow(UnauthorizedException);
  });



  it('login returns generated tokens for a valid user', async () => {
    const tokens = { accessToken: 'access', refreshToken: 'refresh' };
    jest.spyOn(service as any, 'generateToken').mockResolvedValue(tokens);

    const result = await service.login({
      _id: '123',
      email: 'a@test.com',
    });

    expect(result).toEqual(tokens);
  });

  it('login throws error for invalid user', async () => {
    await expect(service.login(null)).rejects.toThrow(UnauthorizedException);
  });



  it('logout succeeds when refresh token is valid', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: '123' });
    repo.findById.mockResolvedValue({
      _id: '123',
      email: 'a@test.com',
      refreshToken: 'hashed-refresh',
    });
    (comparePasswordHelpers as jest.Mock).mockResolvedValue(true);

    const result = await service.logout('123', 'valid-refresh-token');

    expect(result).toEqual({ message: 'Đăng xuất thành công' });
    expect(repo.updateRefreshToken).toHaveBeenCalledWith('123', null);
  });

  it('findUser returns null when core service throws', async () => {
    coreClient.send.mockImplementation(() => {
      throw new Error('core down');
    });

    const result = await service.findUser({ email: 'a@test.com' });

    expect(result).toBeNull();
  });

  it('checkUserPermission returns true when core service allows it', async () => {
    coreClient.send.mockReturnValue(of({ hasPermission: true }));

    const result = await service.checkUserPermission('123', 'read');

    expect(result).toBe(true);
  });

  it('invalidateSession returns true when core service confirms it', async () => {
    coreClient.send.mockReturnValue(of({ success: true }));

    const result = await service.invalidateSession('123');

    expect(result).toBe(true);
  });
});
