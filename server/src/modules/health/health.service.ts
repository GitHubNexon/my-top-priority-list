import { Injectable } from '@nestjs/common';
import { CreateHealthDto } from './dto/create-health.dto';
import { UpdateHealthDto } from './dto/update-health.dto';
import { DataSource } from 'typeorm';
import moment from 'moment';

@Injectable()
export class HealthService {
  constructor(private dataSource: DataSource) {}

  async checkHealth() {
    try {
      // check database and server connection

      await this.dataSource.query('SELECT 1');

      // get current database info
      const result = await this.dataSource.query(`
        SELECT current_database() AS db_name,
               inet_server_addr() AS server_ip,
               inet_server_port() AS server_port,
               version() AS pg_version
      `);

      const info = result[0];
      const isCloud = info.server && info.server_ip.toString() !== '127.0.0.1';

      // current server data/time in readable format

      const serverTime = moment().format('dddd, MMMM, Do yyyy, h:mmm:ss A');
      return {
        status: 'ok',
        serverTime,
        database: 'connected',
        dbName: info.db_name,
        host: info.server_ip,
        port: info.server_port,
        pgVersion: info.pg_version,
        environment: isCloud ? 'Cloud' : 'Local',
      };
    } catch (error) {
      return {
        status: 'error',
        serverTime: moment().format('dddd, MMMM Do YYYY, h:mm:ss A'),
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
