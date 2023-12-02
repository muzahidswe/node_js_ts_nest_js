import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION, NestjsKnexService } from 'nestjs-knexjs';
import { DemercationDto } from './demarcation.dto';
import { HelperService } from '../core/helper.services'
const excel = require('exceljs');

@Injectable()
export class DemercationService {
  storePainterInfo(demercationDto: DemercationDto): any {
    throw new Error('Method not implemented.');
  }
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex, private readonly helperService: HelperService) { }

  async updateCluster(file) {

    const readXlsxFile = require('read-excel-file/node');
    const response = await readXlsxFile(file.path);
    const result = await response;
    const data = result.slice(1);

    /*
let match_header = headers.filter(x => !header_arr.includes(x));

    if (match_header.length != 0) {
      const returnData = {
        data: 1,       
        excel_header_missing: 1,
        msg: 'User has not insert succesfully because of header mismatch',
        success: true,
      };
      return returnData
    }
    */


    for (let index = 0; index < data.length; index++) {
      let single_row_obj = {};

      let single_row_region_id = data[index][0];
      let single_row_area_id = data[index][2];
      let single_row_territory_id = data[index][4];
      let single_row_cluster_id = data[index][6];

      single_row_obj['region_id'] = single_row_region_id;
      single_row_obj['area_id'] = single_row_area_id;
      single_row_obj['territory_id'] = single_row_territory_id;
      single_row_obj['cluster_id'] = single_row_cluster_id;

      await this.update_location(single_row_obj);
    }

    const returnData = {
      data: 1,
      excel_header_missing: 0,
      msg: 'Demarcation has done succesfully.',
      success: true,
    };
    //console.log(returnData);
    return returnData

  }

  async update_location(data) {

    let cluster_id = data['cluster_id'];
    let territory_id = data['territory_id'];
    let area_id = data['area_id'];
    let region_id = data['region_id'];


    const update_cluster = await this.knex('cluster')
      .where('id', cluster_id)
      .where('status', 'Active')
      .update({
        region_id: region_id,
        area_id: area_id,
        territory_id: territory_id,
      });

    const update_territory = await this.knex('territory')
      .where('id', territory_id)
      .where('status', 'Active')
      .update({
        region_id: region_id,
        area_id: area_id,
      });

    const update_area = await this.knex('area')
      .where('id', area_id)
      .where('status', 'Active')
      .update({
        region_id: region_id,
      });

    const user_location_access = await this.knex('user_location_access')
      .where('id', cluster_id)
      .where('status', 'Active')
      .update({
        region: region_id,
        area: area_id,
        territory: territory_id,
      });

    const dealer_location_access = await this.knex('apps_dealer_location')
      .where('id', cluster_id)
      .where('status', 'Active')
      .update({
        region: region_id,
        area: area_id,
        territory: territory_id,
      });

    const painter_location_access = await this.knex('apps_painter_location')
      .where('id', cluster_id)
      .where('status', 'Active')
      .update({
        region: region_id,
        area: area_id,
        territory: territory_id,
      });
     
    //console.log(region_id);
  }

}
