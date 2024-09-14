/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { SupermercadoService } from './supermercado.service';
import { Repository } from 'typeorm';
import { SupermercadoEntity } from './supermercado.entity/supermercado.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../common/testing-utils/typeorm-testing-config';

describe('SupermercadoService', () => {
  let service: SupermercadoService;
  let repository: Repository<SupermercadoEntity>;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SupermercadoService],
    }).compile();

    service = module.get<SupermercadoService>(SupermercadoService);
    repository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    supermercadosList = [];
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity = await repository.save({
        nombre: faker.company.name() + ' Supermercado',
        longitud: Math.round(Number(faker.location.longitude())),
        latitud: Math.round(Number(faker.location.latitude())),
        web: faker.internet.url(),
      });
      supermercadosList.push(supermercado);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all supermarkets', async () => {
    const supermercados: SupermercadoEntity[] = await service.findAll();
    expect(supermercados).not.toBeNull();
    expect(supermercados).toHaveLength(supermercadosList.length);
  });

  it('findOne should return a supermarket by id', async () => {
    const storedSupermarket: SupermercadoEntity = supermercadosList[0];
    const supermercado: SupermercadoEntity = await service.findOne(storedSupermarket.id);
    expect(supermercado).not.toBeNull();
    expect(supermercado.nombre).toEqual(storedSupermarket.nombre);
    expect(supermercado.longitud).toEqual(storedSupermarket.longitud);
    expect(supermercado.latitud).toEqual(storedSupermarket.latitud);
    expect(supermercado.web).toEqual(storedSupermarket.web);
  });

  it('findOne should throw an exception for an invalid supermarket', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty('message', 'The supermarket with the given id was not found');
  });

  it('create should return a new supermarket', async () => {
    const supermercado: SupermercadoEntity = {
      id: '',
      nombre: faker.company.name() + ' Supermarket',
      longitud: Math.round(Number(faker.location.longitude())),
      latitud: Math.round(Number(faker.location.latitude())),
      web: faker.internet.url(),
      ciudades: [],
    };

    const newSupermarket: SupermercadoEntity = await service.create(supermercado);
    expect(newSupermarket).not.toBeNull();

    const storedSupermarket: SupermercadoEntity = await repository.findOne({ where: { id: newSupermarket.id } });
    expect(storedSupermarket).not.toBeNull();
    expect(storedSupermarket.nombre).toEqual(newSupermarket.nombre);
    expect(supermercado.longitud).toEqual(storedSupermarket.longitud);
    expect(supermercado.latitud).toEqual(storedSupermarket.latitud);
    expect(storedSupermarket.web).toEqual(newSupermarket.web);
  });

  it('create should throw an exception for a name with less than 10 characters', async () => {
    const supermercado: SupermercadoEntity = {
      id: '',
      nombre: 'ShortName',
      longitud: faker.location.longitude(),
      latitud: faker.location.latitude(),
      web: faker.internet.url(),
      ciudades: [],
    };

    await expect(() => service.create(supermercado)).rejects.toHaveProperty('message', 'The supermarket name must have more than 10 characters');
  });

  it('update should modify a supermarket', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado.nombre = 'New Supermarket Name';
    supermercado.web = 'https://new-website.com';

    const updatedSupermarket: SupermercadoEntity = await service.update(supermercado.id, supermercado);
    expect(updatedSupermarket).not.toBeNull();

    const storedSupermarket: SupermercadoEntity = await repository.findOne({ where: { id: supermercado.id } });
    expect(storedSupermarket).not.toBeNull();
    expect(storedSupermarket.nombre).toEqual(supermercado.nombre);
    expect(storedSupermarket.web).toEqual(supermercado.web);
  });

  it('update should throw an exception for a name with less than 10 characters', async () => {
    let supermercado: SupermercadoEntity = supermercadosList[0];
    supermercado = {
      ...supermercado,
      nombre: 'ShortName',
    };

    await expect(() => service.update(supermercado.id, supermercado)).rejects.toHaveProperty('message', 'The supermarket name must have more than 10 characters');
  });

  it('delete should remove a supermarket', async () => {
    const supermercado: SupermercadoEntity = supermercadosList[0];
    await service.delete(supermercado.id);

    const deletedSupermarket: SupermercadoEntity = await repository.findOne({ where: { id: supermercado.id } });
    expect(deletedSupermarket).toBeNull();
  });

  it('delete should throw an exception for an invalid supermarket', async () => {
    await service.delete(supermercadosList[0].id);
    await expect(() => service.delete('0')).rejects.toHaveProperty('message', 'The supermarket with the given id was not found');
  });
});
