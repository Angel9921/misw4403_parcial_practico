/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../common/interceptors/business-errors/business-errors.interceptor';
import { CiudadSupermercadoService } from './ciudad-supermercado.service';
import { SupermercadoEntity } from '../supermercado/supermercado.entity/supermercado.entity';
import { SupermercadoDto } from '../supermercado/supermercado.dto/supermercado.dto';

@Controller('cities/:cityId/supermarkets')
@UseInterceptors(BusinessErrorsInterceptor)
export class CiudadSupermercadoController {
    constructor(private readonly ciudadSupermercadoService: CiudadSupermercadoService) {}

    @Post(':supermarketId')
    async addSupermarketToCity(@Param('cityId') cityId: string, @Param('supermarketId') supermarketId: string) {
        return await this.ciudadSupermercadoService.addSupermarketToCity(cityId, supermarketId);
    }

    @Get()
    async findSupermarketsFromCity(@Param('cityId') cityId: string) {
        return await this.ciudadSupermercadoService.findSupermarketsFromCity(cityId);
    }

    @Get(':supermarketId')
    async findSupermarketFromCity(@Param('cityId') cityId: string, @Param('supermarketId') supermarketId: string) {
        return await this.ciudadSupermercadoService.findSupermarketFromCity(cityId, supermarketId);
    }

    @Put()
    async updateSupermarketsFromCity(@Body() supermercadosDto: SupermercadoDto[], @Param('cityId') cityId: string) {
        const supermercados = plainToInstance(SupermercadoEntity, supermercadosDto);
        return await this.ciudadSupermercadoService.updateSupermarketsFromCity(cityId, supermercados);
    }

    @Delete(':supermarketId')
    @HttpCode(204)
    async deleteSupermarketFromCity(@Param('cityId') cityId: string, @Param('supermarketId') supermarketId: string) {
        return await this.ciudadSupermercadoService.deleteSupermarketFromCity(cityId, supermarketId);
    }
}
