/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';
import { Repository } from 'typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity/ciudad.entity';
import { SupermercadoEntity } from '../supermercado/supermercado.entity/supermercado.entity';
import { TypeOrmTestingConfig } from '../common/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('CiudadSupermercadoService', () => {
  let service: CiudadSupermercadoService;
  let ciudadRepository: Repository<CiudadEntity>;
  let supermercadoRepository: Repository<SupermercadoEntity>;
  let ciudad: CiudadEntity;
  let supermercadosList: SupermercadoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadSupermercadoService],
    }).compile();

    service = module.get<CiudadSupermercadoService>(CiudadSupermercadoService);
    ciudadRepository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    supermercadoRepository = module.get<Repository<SupermercadoEntity>>(getRepositoryToken(SupermercadoEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    supermercadoRepository.clear();
    ciudadRepository.clear();

    supermercadosList = [];
    for (let i = 0; i < 5; i++) {
      const supermercado: SupermercadoEntity = await supermercadoRepository.save({
        nombre: faker.company.name(),
        longitud: parseFloat(faker.location.longitude().toFixed(2)),
        latitud: parseFloat(faker.location.latitude().toFixed(2)),
        web: faker.internet.url(),
      });
      supermercadosList.push(supermercado);
    }

    ciudad = await ciudadRepository.save({
      nombre: faker.location.city(),
      pais: faker.helpers.arrayElement(['Argentina', 'Ecuador', 'Paraguay']),
      numHabitantes: faker.number.int({ min: 1000, max: 1000000 }),
      supermercados: supermercadosList,
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addSupermarketToCity should add a supermarket to a city', async () => {
    const newSupermarket = await supermercadoRepository.save({
      nombre: faker.company.name(),
      longitud: parseFloat(faker.location.longitude().toFixed(2)),
      latitud: parseFloat(faker.location.latitude().toFixed(2)),
      web: faker.internet.url(),
    });

    const updatedCity = await service.addSupermarketToCity(ciudad.id, newSupermarket.id);
    expect(updatedCity.supermercados.length).toBe(6);
    expect(updatedCity.supermercados.find(s => s.id === newSupermarket.id)).not.toBeNull();
  });

  it('findSupermarketsFromCity should return the supermarkets of a city', async () => {
    const supermarkets = await service.findSupermarketsFromCity(ciudad.id);
    expect(supermarkets.length).toBe(5);
  });

  it('findSupermarketFromCity should return a supermarket of a city', async () => {
    const supermercado = supermercadosList[0];
    const storedSupermarket = await service.findSupermarketFromCity(ciudad.id, supermercado.id);
    expect(storedSupermarket).not.toBeNull();
    expect(storedSupermarket.nombre).toEqual(supermercado.nombre);
  });

  it('updateSupermarketsFromCity should update the supermarkets of a city', async () => {
    const newSupermarket = await supermercadoRepository.save({
      nombre: faker.company.name(),
      longitud: parseFloat(faker.location.longitude().toFixed(2)),
      latitud: parseFloat(faker.location.latitude().toFixed(2)),
      web: faker.internet.url(),
    });

    const updatedCity = await service.updateSupermarketsFromCity(ciudad.id, [newSupermarket]);
    expect(updatedCity.supermercados.length).toBe(1);
    expect(updatedCity.supermercados[0].id).toEqual(newSupermarket.id);
  });

  it('deleteSupermarketFromCity should remove a supermarket from a city', async () => {
    const supermercado = supermercadosList[0];
    await service.deleteSupermarketFromCity(ciudad.id, supermercado.id);
    const updatedCity = await ciudadRepository.findOne({ where: { id: ciudad.id }, relations: ['supermercados'] });
    expect(updatedCity.supermercados.find(s => s.id === supermercado.id)).toBeUndefined();
  });
});
