/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../common/interceptors/business-errors/business-errors.interceptor';
import { SupermercadoEntity } from './supermercado.entity/supermercado.entity';
import { SupermercadoService } from './supermercado.service';
import { SupermercadoDto } from './supermercado.dto/supermercado.dto';

@Controller('supermarkets')
@UseInterceptors(BusinessErrorsInterceptor)
export class SupermercadoController {
    constructor(private readonly supermercadoService: SupermercadoService) {}

    @Get()
    async findAll() {
        return await this.supermercadoService.findAll();
    }

    @Get(':supermercadoId')
    async findOne(@Param('supermercadoId') supermercadoId: string) {
        return await this.supermercadoService.findOne(supermercadoId);
    }

    @Post()
    async create(@Body() supermercadoDto: SupermercadoDto) {
        const supermercado: SupermercadoEntity = plainToInstance(SupermercadoEntity, supermercadoDto);
        return await this.supermercadoService.create(supermercado);
    }

    @Put(':supermercadoId')
    async update(@Param('supermercadoId') supermercadoId: string, @Body() supermercadoDto: SupermercadoDto) {
        const supermercado: SupermercadoEntity = plainToInstance(SupermercadoEntity, supermercadoDto);
        return await this.supermercadoService.update(supermercadoId, supermercado);
    }

    @Delete(':supermercadoId')
    @HttpCode(204)
    async delete(@Param('supermercadoId') supermercadoId: string) {
        return await this.supermercadoService.delete(supermercadoId);
    }
}
