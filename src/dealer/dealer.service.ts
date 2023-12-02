import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION, NestjsKnexService } from 'nestjs-knexjs';
import { DealerDto } from './dealer.dto';
import { HelperService } from '../core/helper.services'
const excel = require('exceljs');

@Injectable()
export class DealerService {
  storeUserInfo(dealerDto: DealerDto): any {
    throw new Error('Method not implemented.');
  }
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex, private readonly helperService: HelperService) { }

  private apps_dealer_tbl = 'apps_dealer';
  private apps_dealer_location_tbl = 'apps_dealer_location';

  async getDealerList() {
    const dealers = await this.knex(this.apps_dealer_tbl)
      .innerJoin(this.apps_dealer_location_tbl, this.apps_dealer_tbl + '.id', '=', this.apps_dealer_location_tbl + '.dealer_id')
      .innerJoin('cluster', 'cluster.id', '=', this.apps_dealer_location_tbl + '.cluster')
      .innerJoin('region', 'region.id', '=', 'cluster.region_id')
      .innerJoin('area', 'area.id', '=', 'cluster.area_id')
      .innerJoin('territory', 'territory.id', '=', 'cluster.territory_id')
      .innerJoin('companies_t', 'companies_t.id', '=', this.apps_dealer_tbl + '.company_type',)
      .where(this.apps_dealer_location_tbl + '.status', 'Active')
      //.where(this.apps_dealer_tbl + '.status', 'Active')
      //.andWhere(this.apps_dealer_location_tbl + '.status', 'Active')
      .select(
        this.knex.raw(
          this.apps_dealer_tbl + '.*,companies_t.company_name,GROUP_CONCAT( DISTINCT cluster.cluster_name ) AS cluster,GROUP_CONCAT( DISTINCT cluster.id ) AS cluster_id,GROUP_CONCAT( DISTINCT region.region_name ) AS region,GROUP_CONCAT( DISTINCT region.id ) AS region_id,GROUP_CONCAT( DISTINCT area.area_name ) AS area,GROUP_CONCAT( DISTINCT area.id ) AS area_id,GROUP_CONCAT( DISTINCT territory.territory_name ) AS territory,GROUP_CONCAT( DISTINCT territory.id ) AS territory_id ',
        ),
      ).groupBy(this.apps_dealer_tbl + '.id');
    const obj = { dealer_list: dealers };
    //console.log(obj);
    return obj;
  }

  async getDealerDump(response) {
    let company_type = [1, 2];
    const dealers = await this.knex('apps_dealer')
      .innerJoin('apps_dealer_location', 'apps_dealer.id', '=', 'apps_dealer_location.dealer_id')
      .innerJoin('cluster', 'cluster.id', '=', 'apps_dealer_location.cluster')
      .innerJoin('region', 'region.id', '=', 'cluster.region_id')
      .innerJoin('area', 'area.id', '=', 'cluster.area_id')
      .innerJoin('territory', 'territory.id', '=', 'cluster.territory_id')
      .whereIn('apps_dealer.company_type', company_type)
      .andWhere('apps_dealer.status', 'Active')
      .andWhere('apps_dealer_location.status', 'Active')
      .select(
        this.knex.raw(
          'apps_dealer.id,apps_dealer.dealer_code,apps_dealer.dealer_name,apps_dealer.contact,apps_dealer.address,apps_dealer.company_type,CASE WHEN apps_dealer.company_type = 1 THEN "Apec Buddy" WHEN apps_dealer.company_type = 2 THEN "Ezzy Painter" WHEN apps_dealer.company_type = 3 THEN "Wake Up (TSI App)" ELSE "Project Sales" END AS company_name,apps_dealer.STATUS as status,apps_dealer_location.cluster as cluster,cluster.cluster_name as cluster_name,apps_dealer_location.territory as territory,territory.territory_name as territory_name,apps_dealer_location.area as area,area.area_name as area_name,apps_dealer_location.region as region,region.region_name as region_name',
        ),
      );

    let data = [];
    const name = 'ActiveDealerList with location (Apecbuddy Ezypainter)';
    const headers = [
      { header: 'id', key: 'id', width: 20 },
      { header: 'dealer_code', key: 'dealer_code', width: 20 },
      { header: 'dealer_name', key: 'dealer_name', width: 20 },
      { header: 'contact', key: 'contact', width: 20 },
      { header: 'address', key: 'address', width: 20 },

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

    return this.generateExcelReport(response, name, headers, dealers);
  }

  async getWakeUpDealerDump(response) {
    let company_type = [1, 2];
    const dealers = await this.knex('apps_dealer')
      .innerJoin('apps_dealer_location', 'apps_dealer.id', '=', 'apps_dealer_location.dealer_id')
      .innerJoin('cluster', 'cluster.id', '=', 'apps_dealer_location.cluster')
      .innerJoin('region', 'region.id', '=', 'cluster.region_id')
      .innerJoin('area', 'area.id', '=', 'cluster.area_id')
      .innerJoin('territory', 'territory.id', '=', 'cluster.territory_id')
      .where('apps_dealer.company_type', 1)
      .andWhere('apps_dealer.status', 'Active')
      .andWhere('apps_dealer_location.status', 'Active')
      .select(
        this.knex.raw(
          'apps_dealer.id,apps_dealer.dealer_code,apps_dealer.dealer_name,apps_dealer.contact,apps_dealer.address,apps_dealer.company_type,CASE WHEN apps_dealer.company_type = 1 THEN "Apec Buddy" WHEN apps_dealer.company_type = 2 THEN "Ezzy Painter" WHEN apps_dealer.company_type = 3 THEN "Wake Up (TSI App)" ELSE "Project Sales" END AS company_name,apps_dealer.STATUS as status,apps_dealer_location.cluster as cluster,cluster.cluster_name as cluster_name,apps_dealer_location.territory as territory,territory.territory_name as territory_name,apps_dealer_location.area as area,area.area_name as area_name,apps_dealer_location.region as region,region.region_name as region_name',
        ),
      );

    let data = [];
    const name = 'DealerListWithLocation (Customer WakeUp))';
    const headers = [
      { header: 'id', key: 'id', width: 20 },
      { header: 'dealer_code', key: 'dealer_code', width: 20 },
      { header: 'dealer_name', key: 'dealer_name', width: 20 },
      { header: 'contact', key: 'contact', width: 20 },
      { header: 'address', key: 'address', width: 20 },

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

    return this.generateExcelReport(response, name, headers, dealers);
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


  async storeDealerInfo(dealer_data) {

    /*
    const check_dealer = await this.knex(this.apps_dealer_tbl)
      .where((query) => {
        query.where('dealer_code', dealer_data.dealer_code)
          .orWhere('dealer_name', dealer_data.dealer_name)
      })
      .count('id as total_dealer');
    let total_row = check_dealer[0].total_dealer;

   
    if (total_row > 0) {
      return dealer_data.dealer_code;
    };
   
    */
    //console.log(dealer_data.company_id); return;
    const check_dealer = await this.knex(this.apps_dealer_tbl)
      .where('dealer_code', dealer_data.dealer_code)
      .andWhere('company_type', dealer_data.company_type)
      .count('id as total');

    let total_dealer = check_dealer[0].total;

    if (total_dealer > 0) {
      const return_message = {
        data: 1,
        duplicate: 'yes',
        duplicate_code: dealer_data.dealer_code,
        msg: 'Dealer has not added succesfully for duplicate',
        success: false,
      };
      console.log(return_message);
      return return_message;
    }
    let phone_numbers = await this.helperService.phnNumberCheck(dealer_data.contact);
    let dealer_nid = dealer_data.nid;
    if (dealer_data.nid == 'undefined' || !dealer_data.nid) {
      dealer_nid = 0;
    }

    let dealer_code = dealer_data.dealer_code;
    let dealer_name = dealer_data.dealer_name;
    let nid = dealer_nid;
    let contact = phone_numbers;
    let address = dealer_data.address;
    let company_type = dealer_data.company_type;

    const timestamp = Date.now();
    const insert = await this.knex(this.apps_dealer_tbl).insert({
      dealer_code: dealer_code,
      dealer_name: dealer_name,
      nid: nid,
      contact: contact,
      address: address,
      company_type: company_type,
    });

    let last_insert_id = insert[0];
    let cluster = dealer_data.cluster;
    if (typeof cluster !== 'undefined' && !cluster || cluster.length != 0) {
      this.insertLocationByClusterId(cluster, last_insert_id);
    }

    const return_message = {
      data: 1,
      msg: 'Dealer Added Succesfully',
      success: false,
    };
    return return_message;
  }

  async updateDealerInfo(dealer_data) {
    //console.log(dealer_data); return;
    const check_dealer = await this.knex(this.apps_dealer_tbl)
      .where('dealer_code', dealer_data.dealer_code)
      .andWhere('company_type', dealer_data.company_type)
      .andWhere('id', '<>', dealer_data.id)
      .count('id as total');

    let total_dealer = check_dealer[0].total;
    if (total_dealer > 0) {
      const return_message = {
        data: 1,
        is_duplicate: 1,
        msg: 'Dealer has not updated succesfully because of duplicate.',
        stat: true,
      };
      return return_message;
    }
    let phone_numbers = await this.helperService.phnNumberCheck(dealer_data.contact);
    let dealer_nid = dealer_data.nid;
    if (dealer_data.nid == 'undefined' || !dealer_data.nid) {
      dealer_nid = 0;
    }
    let id = dealer_data.id;
    let dealer_code = dealer_data.dealer_code;
    let dealer_name = dealer_data.dealer_name;
    let nid = dealer_nid;
    let contact = phone_numbers;
    let address = dealer_data.address;
    let company_type = dealer_data.company_type;
    let cluster = dealer_data.cluster;

    const update_dealer = await this.knex(this.apps_dealer_tbl)
      .where('id', id)
      .update({
        dealer_code: dealer_code,
        dealer_name: dealer_name,
        nid: nid,
        contact: contact,
        address: address,
        company_type: company_type,
      });

    let dealer_id = id;

    if (typeof cluster !== 'undefined' && !cluster || cluster.length != 0) {

      let clusterStr = '';
      if (typeof cluster === 'string') {
        clusterStr = cluster;
      } else {
        clusterStr = cluster.toString();
      }
      /* for update, insert locations. */
      const clusterIdArr = clusterStr.split(',');
      let tbl = this.apps_dealer_location_tbl;
      let u_id = dealer_id;
      let columnName = 'dealer_id';
      const updateLoc = await this.helperService.getInsertAndInactiveLocation(clusterIdArr, tbl, columnName, u_id);
      //return;
      let inActivateCluster = updateLoc['deactivate_cluster'];
      let insertedCluster = updateLoc['insert_cluster'];
      if (inActivateCluster.length != 0) {
        const inActiveLocation = await this.helperService.inactiveLocation(inActivateCluster, tbl, columnName, u_id);
      }
      if (insertedCluster.length != 0) {
        this.insertLocationByClusterId(insertedCluster, dealer_id);
      }
    } else {
      let tbl = this.apps_dealer_location_tbl;
      let u_id = dealer_id;
      let columnName = 'dealer_id';
      await this.helperService.inactiveLocationById(tbl, columnName, u_id);
    }


    const return_message = {
      data: 1,
      is_duplicate: 0,
      msg: 'Dealer has updated succesfully.',
      stat: true,
    };
    return return_message;
  }

  async uploadBulkDealer(file) {

    const readXlsxFile = require('read-excel-file/node');
    const response = await readXlsxFile(file.path);
    const result = await response;

    const headers = result[0];
    let header_arr = [
      'id',
      'dealer_code',
      'dealer_name',
      'contact',
      'address',
      'nid',
      'company_id',
      'company_name',
      'status',
      'cluster',
      'cluster_name'
    ];

    let match_header = headers.filter(x => !header_arr.includes(x));
    if (match_header.length != 0) {
      const returnData = {
        data: 1,
        duplicate_code: [],
        excel_header_missing: 1,
        msg: 'Dealer has not inserted succesfully because of header mismatch',
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

      let result = await this.dealerAction(eachUserObj);

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
      final_msg = 'Dealer has not inserted because of ' + message_status;
    } else {
      final_msg = 'Dealer has  inserted succesfully.' + message_status;
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
    //console.log(returnData);
    return returnData;
  }
  async removeFile(path) {
    const fs = require('fs');
    try {
      fs.unlinkSync(path);
    } catch (err) {
      console.error(err);
    }
  }

  async dealerAction(user_data) {
    // console.log(user_data); return;

    const check_dealer = await this.knex(this.apps_dealer_tbl)
      .where('dealer_code', user_data.dealer_code)
      .andWhere('company_type', user_data.company_id)
      .count('id as total');

    let total_dealer = check_dealer[0].total;

    if (total_dealer > 0) {
      const returnData = {
        status: 'duplicate_code',
        code: user_data.dealer_code,
        flag: 0,
      };
      return returnData;
    }
    let phone_numbers = await this.helperService.phnNumberCheck(user_data.contact);

    let dealer_nid = user_data.nid;
    if (user_data.nid == 'undefined' || !user_data.nid) {
      dealer_nid = 0;
    }

    let dealer_code = user_data.dealer_code;
    let dealer_name = user_data.dealer_name;
    let nid = dealer_nid;
    let contact = phone_numbers;
    let address = user_data.address;
    let company_type = user_data.company_id;
    let cluster = user_data.cluster;
    //console.log('cluster', cluster);
    if (typeof cluster != 'undefined' && cluster) {
      const timestamp = Date.now();
      const insert = await this.knex(this.apps_dealer_tbl).insert({
        dealer_code: dealer_code,
        dealer_name: dealer_name,
        nid: nid,
        contact: contact,
        address: address,
        company_type: company_type,
      });
      let last_insert_id = insert[0];
      this.insertLocationByClusterId(cluster, last_insert_id);
      const returnData = {
        status: 'done',
        code: '',
        flag: 1,
      };
      return returnData;
    }
  }

  async insertLocationByClusterId(clusterId, last_insert_id) {
    let clusterStr = '';
    if (typeof clusterId === 'string') {
      clusterStr = clusterId;
    } else {
      clusterStr = clusterId.toString();
    }
    const clusterIdArr = clusterStr.split(',');
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
      locInfo['dealer_id'] = last_insert_id;
      locInfo['cluster'] = val.cluster_id;
      locInfo['territory'] = val.territory_id;
      locInfo['area'] = val.area_id;
      locInfo['region'] = val.region_id;
      locObj.push(locInfo);
    });

    const location_insert = await this.knex(this.apps_dealer_location_tbl).insert(
      locObj,
    );
    const returnData = {
      status: 'done',
      code: '',
      flag: 1,
    };
    return returnData;
  }

  async deleteDealer(dealer_id) {
    const update_user = await this.knex(this.apps_dealer_tbl)
      .where('id', dealer_id)
      .update({
        status: 'In-active',
      });

    let tbl = this.apps_dealer_location_tbl;
    let u_id = dealer_id;
    let columnName = 'dealer_id';
    // await this.helperService.inactiveLocationById(tbl, columnName, u_id);
    const return_message = {
      data: 1,
      msg: 'Dealer has deleted succesfully.',
      stat: true,
    };
    return return_message;
  }

  async activeDealer(dealer_id) {
    const update_user = await this.knex(this.apps_dealer_tbl)
      .where('id', dealer_id)
      .update({
        status: 'Active',
      });
    const return_message = {
      data: 1,
      msg: 'Dealer has activated succesfully.',
      stat: true,
    };
    return return_message;
  }
  /* Edit Bulk Painter */
  async uploadEditedBulkDealer(file) {
    const readXlsxFile = require('read-excel-file/node');
    const response = await readXlsxFile(file.path);
    const result = await response;

    const headers = result[0];
    let header_arr = [
      'id',
      'dealer_code',
      'dealer_name',
      'contact',
      'address',
      'nid',
      'company_id',
      'company_name',
      'status',
      'cluster',
      'cluster_name'
    ];
    let match_header = headers.filter(x => !header_arr.includes(x));
    if (match_header.length != 0) {
      const returnData = {
        data: 1,
        duplicate_code: [],
        excel_header_missing: 1,
        msg: 'Dealer has not updated succesfully because of header mismatch',
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

      let result = await this.dealerEditAction(eachUserObj);

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
      final_msg = 'Dealer has not updated because of ' + message_status;
    } else {
      final_msg = 'Dealer has  updated succesfully. But' + message_status;
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
    return returnData;
  }

  async dealerEditAction(dealer_data) {

    if (typeof dealer_data.id == 'undefined' && !dealer_data.id || dealer_data.id == 0) {
      const returnData = {
        status: 'id_missing',
        code: dealer_data.painter_code,
        flag: 0,
      };

      return returnData;
    }

    const check_dealer = await this.knex(this.apps_dealer_tbl)
      .where('dealer_code', dealer_data.dealer_code)
      .andWhere('company_type', dealer_data.company_id)
      .andWhere('id', '<>', dealer_data.id)
      .count('id as total');

    let total_dealer = check_dealer[0].total;

    if (total_dealer > 0) {
      const returnData = {
        status: 'duplicate_code',
        code: dealer_data.dealer_code,
        flag: 0,
      };
      return returnData;
    }
    let phone_numbers = await this.helperService.phnNumberCheck(dealer_data.contact);

    let dealer_nid = dealer_data.nid;
    if (dealer_data.nid == 'undefined' || !dealer_data.nid) {
      dealer_nid = 0;
    }

    //let id = dealer_data.id;
    let dealer_code = dealer_data.dealer_code;
    let dealer_name = dealer_data.dealer_name;
    let nid = dealer_nid;
    let contact = phone_numbers;
    let address = dealer_data.address;
    let company_type = dealer_data.company_type;
    let cluster = dealer_data.cluster;
    if (typeof cluster != 'undefined' && cluster) {
      const update_dealer = await this.knex(this.apps_dealer_tbl)
        .where('dealer_code', dealer_code)
        .update({
          dealer_code: dealer_code,
          dealer_name: dealer_name,
          nid: nid,
          contact: contact,
          address: address,
          company_type: company_type,
        });

      const get_dealer_id = await this.knex(this.apps_dealer_tbl)
        .where('dealer_code', dealer_code)
        .select('id as dealer_id');
      let dealer_id = get_dealer_id[0].dealer_id;

      let clusterStr = '';
      if (typeof cluster === 'string') {
        clusterStr = cluster;
      } else {
        clusterStr = cluster.toString();
      }

      /* for update, insert locations. */
      const clusterIdArr = clusterStr.split(',');
      let tbl = this.apps_dealer_location_tbl;
      let u_id = dealer_id;
      let columnName = 'dealer_id';
      const updateLoc = await this.helperService.getInsertAndInactiveLocation(clusterIdArr, tbl, columnName, u_id);
      //return;
      let inActivateCluster = updateLoc['deactivate_cluster'];
      let insertedCluster = updateLoc['insert_cluster'];
      if (inActivateCluster.length != 0) {
        const inActiveLocation = await this.helperService.inactiveLocation(inActivateCluster, tbl, columnName, u_id);
      }
      //console.log(clusterStr); return;

      if (insertedCluster.length != 0) {
        this.insertLocationByClusterId(insertedCluster, dealer_id);
      }
      const returnData = {
        status: 'done',
        code: '',
        flag: 1,
      };
      return returnData;
    }
  }

  /* bulk_delete */
  async uploadDeleteBulkDealer(file) {

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
        //if (k === 'dealer_code') {
        eachUserObj[k] = element[i];
        //}
      });
      //console.log(eachUserObj);
      let result = await this.bulkDealerDeleteAction(eachUserObj);

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
      final_msg = 'Dealer has not deactivated because of ' + message_status;
    } else {
      final_msg = 'Dealer has  deactivated succesfully.' + message_status;
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

  async bulkDealerDeleteAction(data) {
    //console.log(data.id); 
    if (typeof data.id == 'undefined' && !data.id || data.id == 0) {
      const returnData = {
        status: 'id_missing',
        code: data.dealer_code,
        flag: 0,
      };
      return returnData;
    }

    const update_user = await this.knex(this.apps_dealer_tbl)
      .where('id', data.id)
      .update({
        status: 'In-Active',
      });

    /* for dealer location delete */
    const get_dealer_id = await this.knex(this.apps_dealer_tbl)
      .where('dealer_code', data.dealer_code)
      .select('id as dealer_id');
    let dealer_id = get_dealer_id[0].dealer_id;

    let tbl = this.apps_dealer_location_tbl;
    let u_id = dealer_id;
    let columnName = 'dealer_id';
    // await this.helperService.inactiveLocationById(tbl, columnName, u_id);
    const returnData = {
      status: 'done',
      code: '',
      flag: 1,
    };

    //console.log(returnData);
    return returnData;
  }
}
