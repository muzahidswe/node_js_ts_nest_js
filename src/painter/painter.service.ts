import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION, NestjsKnexService } from 'nestjs-knexjs';
import { PainterDto } from './painter.dto';
import { HelperService } from '../core/helper.services'
const excel = require('exceljs');

@Injectable()
export class PainterService {
  storePainterInfo(painterDto: PainterDto): any {
    throw new Error('Method not implemented.');
  }
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex, private readonly helperService: HelperService) { }

  private apps_painter_tbl = 'apps_painter';
  private apps_painter_location_tbl = 'apps_painter_location';
  private apps_progoti_details_tbl = 'apps_progoti_details';

  async getCompanyProgotiInfo() {
    const regions = await this.knex.select('id', 'region_name').from('region');
    const area = await this.knex
      .select('id', 'area_name', 'area_code', 'region_id')
      .from('area');
    const territory = await this.knex
      .select('id', 'territory_name', 'territory_code', 'region_id', 'area_id')
      .from('territory');
    const cluster = await this.knex
      .select(
        'id',
        'cluster_name',
        'cluster_code',
        'region_id',
        'area_id',
        'territory_id',
      )
      .from('cluster');
    const companies_info = await this.knex
      .select('id', 'company_name')
      .from('companies_t');
    const progoti_info = await this.knex
      .select('id', 'name')
      .from(this.apps_progoti_details_tbl);

    const obj = {
      region: regions,
      area: area,
      territory: territory,
      cluster: cluster,
      companies_info: companies_info,
      progoti_info: progoti_info,
    };
    //console.log(obj); 
    return obj;
  }
  async getPainterList() {
    //console.log('test'); return;
    const painters = await this.knex(this.apps_painter_tbl)
      .innerJoin(this.apps_painter_location_tbl, this.apps_painter_tbl + '.id', '=', this.apps_painter_location_tbl + '.painter_id')
      .innerJoin('companies_t', 'companies_t.id', '=', this.apps_painter_tbl + '.company_type')
      .innerJoin('cluster', 'cluster.id', '=', this.apps_painter_location_tbl + '.cluster')
      .innerJoin('region', 'region.id', '=', this.apps_painter_location_tbl + '.region')
      .innerJoin('area', 'area.id', '=', this.apps_painter_location_tbl + '.area')
      .innerJoin('territory', 'territory.id', '=', this.apps_painter_location_tbl + '.territory',)
      .where(this.apps_painter_location_tbl + '.status', 'Active')
      //.where(this.apps_painter_tbl + '.status', '<>', 'In-Active')
      //.andWhere(this.apps_painter_location_tbl + '.status', 'Active')
      //.andWhere(this.apps_painter_tbl + '.status', '<>', 'Unregistered')
      .select(
        this.knex.raw(
          this.apps_painter_tbl + '.*,GROUP_CONCAT( DISTINCT cluster.cluster_name ) AS cluster,GROUP_CONCAT( DISTINCT cluster.id ) AS cluster_id,GROUP_CONCAT( DISTINCT region.region_name ) AS region,GROUP_CONCAT( DISTINCT region.id ) AS region_id,GROUP_CONCAT( DISTINCT area.area_name ) AS area,GROUP_CONCAT( DISTINCT area.id ) AS area_id,GROUP_CONCAT( DISTINCT territory.territory_name ) AS territory,GROUP_CONCAT( DISTINCT territory.id ) AS territory_id,companies_t.company_name as company_name',
        ),
      ).groupBy(this.apps_painter_tbl + '.id');
    const obj = { painter_list: painters };
    //console.log(obj);
    return obj;

  }

  async getPainterDump(response) {
    let company_type = [1, 2];
    const painters = await this.knex('apps_painter')
      .innerJoin('apps_painter_location', 'apps_painter.id', '=', 'apps_painter_location.painter_id')
      .innerJoin('cluster', 'cluster.id', '=', 'apps_painter_location.cluster')
      .innerJoin('region', 'region.id', '=', 'apps_painter_location.region')
      .innerJoin('area', 'area.id', '=', 'apps_painter_location.area')
      .innerJoin('territory', 'territory.id', '=', 'apps_painter_location.territory',)
      .whereIn('apps_painter.company_type', company_type)
      .andWhere('apps_painter.status', '<>', 'In-Active')
      .andWhere('apps_painter.status', '<>', 'Unregistered')
      .andWhere('apps_painter_location.status', 'Active')
      .select(
        this.knex.raw(
          'apps_painter.id,apps_painter.painter_code,apps_painter.painter_name,apps_painter.progoti_status,apps_painter.company_type,CASE WHEN apps_painter.company_type = 1 THEN "Apec Buddy" WHEN apps_painter.company_type = 2 THEN "Ezzy Painter" WHEN apps_painter.company_type = 3 THEN "Wake Up (TSI App)" ELSE "Project Sales" END AS company_name,apps_painter.status as status,apps_painter_location.cluster as cluster,cluster.cluster_name as cluster_name,apps_painter_location.territory as territory,territory.territory_name as territory_name,apps_painter_location.area as area,area.area_name as area_name,apps_painter_location.region as region,region.region_name as region_name'
        ),
      );
    let data = [];
    const name = 'ActivePainterList with location (Apecbuddy Ezypainter)';
    const headers = [
      { header: 'id', key: 'id', width: 20 },
      { header: 'painter_code', key: 'painter_code', width: 20 },
      { header: 'painter_name', key: 'painter_name', width: 20 },
      { header: 'progoti_status', key: 'progoti_status', width: 20 },
      { header: 'company_type', key: 'company_type', width: 20 },


      { header: 'company_name', key: 'company_name', width: 20 },
      { header: 'status', key: 'status', width: 20 },
      { header: 'cluster', key: 'cluster', width: 20 },

      { header: 'cluster_name', key: 'cluster_name', width: 20 },
      { header: 'territory', key: 'territory', width: 20 },
      { header: 'territory_name', key: 'territory_name', width: 20 },
      { header: 'area', key: 'area', width: 20 },

      { header: 'area_name', key: 'area_name', width: 20 },
      { header: 'region', key: 'region', width: 20 },
      { header: 'region_name', key: 'region_name', width: 20 },

    ];

    return this.generateExcelReport(response, name, headers, painters);
  }

  async generateExcelReport(response, fileName: string, headers: any, data: any) {

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet(fileName);
    worksheet.columns = headers;
    worksheet.getRow(1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          // First set the background of header row
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '808080' }
          };
        };
      })
      //Commit the changed row to the stream
      row.commit();
    });

    worksheet.addRows(data);

    response.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    response.setHeader(
      "Content-Disposition",
      "attachment; filename=" + fileName + ".xlsx"
    );
    return workbook.xlsx.write(response).then(function () {
      response.status(200).end();
    });
  }


  getProgotiName(id) {
    /*
    const progoti_name = await this.knex(this.apps_progoti_details_tbl)
      .where('id', id)
      .select('name');
    let name = progoti_name[0].name;   
    return progoti_name;
*/
    const get_user_id = this.knex(this.apps_progoti_details_tbl)
      .where('id', id)
      .select('name as p_name');
    let user_id = get_user_id[0].p_name;
    //console.log('id', user_id);
    return user_id;
  }
  async storeSinglePainterInfo(painter_data) {
    const check_painter = await this.knex(this.apps_painter_tbl)
      .where('painter_code', painter_data.painter_code)
      .count('id as total_painter');

    let total_row = check_painter[0].total_painter;
    if (total_row > 0) {
      const return_message = {
        data: 0,
        msg: 'Duplicate Painter Code/Painter Name has found',
        success: false,
      };
      return return_message;
    }


    let phone_numbers = await this.helperService.phnNumberCheck(painter_data.contact);
    let painter_nid = painter_data.nid;
    if (painter_data.nid == 'undefined' || !painter_data.nid) {
      painter_nid = 0;
    }
    let painter_code = painter_data.painter_code;
    let painter_name = painter_data.painter_name;
    let nid = painter_nid;
    let contact = phone_numbers;
    let address = painter_data.address;
    let company_type = painter_data.company_type;
    let progoti_status_id = painter_data.progoti_status_id;

    //console.log(painter_name); return;
    const get_user_id = await this.knex(this.apps_progoti_details_tbl)
      .where('id', progoti_status_id)
      .select('name as p_name');
    //let progoti_name = get_user_id[0].p_name;

    let progoti_name = get_user_id[0].p_name;

    const timestamp = Date.now();
    const insert = await this.knex(this.apps_painter_tbl).insert({
      painter_code: painter_code,
      painter_name: painter_name,
      nid: nid,
      contact: contact,
      address: address,
      company_type: company_type,
      progoti_status_id: progoti_status_id,
      progoti_status: progoti_name,
    });
    let last_insert_id = insert[0];
    let cluster = painter_data.cluster;
    this.insertLocationByClusterId(cluster, last_insert_id);

    const return_message = {
      data: 1,
      msg: 'Painter Added Succesfully',
      success: false,
    };
    return return_message;
  }

  async uploadBulkPainter(file) {

    const readXlsxFile = require('read-excel-file/node');
    const response = await readXlsxFile(file.path);
    const result = await response;

    const headers = result[0];
    const header_arr = [
      'id',
      'painter_code',
      'painter_name',
      'contact',
      'nid',
      'address',
      'progoti_status',
      'company_id',
      'company_name',
      'cluster',
      'cluster_name'
    ];
    let match_header = headers.filter(x => !header_arr.includes(x));
	//console.log(match_header); return;
    if (match_header.length !== 0) {
      const returnData = {
        data: 1,
        duplicate_code: [],
        excel_header_missing: 1,
        msg: 'Painter has not insert succesfully because of header mismatch',
        success: true,
      };
      return returnData;
    }
    const userData = result.slice(1);
    let duplicateUserArr = new Array();
    let statusArr = new Array();

    for (let index = 0; index < userData.length; index++) {
      const element = userData[index];
      const eachUserObj = {};
      headers.forEach(function (k, i) {
        eachUserObj[k] = element[i];
      });

      let result = await this.painterAction(eachUserObj);

      if (result.flag !== 1) {
        duplicateUserArr.push(result.code);
        statusArr.push(result.status);
      }
    }
    let message_status = '';
    if (statusArr.includes('duplicate_code')) {
      message_status += 'duplicate code found,';
    }
    if (statusArr.includes('id_missing')) {
      message_status += ' id missing found';
    }
    let total_number = userData.length;
    let total_not_inserted = statusArr.length;
    let total_inserted = total_number - total_not_inserted;

    let final_msg = '';
    if (total_inserted === 0) {
      final_msg = 'Painter has not inserted because of ' + message_status;
    } else {
      final_msg = 'Painter has  inserted succesfully.' + message_status;
    }
    const fs = require('fs');
    fs.unlinkSync(file.path);
    const returnData = {
      data: 1,
      is_id_missing: 0,
      duplicate_code: duplicateUserArr,
      msg: final_msg,
      success: true,
    };
    return returnData;
  }

  async painterAction(user_data) {

    const check_painter = await this.knex(this.apps_painter_tbl)
      .where('painter_code', user_data.painter_code)
      .andWhere('company_type', user_data.company_id)
      .count('id as total');

    let total_painter = check_painter[0].total;

    if (total_painter > 0) {
      const returnData = {
        status: 'duplicate_code',
        code: user_data.painter_code,
        flag: 0,
      };
	  //console.log('1');
      return returnData;
    }
    let phone_numbers = await this.helperService.phnNumberCheck(user_data.contact);
    let painter_nid = user_data.nid;
    if (user_data.nid == 'undefined' || !user_data.nid) {
      painter_nid = 0;
    }

    let painter_code = user_data.painter_code;
    let painter_name = user_data.painter_name;
    let nid = painter_nid;
    let contact = phone_numbers;
    let address = user_data.address;
    let progoti_status = user_data.progoti_status;    
    let cluster = user_data.cluster;
    if (typeof cluster != 'undefined' && cluster) {
      const qry = await this.knex(this.apps_progoti_details_tbl)
        .where('name', user_data.progoti_status)
        .select('id as progoti_id');

      let progoti_status_id = qry[0].progoti_id;

      let company_type = user_data.company_id;

      const timestamp = Date.now();
      const insert = await this.knex(this.apps_painter_tbl).insert({
        painter_code: painter_code,
        painter_name: painter_name,
        nid: nid,
        contact: contact,
        address: address,
        progoti_status_id: progoti_status_id,
        progoti_status: progoti_status,
        company_type: company_type,
      });

      let last_insert_id = insert[0];
      this.insertLocationByClusterId(cluster, last_insert_id);
      const returnData = {
        status: 'done',
        code: '',
        flag: 1,
      };
	   //console.log('2');
      return returnData;
    }
  }
  async getProgotiId(progotiName) {
    const qry = await this.knex(this.apps_progoti_details_tbl)
      .where('name', progotiName)
      .select('id ');

    let progotiId = qry[0].id;
    return progotiId;
  }

  async removeFile(path) {
    const fs = require('fs');
    try {
      fs.unlinkSync(path);
    } catch (err) {
      console.error(err);
    }
  }

  /* Edit Bulk Painter */
  async uploadEditedBulkPainter(file) {

    const readXlsxFile = require('read-excel-file/node');
    const response = await readXlsxFile(file.path);
    const result = await response;

    const headers = result[0];

    const header_arr = [
      'id',
      'painter_code',
      'painter_name',
      'contact',
      'nid',
      'address',
      'progoti_status',
      'company_id',
      'company_name',
      'cluster',
      'cluster_name'
    ];

    let match_header = headers.filter(x => !header_arr.includes(x));

    if (match_header.length !== 0) {
      const returnData = {
        data: 1,
        duplicate_code: [],
        excel_header_missing: 1,
        msg: 'Painter has not updated succesfully because of header mismatch',
        success: true,
      };
      return returnData;
    }

    const userData = result.slice(1);
    let duplicateUserArr = new Array();
    let statusArr = new Array();

    for (let index = 0; index < userData.length; index++) {
      const element = userData[index];
      const eachUserObj = {};
      headers.forEach(function (k, i) {
        eachUserObj[k] = element[i];
      });

      let result = await this.painterEditAction(eachUserObj);

      if (result.flag !== 1) {
        duplicateUserArr.push(result.code);
        statusArr.push(result.status);
      }
    }

    let message_status = '';
    if (statusArr.includes('duplicate_code')) {
      message_status += 'duplicate code found,';
    }
    if (statusArr.includes('id_missing')) {
      message_status += ' id missing found';
    }


    let total_number = userData.length;
    let total_not_inserted = statusArr.length;
    let total_inserted = total_number - total_not_inserted;

    let final_msg = '';
    if (total_inserted === 0) {
      final_msg = 'Painter has not updated because of ' + message_status;
    } else {
      final_msg = 'Painter has updated succesfully.' + message_status;
    }

    this.removeFile(file.path);
    const returnData = {
      data: 1,
      duplicate_code: duplicateUserArr,
      excel_header_missing: '',
      msg: final_msg,
      success: true,
    };
    return returnData;
  }

  async painterEditAction(user_data) {
    //console.log(user_data); return;
    // return;
    if (typeof user_data.id == 'undefined' && !user_data.id || user_data.id == 0) {
      const returnData = {
        status: 'id_missing',
        code: user_data.painter_code,
        flag: 0,
      };

      return returnData;
    }

    const check_painter = await this.knex(this.apps_painter_tbl)
      .where('id', user_data.id)
      .andWhere('company_type', user_data.company_id)
      .andWhere('id', '<>', user_data.id)
      .count('id as total');

    let total_painter = check_painter[0].total;

    if (total_painter > 0) {
      const returnData = {
        status: 'duplicate_code',
        code: user_data.painter_code,
        flag: 0,
      };
      return returnData;
    }

    let phone_numbers = await this.helperService.phnNumberCheck(user_data.contact);
    let nid = 0;
    let painter_code = user_data.painter_code;
    let painter_name = user_data.painter_name;
    if (typeof user_data.nid != 'undefined' && user_data.nid) {
      nid = user_data.nid;
    }

    let contact = phone_numbers;
    let address = user_data.address;
    let progoti_status = user_data.progoti_status;

    let cluster = user_data.cluster;
    if (typeof cluster != 'undefined' && cluster) {
      //let progoti_status_id = this.getProgotiId(progoti_status);
      const qry = await this.knex(this.apps_progoti_details_tbl)
        .where('name', user_data.progoti_status)
        .select('id as progoti_id');

      let progoti_status_id = qry[0].progoti_id;
      let company_type = user_data.company_id;

      const timestamp = Date.now();

      const update_user = await this.knex(this.apps_painter_tbl)
        .where('painter_code', painter_code)
        .update({
          painter_name: painter_name,
          nid: nid,
          contact: contact,
          address: address,
          progoti_status_id: progoti_status_id,
          progoti_status: progoti_status,
          company_type: company_type,
        });

      const get_painter_id = await this.knex(this.apps_painter_tbl)
        .where('painter_code', user_data.painter_code)
        .select('id as p_id');
      if (typeof get_painter_id != 'undefined' && get_painter_id) {
        let painter_id = get_painter_id[0].p_id;

        let clusterIds = user_data.cluster;
        let clusterStr = '';
        if (typeof clusterIds === 'string') {
          clusterStr = clusterIds;
        } else {
          clusterStr = clusterIds.toString();
        }
        const clusterIdArr = clusterStr.split(',');

        let tbl = this.apps_painter_location_tbl;
        let uid = painter_id;
        let columnName = 'painter_id';
        const updateLoc = await this.helperService.getInsertAndInactiveLocation(clusterIdArr, tbl, columnName, uid);
        //return;
        let inActivateCluster = updateLoc['deactivate_cluster'];
        let insertedCluster = updateLoc['insert_cluster'];
        if (inActivateCluster.length != 0) {
          const inActiveLocation = await this.helperService.inactiveLocation(inActivateCluster, tbl, columnName, uid);
        }
        if (insertedCluster.length != 0) {
          this.insertLocationByClusterId(insertedCluster, painter_id);
        }
      }

    }
    const returnData = {
      status: 'done',
      code: '',
      flag: 1,
    };
    return returnData;
  }

  async insertLocationByClusterId(clusterId, last_insert_id) {


    let clusterStr = '';
    if (typeof clusterId === 'string') {
      clusterStr = clusterId;
    } else {
      clusterStr = clusterId.toString();
    }
    const clusterIdArr = clusterStr.split(',');
    if (clusterIdArr.length != 0) {
      const updateLoc = await this.helperService.updateLocation(clusterIdArr);
      const locations = await this.knex('cluster')
        .innerJoin('region', 'region.id', '=', 'cluster.region_id')
        .innerJoin('area', 'area.id', '=', 'cluster.area_id')
        .innerJoin('territory', 'territory.id', '=', 'cluster.territory_id')
        .whereIn('cluster.id', clusterIdArr)
        .select(
          'cluster.id as cluster_id',
          'cluster.cluster_name',
          'cluster.cluster_code',
          'region.id as region_id',
          'region.region_name',
          'region.region_code',
          'area.id as area_id',
          'area.area_name',
          'area.area_code',
          'territory.id as territory_id',
          'territory.territory_name',
          'territory.territory_code',
        );
      let locObj = [];
      locations.forEach(async (val, key) => {
        let locInfo = {};
        locInfo['painter_id'] = last_insert_id;
        locInfo['cluster'] = val.cluster_id;
        locInfo['territory'] = val.territory_id;
        locInfo['area'] = val.area_id;
        locInfo['region'] = val.region_id;
        locObj.push(locInfo);
      });
      const location_insert = await this.knex(this.apps_painter_location_tbl).insert(
        locObj,
      );
      return location_insert ? 1 : 0;
    }
  }

  async uploadDeleteBulkPainter(file) {

    const readXlsxFile = require('read-excel-file/node');
    const response = await readXlsxFile(file.path);
    const result = await response;

    const headers = result[0];
    const userData = result.slice(1);
    let duplicateUserArr = new Array();
    let statusArr = new Array();

    for (let index = 0; index < userData.length; index++) {
      const element = userData[index];
      const eachUserObj = {};
      headers.forEach(function (k, i) {
        // if (k === 'painter_code') {
        eachUserObj[k] = element[i];
        // }
      });
      let result = await this.bulkPainterDeleteAction(eachUserObj);
      if (result.flag !== 1) {
        duplicateUserArr.push(result.code);
        statusArr.push(result.status);
      }
    }
    let message_status = '';
    if (statusArr.includes('id_missing')) {
      message_status += ' id missing found';
    }
    let total_number = userData.length;
    let total_not_inserted = statusArr.length;
    let total_inserted = total_number - total_not_inserted;

    let final_msg = '';
    if (total_inserted === 0) {
      final_msg = 'Painter has not deactivated because of ' + message_status;
    } else {
      final_msg = 'Painter has  deactivated succesfully.' + message_status;
    }
    const fs = require('fs');
    fs.unlinkSync(file.path);
    const returnData = {
      data: 1,
      duplicate_code: duplicateUserArr,
      excel_header_missing: '',
      msg: final_msg,
      success: true,
    };
    //console.log(returnData);
    return returnData;
  }

  async bulkPainterDeleteAction(data) {
    //console.log(data.painter_code);
    if (typeof data.id == 'undefined' && !data.id || data.id == 0) {
      const returnData = {
        status: 'id_missing',
        code: data.painter_code,
        flag: 0,
      };
      return returnData;
    }

    const update_user = await this.knex(this.apps_painter_tbl)
      .where('id', data.id)
      .update({
        status: 'In-Active',
      });
      
    const returnData = {
      status: 'done',
      code: '',
      flag: 1,
    };

    //console.log(returnData);
    return returnData;
  }

  async deleteSinglePainter(painter_id) {
    const update_user = await this.knex(this.apps_painter_tbl)
      .where('id', painter_id)
      .update({
        status: 'In-Active',
      });
    const returnData = {
      data: 1,
      msg: 'Painter Deleted Succesfully',
      success: true,
    };
    return returnData;
  }

  async activeSinglePainter(painter_id) {
    const update_user = await this.knex(this.apps_painter_tbl)
      .where('id', painter_id)
      .update({
        status: 'Registered',
      });
    const returnData = {
      data: 1,
      msg: 'Painter Active Succesfully',
      success: true,
    };
    return returnData;
  }
}
