/* eslint-disable prettier/prettier */
/*archivo src/receta/receta.service.spec.ts*/
import { Test, TestingModule } from '@nestjs/testing';
import { CiudadService } from './ciudad.service';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';
import { CiudadEntity } from './ciudad.entity/ciudad.entity';
import { TypeOrmTestingConfig } from '../common/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CiudadService', () => {
  let service: CiudadService;
  let repository: Repository<CiudadEntity>;
  let ciudadesList: CiudadEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [CiudadService],
    }).compile();

    service = module.get<CiudadService>(CiudadService);
    repository = module.get<Repository<CiudadEntity>>(getRepositoryToken(CiudadEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    ciudadesList = [];
    for(let i = 0; i < 5; i++){
        const ciudad: CiudadEntity = await repository.save({
        nombre: faker.location.city(),
        pais: faker.helpers.arrayElement(['Argentina', 'Ecuador', 'Paraguay']),  // País válido
        numHabitantes: faker.number.int({ min: 1000, max: 1000000 }),
        });
        ciudadesList.push(ciudad);
    }
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all cities', async () => {
    const ciudades: CiudadEntity[] = await service.findAll();
    expect(ciudades).not.toBeNull();
    expect(ciudades).toHaveLength(ciudadesList.length);
  });

  it('findOne should return a city by id', async () => {
    const storedCity: CiudadEntity = ciudadesList[0];
    const ciudad: CiudadEntity = await service.findOne(storedCity.id);
    expect(ciudad).not.toBeNull();
    expect(ciudad.nombre).toEqual(storedCity.nombre);
    expect(ciudad.pais).toEqual(storedCity.pais);
    expect(ciudad.numHabitantes).toEqual(storedCity.numHabitantes);
  });

  it('findOne should throw an exception for an invalid city', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "The city with the given id was not found");
  });

  it('create should return a new city', async () => {
    const ciudad: CiudadEntity = {
      id: "",
      nombre: faker.location.city(),
      pais: "Argentina",  // País válido
      numHabitantes: faker.number.int({ min: 1000, max: 1000000 }),
      supermercados: []
    };

    const newCity: CiudadEntity = await service.create(ciudad);
    expect(newCity).not.toBeNull();

    const storedCity: CiudadEntity = await repository.findOne({ where: { id: newCity.id } });
    expect(storedCity).not.toBeNull();
    expect(storedCity.nombre).toEqual(newCity.nombre);
    expect(storedCity.pais).toEqual(newCity.pais);
    expect(storedCity.numHabitantes).toEqual(newCity.numHabitantes);
  });

  it('create should throw an exception for an invalid country', async () => {
    const ciudad: CiudadEntity = {
      id: "",
      nombre: faker.location.city(),
      pais: "Brazil",  // País inválido
      numHabitantes: faker.number.int({ min: 1000, max: 1000000 }),
      supermercados: []
    };

    await expect(() => service.create(ciudad)).rejects.toHaveProperty("message", "The country is not allowed");
  });

  it('update should modify a city', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    ciudad.nombre = "New City Name";
    ciudad.pais = "Ecuador";  // País válido

    const updatedCity: CiudadEntity = await service.update(ciudad.id, ciudad);
    expect(updatedCity).not.toBeNull();

    const storedCity: CiudadEntity = await repository.findOne({ where: { id: ciudad.id } });
    expect(storedCity).not.toBeNull();
    expect(storedCity.nombre).toEqual(ciudad.nombre);
    expect(storedCity.pais).toEqual(ciudad.pais);
  });

  it('update should throw an exception for an invalid country', async () => {
    let ciudad: CiudadEntity = ciudadesList[0];
    ciudad = {
      ...ciudad, pais: "Brazil"  // País inválido
    };

    await expect(() => service.update(ciudad.id, ciudad)).rejects.toHaveProperty("message", "The country is not allowed");
  });

  it('delete should remove a city', async () => {
    const ciudad: CiudadEntity = ciudadesList[0];
    await service.delete(ciudad.id);

    const deletedCity: CiudadEntity = await repository.findOne({ where: { id: ciudad.id } });
    expect(deletedCity).toBeNull();
  });

  it('delete should throw an exception for an invalid city', async () => {
    await service.delete(ciudadesList[0].id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "The city with the given id was not found");
  });
});
