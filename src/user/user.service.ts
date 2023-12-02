import { Inject, Injectable } from '@nestjs/common';
import { response } from 'express';
import { Knex } from 'knex';
import { KNEX_CONNECTION, NestjsKnexService } from 'nestjs-knexjs';
import { setEnvironmentData } from 'worker_threads';
import * as bcrypt from 'bcrypt';
import { HelperService } from '../core/helper.services';
const excel = require('exceljs');

let data = [];
@Injectable()
export class UserService {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly helperService: HelperService,
  ) { }
  private user_tbl = 'sys_users';
  private user_location_access = 'user_location_access';
  private sys_privilege_levels_table = 'sys_privilege_levels';
  private sys_user_levels_table = 'sys_user_levels';

  async makeArrayLikePhp() {
    const preorder = await this.knex
      .select('rtlid AS retailer_id', 'skid', 'route_id', 'retailer_code')
      .from('mc_query_manager_table')
      .groupBy('rtlid');

    const delivery = await this.knex
      .select('retailer_id', 'skid', 'dpid')
      .from('mc_pre_order_data')
      .groupBy('retailer_id');

    let deliveryObj = [];
    delivery.forEach(async (val, key) => {
      let deliveryInfo = {};
      let rtlid = val.retailer_id;
      //let rtlid = val.retailer_id;
      let obj = {
        skid: val.skid,
        dpid: val.dpid,
        retailer_id: val.retailer_id,
      };
      deliveryInfo[rtlid] = obj;
      deliveryObj.push(deliveryInfo);
    });

    let finalObj = [];
    let final_arr = [];

    preorder.forEach(async (val, key) => {
      let finalInfo = {};
      let retailer_id = val.retailer_id;
      let routeId = val.route_id;
      let eachDpid = 0;

      final_arr[routeId] = val.skid;
      //final_arr[routeId][retailer_id]['dpid']=val.dpid;
      // if (deliveryObj[retailer_id].retailer_id === retailer_id) {
      //   eachDpid = deliveryObj[retailer_id].dpid;
      // }
      let obj = {
        skid: val.skid,
        route_id: val.route_id,
        dpid: eachDpid,
      };
      finalInfo[retailer_id] = obj;
      finalObj.push(finalInfo);
    });
    console.log(final_arr);
  }

  async getUserList() {
    const users = await this.knex(this.user_tbl)
      .innerJoin(this.user_location_access, this.user_tbl + '.id', '=', this.user_location_access + '.user_id',)
      .innerJoin('cluster', 'cluster.id', '=', this.user_location_access + '.cluster',)
      .innerJoin('region', 'region.id', '=', 'cluster.region_id')
      .innerJoin('area', 'area.id', '=', 'cluster.area_id')
      .innerJoin('territory', 'territory.id', '=', 'cluster.territory_id')
      .innerJoin('companies_t', 'companies_t.id', '=', this.user_tbl + '.company_type',
    )
      .where(this.user_location_access + '.status', 'Active')
      //.where(this.user_tbl + '.status', 'Active')
      //.andWhere(this.user_location_access + '.status', 'Active')
      .select(
        this.knex.raw(
          this.user_tbl +
          '.*,companies_t.company_name,GROUP_CONCAT( DISTINCT cluster.cluster_name ) AS cluster,GROUP_CONCAT( DISTINCT cluster.id ) AS cluster_id,GROUP_CONCAT( DISTINCT region.region_name ) AS region,GROUP_CONCAT( DISTINCT region.id ) AS region_id,GROUP_CONCAT( DISTINCT area.area_name ) AS area,GROUP_CONCAT( DISTINCT area.id ) AS area_id,GROUP_CONCAT( DISTINCT territory.territory_name ) AS territory,GROUP_CONCAT( DISTINCT territory.id ) AS territory_id ',
        ),
      )
      .groupBy(this.user_tbl + '.id');
    const obj = { user_list: users };
    return obj;
  }

  async getUserDump(response) {
    let company_type = [1, 2];
    const users = await this.knex('sys_users')
      .innerJoin('user_location_access ', 'sys_users.id', '=', 'user_location_access .user_id',)
      .innerJoin('cluster', 'cluster.id', '=', 'user_location_access .cluster',)
      .innerJoin('region', 'region.id', '=', 'cluster.region_id')
      .innerJoin('area', 'area.id', '=', 'cluster.area_id')
      .innerJoin('territory', 'territory.id', '=', 'cluster.territory_id')
      .innerJoin('companies_t', 'companies_t.id', '=', 'sys_users.company_type',
    )
      .whereIn('sys_users.company_type', company_type)
      .andWhere('user_location_access .status', 'Active')
      .andWhere('sys_users.status', 'Active')
      .select(
        this.knex.raw(
          'sys_users.id,sys_users.user_code,sys_users.username,sys_users.email,sys_users.NAME as name,sys_users.mobile,sys_users.default_module_id AS default_module,sys_users.STATUS as status,sys_users.user_level,sys_users.user_level_id,sys_users.user_level_name,sys_users.company_type,companies_t.company_name as company_name,user_location_access.`status` as location_status,user_location_access.region as region,`region`.`region_name`,user_location_access.area as area,`area`.`area_name`,user_location_access.cluster as cluster,cluster.cluster_name as cluster_name,user_location_access.territory as territory,`territory`.`territory_name`',
        ),
      );
    let data = [];
    /*
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    */
    const name = 'ActiveUserList with location (Apecbuddy Ezypainter)';
    const headers = [
      { header: 'id', key: 'id', width: 20 },
      { header: 'user_code', key: 'user_code', width: 20 },
      { header: 'username', key: 'username', width: 20 },
      { header: 'email', key: 'email', width: 20 },
      { header: 'name', key: 'name', width: 20 },
      { header: 'mobile', key: 'mobile', width: 20 },
      { header: 'default_module', key: 'default_module', width: 20 },
      { header: 'status', key: 'status', width: 20 },
      { header: 'user_level', key: 'user_level', width: 20 },
      { header: 'user_level_id', key: 'user_level_id', width: 20 },
      { header: 'user_level_name', key: 'user_level_name', width: 20 },
      { header: 'company_type', key: 'company_type', width: 20 },
      { header: 'company_name', key: 'company_name', width: 20 },
      { header: 'location_status', key: 'location_status', width: 20 },
      { header: 'cluster', key: 'cluster', width: 20 },
      { header: 'cluster_name', key: 'cluster_name', width: 20 },
      { header: 'territory', key: 'territory', width: 20 },
      { header: 'territory_name', key: 'territory_name', width: 20 },
      { header: 'area', key: 'area', width: 20 },
      { header: 'area_name', key: 'area_name', width: 20 },
      { header: 'region', key: 'region', width: 20 },
      { header: 'region_name', key: 'region_name', width: 20 },
    ];

    return this.generateExcelReport(response, name, headers, users);

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

  async getPlaces() {
    const regions = await this.knex
      .select('id as region_id', 'region_name')
      .from('region');
    const area = await this.knex
      .select('id as area_id', 'area_name', 'region_id')
      .from('area');
    const territory = await this.knex
      .select('id as territory_id', 'territory_name', 'area_id')
      .from('territory');
    const cluster = await this.knex
      .select('id as cluster_id', 'cluster_name', 'territory_id')
      .from('cluster');

    const obj = {
      region: regions,
      area: area,
      territory: territory,
      cluster: cluster,
    };
    //console.log(resultArray);
    return obj;
  }

  async getLocationInfo() {
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
    const user_levels_info = await this.knex
      .select('id', 'name', 'user_level_code', 'company_type')
      .from(this.sys_user_levels_table);

    const obj = {
      region: regions,
      area: area,
      territory: territory,
      cluster: cluster,
      companies_info: companies_info,
      user_levels_info: user_levels_info,
    };
    //console.log(resultArray);
    return obj;
  }
  async storeUserInfo(user_data) {
    let storeUser = this.userInfoAction(user_data);
    return storeUser;
  }

  async getApecNationalUser() {

    const user_info = await this.knex(this.user_tbl)
      .where('user_level_id', 10)
      .orderBy('id', 'desc')
      .limit(1)
      .select('user_code');

    if (user_info.length == 0) {
      return 'NA1';
    } else {
      let user = user_info[0].user_code;
      let userArray = user.split(/([0-9]+)/);
      let max_str = parseInt(userArray[1]) + 1;
      let user_code = 'NA' + max_str;
      return user_code;
    }
  }

  async getEazzyNationalUser() {

    const user_info = await this.knex(this.user_tbl)
      .where('user_level_id', 20)
      .orderBy('id', 'desc')
      .limit(1)
      .select('user_code');

    if (user_info.length == 0) {
      return 'EZNA1';
    } else {
      let user = user_info[0].user_code;
      let userArray = user.split(/([0-9]+)/);
      let max_str = parseInt(userArray[1]) + 1;
      let user_code = 'EZNA' + max_str;
      return user_code;
    }

  }

  async getLocationByCluster(clusterIdArr) {

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
    // console.log(locations); return;
    let locObj = [];
    locations.forEach(async (val, key) => {
      let locInfo = {};

      locInfo['cluster'] = val.cluster_name;
      locInfo['cluster_id'] = val.cluster_id;
      locInfo['territory'] = val.territory_name;
      locInfo['territory_id'] = val.territory_id;
      locInfo['area'] = val.area_name;
      locInfo['area_id'] = val.area_id;
      locInfo['region'] = val.region_name;
      locInfo['region_id'] = val.region_id;
      locObj.push(locInfo);
    });
    return locObj;
  }
  async userInfoAction(user_data) {
    //console.log(user_data); return;
    const check_user = await this.knex(this.user_tbl)
      .where('user_code', user_data.user_code)
      .orWhere('username', user_data.username)
      .count('id as total_user');

    let total_user = check_user[0].total_user;

    if (total_user > 0) {
      const returnData = {
        status: 'duplicate_code',
        code: user_data.user_code,
        flag: 0,
      };
      return returnData;
    }

    let phone_numbers = await this.helperService.phnNumberCheck(user_data.mobile);

    const userLevelInfo = await this.knex('sys_user_levels')
      .where('id', user_data.user_level_id)
      .select('name', 'user_level_code');
    //console.log(phone_numbers); return;
    let user_gender = user_data.gender;

    if (user_data.gender == 'undefined' || !user_data.gender) {
      user_gender = 'Male';
    }
    let user_code = user_data.user_code;
    let name = user_data.name;
    let company_type = user_data.company_type;
    let email = user_data.email;
    let gender = user_gender;
    let mobile = phone_numbers;
    let user_level_code = user_data.user_level;
    let user_level_id = user_data.user_level_id;
    let user_level_name = user_data.user_level_name;
    let username = user_data.username;
    let default_module_id = 1;
    let password_app = 123;
    let password = '$2y$10$Mdpv8wuH7XyOR7OsA.0fQ.Qo6X5zwiitDLxe4LycvegQYRT5IxdVS';
    let cluster = user_data.cluster;

    if (typeof cluster != 'undefined' && cluster) {
      const timestamp = Date.now();

      const insert = await this.knex(this.user_tbl).insert({
        user_code: user_code,
        name: name,
        company_type: company_type,
        email: email,
        gender: gender,
        mobile: mobile,
        user_level: userLevelInfo[0].user_level_code,
        user_level_name: userLevelInfo[0].name,
        user_level_id: user_level_id,
        username: username,
        default_module_id: default_module_id,
        password_app: password_app,
        password: password,
      });

      let last_insert_id = insert[0];
      //let last_insert_id = 1;


      //console.log(cluster); return;
      this.insertLocationByClusterId(
        cluster,
        last_insert_id,
        user_level_id,
        company_type,
      );

      const location_insert = await this.knex(
        this.sys_privilege_levels_table,
      ).insert({
        users_id: last_insert_id,
        user_levels_id: user_level_id,
      });
      /*
        if (company_type == 3) {
          const location_insert = await this.knex(
            this.sys_privilege_levels_table,
          ).insert({
            users_id: last_insert_id,
            user_levels_id: user_level_id,
          });
        }
    */
      const returnData = {
        status: 'done',
        code: '',
        flag: 1,
      };
      return returnData;
    }
  }
  async getUserLevelInfo(levelId) {
    const userLevelInfo = await this.knex(this.sys_user_levels_table)
      .where('id', levelId)
      .select('name', 'user_level_code');
    return userLevelInfo;
  }

  async insertLocationByClusterId(
    clusterId,
    last_insert_id,
    user_level_id,
    company_type,
  ) {
    //console.log(clusterId); return;

    let clusterStr = '';
    if (typeof clusterId === 'string') {
      clusterStr = clusterId;
    } else {
      clusterStr = clusterId.toString();
    }
    const clusterIdArr = clusterStr.split(',');
    // console.log('cluster',clusterId); //return;
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
      locInfo['user_id'] = last_insert_id;
      locInfo['user_level_id'] = user_level_id;
      locInfo['company_type'] = company_type;
      locInfo['cluster'] = val.cluster_id;
      locInfo['territory'] = val.territory_id;
      locInfo['area'] = val.area_id;
      locInfo['region'] = val.region_id;
      locObj.push(locInfo);
    });
    // console.log(locObj); 

    const location_insert = await this.knex(this.user_location_access).insert(
      locObj,
    );

    return location_insert ? 1 : 0;
  }

  async uploadBulkUser(file) {

    const readXlsxFile = require('read-excel-file/node');
    const response = await readXlsxFile(file.path);
    const result = await response;

    const headers = result[0];
    let header_arr = [
      'id', 'username',
      'user_code', 'email',
      'name', 'mobile',
      'default_module_id', 'user_level',
      'user_level_id', 'user_level_name',
      'company_type', 'company_name',
      'cluster', 'cluster_name'
    ];

    let match_header = headers.filter(x => !header_arr.includes(x));

    if (match_header.length != 0) {
      const returnData = {
        data: 1,
        duplicate_code: [],
        excel_header_missing: 1,
        msg: 'User has not insert succesfully because of header mismatch',
        success: true,
      };
      return returnData
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
      let res = await this.userInfoAction(eachUserObj);
      if (res.flag !== 1) {
        duplicateUserArr.push(res.code);
        statusArr.push(res.status);
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
      final_msg = 'User has not inserted because of ' + message_status;
    } else {
      final_msg = 'User has  inserted succesfully.' + message_status;
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
    console.log(returnData);
    return returnData;
  }

  async updateUserInfo(user_data) {

    if (typeof user_data.id == 'undefined' && !user_data.id || user_data.id == 0) {
      const returnData = {
        status: 'id_missing',
        code: user_data.painter_code,
        flag: 0,
      };

      return returnData;
    }

    let clusterIds = user_data.cluster;
    if (typeof clusterIds != 'undefined' && clusterIds) {
      let clusterStr = '';
      if (typeof clusterIds === 'string') {
        clusterStr = clusterIds;
      } else {
        clusterStr = clusterIds.toString();
      }
      const clusterIdArr = clusterStr.split(',');

      if (typeof user_data.id == 'undefined' && !user_data.id || user_data.id == 0) {
        return user_data.user_code;
      }

      let phone_numbers = await this.helperService.phnNumberCheck(user_data.mobile);

      let user_gender = user_data.gender;
      if (user_data.gender == 'undefined' || !user_data.gender) {
        user_gender = 'Male';
      }
      let u_id = user_data.id;
      let user_code = user_data.user_code;
      let name = user_data.name;
      let company_type = user_data.company_type;
      let email = user_data.email;
      let gender = user_gender;
      let mobile = phone_numbers;
      let user_level_code = user_data.user_level;
      let user_level_id = user_data.user_level_id;
      let user_level_name = user_data.user_level_name;
      let username = user_data.username;

      const update_user = await this.knex(this.user_tbl)
        .where('id', u_id)
        .update({
          username: username,
          user_code: user_code,
          name: name,
          company_type: company_type,
          email: email,
          gender: gender,
          mobile: mobile,
          user_level: user_level_code,
          user_level_name: user_level_name,
          user_level_id: user_level_id,
        });

      const get_user_id = await this.knex(this.user_tbl)
        .where('user_code', user_data.user_code)
        .select('id as user_id');
      let user_id = get_user_id[0].user_id;

      let tbl = this.user_location_access;
      let uid = user_data.id;
      let columnName = 'user_id';
      const updateLoc = await this.helperService.getInsertAndInactiveLocation(clusterIdArr, tbl, columnName, uid);
      //console.log(updateLoc); return;
      //return;
      let inActivateCluster = updateLoc['deactivate_cluster'];
      let insertedCluster = updateLoc['insert_cluster'];

      if (inActivateCluster.length != 0) {

        //const inActiveLocations = await this.helperService.inactiveLocation(inActivateCluster, tbl, columnName, uid);
        console.log('new_id: ', uid);
        console.log(inActivateCluster);
        /*
          const update_cluster = await this.knex(tbl)
              .whereIn('cluster', inActivateCluster)
              .andWhere('user_id', uid) 
              .update({			
                'status':'Active'							
              });
          */

        for (let i = 0; i < inActivateCluster.length; i++) {
          const update_cluster = await this.knex(tbl)
            .where('cluster', inActivateCluster[i])
            .andWhere('user_id', uid)
            .update({
              'status': 'Active'
            });
        }
      }
      //return;
      if (insertedCluster.length != 0) {
        this.insertLocationByClusterId(
          insertedCluster,
          user_id,
          user_level_id,
          company_type,
        );
      }

      //console.log('test2',); return;
      /*
        if (company_type == 3) {
          const check_duplicate_type = await this.knex(
            this.sys_privilege_levels_table,
          )
            .where('users_id', user_id)
            .count('users_id as total');
          let total = check_duplicate_type[0].total;
          if (total === 0) {
            const location_insert = await this.knex(
              this.sys_privilege_levels_table,
            ).insert({
              users_id: user_id,
              user_levels_id: user_level_id,
            });
          }
        } else {
          const del_location = await this.knex(this.sys_privilege_levels_table)
            .where('users_id', user_id)
            .del();
        }
      */
      const returnData = {
        status: 'done',
        code: '',
        flag: 1,
      };
      return returnData;
    }
  }

  async updateUserInfoSingle(user_data) {

    if (typeof user_data.id == 'undefined' && !user_data.id || user_data.id == 0) {
      const returnData = {
        status: 'id_missing',
        code: user_data.painter_code,
        flag: 0,
      };

      return returnData;
    }

    let clusterIds = user_data.cluster;
    if (typeof clusterIds != 'undefined' && clusterIds) {
      let clusterStr = '';
      if (typeof clusterIds === 'string') {
        clusterStr = clusterIds;
      } else {
        clusterStr = clusterIds.toString();
      }
      const clusterIdArr = clusterStr.split(',');

      if (typeof user_data.id == 'undefined' && !user_data.id || user_data.id == 0) {
        return user_data.user_code;
      }

      let phone_numbers = await this.helperService.phnNumberCheck(user_data.mobile);

      let user_gender = user_data.gender;
      if (user_data.gender == 'undefined' || !user_data.gender) {
        user_gender = 'Male';
      }
      let u_id = user_data.id;
      let user_code = user_data.user_code;
      let name = user_data.name;
      let company_type = user_data.company_type;
      let email = user_data.email;
      let gender = user_gender;
      let mobile = phone_numbers;
      let user_level_code = user_data.user_level;
      let user_level_id = user_data.user_level_id;
      let user_level_name = user_data.user_level_name;
      let username = user_data.username;

      const update_user = await this.knex(this.user_tbl)
        .where('id', u_id)
        .update({
          username: username,
          user_code: user_code,
          name: name,
          company_type: company_type,
          email: email,
          gender: gender,
          mobile: mobile,
          user_level: user_level_code,
          user_level_name: user_level_name,
          user_level_id: user_level_id,
        });

      const get_user_id = await this.knex(this.user_tbl)
        .where('user_code', user_data.user_code)
        .select('id as user_id');
      let user_id = get_user_id[0].user_id;

      let tbl = this.user_location_access;
      let uid = user_data.id;
      let columnName = 'user_id';
      const updateLoc = await this.helperService.getInsertAndInactiveLocation(clusterIdArr, tbl, columnName, uid);
      console.log(updateLoc);
      let inActivateCluster = updateLoc['deactivate_cluster'];
      let insertedCluster = updateLoc['insert_cluster'];

      if (inActivateCluster.length != 0) {
        const inActiveLocations = await this.helperService.inactiveLocation(inActivateCluster, tbl, columnName, uid);
      }
      //return;
      if (insertedCluster.length != 0) {
        this.insertLocationByClusterId(
          insertedCluster,
          user_id,
          user_level_id,
          company_type,
        );
      }

      const returnData = {
        status: 'done',
        code: '',
        flag: 1,
      };
      return returnData;
    }
  }
  async updateBulkUser(file) {
    const readXlsxFile = require('read-excel-file/node');
    const response = await readXlsxFile(file.path);
    const result = await response;

    const headers = result[0];
    let header_arr = [
      'id', 'username',
      'user_code', 'email',
      'name', 'mobile',
      'default_module_id', 'user_level',
      'user_level_id', 'user_level_name',
      'company_type', 'company_name',
      'cluster', 'cluster_name'
    ];
    let match_header = headers.filter(x => !header_arr.includes(x));
    // console.log(header_arr.length,match_header.length);
    if (match_header.length != 0) {
      const returnData = {
        data: 1,
        duplicate_code: [],
        excel_header_missing: 1,
        msg: 'User has not updated succesfully because of header mismatch',
        success: true,
      };
      return returnData
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

      let res = await this.updateUserInfoSingle(eachUserObj);

      if (res.flag !== 1) {
        duplicateUserArr.push(res.code);
        statusArr.push(res.status);
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
      final_msg = 'User has not updated because of ' + message_status;
    } else {
      final_msg = 'User has updated succesfully.' + message_status;
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
  /* Delete Bulk User */
  async deleteBulkUser(file) {
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
        //if (k === 'username') {
        eachUserObj[k] = element[i];
        // }
      });
      let res = await this.bulkUserDeleteAction(eachUserObj);

      if (res.flag !== 1) {
        duplicateUserArr.push(res.code);
        statusArr.push(res.status);
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
      final_msg = 'User has not deactivated because of ' + message_status;
    } else {
      final_msg = 'User has  deactivated succesfully.' + message_status;
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

  async bulkUserDeleteAction(data) {
    //console.log(data.id); 
    if (typeof data.id == 'undefined' && !data.id || data.id == 0) {
      const returnData = {
        status: 'id_missing',
        code: data.user_code,
        flag: 0,
      };
      return returnData;
    }
    const update_user = await this.knex(this.user_tbl)
      .where('id', data.id)
      .update({
        status: 'Inactive',
      });
    const returnData = {
      status: 'done',
      code: '',
      flag: 1,
    };
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

  async removeUser(id) {
    const update_user = await this.knex(this.user_tbl).where('id', id).update({
      status: 'Inactive',
    });
    const return_message = {
      data: 1,
      msg: 'User has deleted succesfully.',
      stat: true,
    };
    return return_message;
  }

  async activeUser(id) {
    const update_user = await this.knex(this.user_tbl).where('id', id).update({
      status: 'Active',
    });
    const return_message = {
      data: 1,
      msg: 'User has activated succesfully.',
      stat: true,
    };
    return return_message;
  }

  async updateUserPassword(id) {

    let password = '$2y$10$Mdpv8wuH7XyOR7OsA.0fQ.Qo6X5zwiitDLxe4LycvegQYRT5IxdVS';
    const update_user = await this.knex(this.user_tbl).where('id', id).update({
      password: password,
    });
    const return_message = {
      data: 1,
      msg: 'User password has updated succesfully.',
      stat: true,
    };
    return return_message;
  }

  async createLoginUser(user_info) {
    //console.log(user_info);
    //return;
    const saltOrRounds = 10;
    const password = user_info.password;
    const hashPwd = await bcrypt.hash(password, saltOrRounds);

    const insert = await this.knex('users').insert({
      user_code: user_info.user_code,
      username: user_info.username,
      email: user_info.email,
      password: hashPwd,
      name: user_info.name,
    });
  }
}
