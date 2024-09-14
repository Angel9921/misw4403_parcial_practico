/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CiudadEntity } from '../ciudad/ciudad.entity/ciudad.entity';
import { Repository } from 'typeorm';
import { SupermercadoEntity } from '../supermercado/supermercado.entity/supermercado.entity';
import { BusinessError, BusinessLogicException } from '../common/exceptions/business-errors';


@Injectable()
export class CiudadSupermercadoService {
  constructor(
    @InjectRepository(CiudadEntity)
    private readonly ciudadRepository: Repository<CiudadEntity>,

    @InjectRepository(SupermercadoEntity)
    private readonly supermercadoRepository: Repository<SupermercadoEntity>,
  ) {}

  // Método 1: Asociar un supermercado a una ciudad
  async addSupermarketToCity(cityId: string, supermarketId: string): Promise<CiudadEntity> {
    const supermarket = await this.supermercadoRepository.findOne({ where: { id: supermarketId } });
    if (!supermarket)
      throw new BusinessLogicException('The supermarket with the given id was not found', BusinessError.NOT_FOUND);

    const city = await this.ciudadRepository.findOne({ where: { id: cityId }, relations: ['supermercados'] });
    if (!city)
      throw new BusinessLogicException('The city with the given id was not found', BusinessError.NOT_FOUND);

    city.supermercados = [...city.supermercados, supermarket];
    return await this.ciudadRepository.save(city);
  }

  // Método 2: Obtener todos los supermercados de una ciudad
  async findSupermarketsFromCity(cityId: string): Promise<SupermercadoEntity[]> {
    const city = await this.ciudadRepository.findOne({ where: { id: cityId }, relations: ['supermercados'] });
    if (!city)
      throw new BusinessLogicException('The city with the given id was not found', BusinessError.NOT_FOUND);

    return city.supermercados;
  }

  // Método 3: Obtener un supermercado específico de una ciudad
  async findSupermarketFromCity(cityId: string, supermarketId: string): Promise<SupermercadoEntity> {
    const city = await this.ciudadRepository.findOne({ where: { id: cityId }, relations: ['supermercados'] });
    if (!city)
      throw new BusinessLogicException('The city with the given id was not found', BusinessError.NOT_FOUND);

    const supermarket = city.supermercados.find(s => s.id === supermarketId);
    if (!supermarket)
      throw new BusinessLogicException('The supermarket with the given id is not associated to the city', BusinessError.PRECONDITION_FAILED);

    return supermarket;
  }

  // Método 4: Actualizar los supermercados de una ciudad
  async updateSupermarketsFromCity(cityId: string, supermarkets: SupermercadoEntity[]): Promise<CiudadEntity> {
    const city = await this.ciudadRepository.findOne({ where: { id: cityId }, relations: ['supermercados'] });
    if (!city)
      throw new BusinessLogicException('The city with the given id was not found', BusinessError.NOT_FOUND);

    for (const supermarket of supermarkets) {
      const exists = await this.supermercadoRepository.findOne({ where: { id: supermarket.id } });
      if (!exists)
        throw new BusinessLogicException('One of the supermarkets was not found', BusinessError.NOT_FOUND);
    }

    city.supermercados = supermarkets;
    return await this.ciudadRepository.save(city);
  }

  // Método 5: Eliminar un supermercado de una ciudad
  async deleteSupermarketFromCity(cityId: string, supermarketId: string): Promise<void> {
    const city = await this.ciudadRepository.findOne({ where: { id: cityId }, relations: ['supermercados'] });
    if (!city)
      throw new BusinessLogicException('The city with the given id was not found', BusinessError.NOT_FOUND);

    city.supermercados = city.supermercados.filter(s => s.id !== supermarketId);
    await this.ciudadRepository.save(city);
  }
}