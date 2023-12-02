import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from 'nestjs-knexjs';
import { HelperService } from '../core/helper.services';
const fs = require('fs');

@Injectable()
export class TargetService {
    constructor(
        @Inject(KNEX_CONNECTION) private readonly knex: Knex
    ) { }

    private target_tbl = 'apps_apec_monthly_target';


    async getTargetList() {
        let current_date = new Date().toISOString().slice(0, 10);
        let date_arr = current_date.split("-");
        let date_month = date_arr[0] + '-' + date_arr[1];
        //let date_month = '2020-02';

        const dealers = await this.knex('apps_apec_monthly_target')
            .innerJoin('sys_users', 'sys_users.id', '=', 'apps_apec_monthly_target.user_id')
            .where('year_month', date_month)
            .andWhere('apps_apec_monthly_target.status', 'Active')
            .select(
                this.knex.raw(
                    'apps_apec_monthly_target.user_id,apps_apec_monthly_target.year_month,apps_apec_monthly_target.targeted_amount,apps_apec_monthly_target.`status`,sys_users.`name` as user_name'
                ),
            );
        const obj = { target_list: dealers };
        //console.log(obj);
        return obj;

    }

    async getTargetListByYearMonth(year_month) {
       
        const dealers = await this.knex('apps_apec_monthly_target')
            .innerJoin('sys_users', 'sys_users.id', '=', 'apps_apec_monthly_target.user_id')
            .where('year_month', year_month)
            .andWhere('apps_apec_monthly_target.status', 'Active')
            .select(
                this.knex.raw(
                    'apps_apec_monthly_target.user_id,apps_apec_monthly_target.year_month,apps_apec_monthly_target.targeted_amount,apps_apec_monthly_target.`status`,sys_users.`name` as user_name'
                ),
            );
        const obj = { target_list: dealers };       
        return obj;

    }

    async uploadTargetFile(file, fileType) {
        const readXlsxFile = require('read-excel-file/node');
        const response = await readXlsxFile(file.path);
        const result = await response;

        const headers = result[0];
        const userData = result.slice(1);
        let duplicateArr = new Array();
        let msg = '';
        for (let index = 0; index < userData.length; index++) {
            const element = userData[index];
            const eachUserObj = {};
            headers.forEach(function (k, i) {
                eachUserObj[k] = element[i];
            });
            // console.log(fileType)  

            if (fileType === 'insert') {
                //console.log('insert',eachUserObj);
                let res = await this.insertTarget(eachUserObj);
                if (res !== "") {
                    duplicateArr.push(res);
                }
                msg = 'Target has inserted succesfully'
            } else {
                //console.log('update',eachUserObj);
                await this.updateTarget(eachUserObj);
                duplicateArr = [];
                msg = 'Target has updated succesfully'
            }


        }
        this.removeFile(file.path);
        //console.log(duplicateArr);

        const returnData = {
            data: 1,
            duplicate_user: duplicateArr,
            msg: msg,
            success: true,
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
    async insertTarget(data) {
        //console.log(data); return;
        const check_row = await this.knex(this.target_tbl)
            .where('user_id', data.user_id)
            .andWhere('year_month', data.year_month)
            .count('id as total_row');

        let is_row_found = check_row[0].total_row;

        if (is_row_found > 0) {
            return data.user_code;
        }

        let user_id = data.user_id;
        let year_month = data.year_month;
        let targeted_amount = data.targeted_amount;

        const insert = await this.knex(this.target_tbl).insert({
            user_id: user_id,
            year_month: year_month,
            targeted_amount: targeted_amount,
        });

        const return_message = {
            data: 1,
            msg: 'Target Insert Succesfully',
            success: false,
        };
    }

    async updateTarget(data) {

        const update_user = await this.knex(this.target_tbl)
            .where('user_id', data.user_id)
            .andWhere('year_month', data.year_month)
            .update({
                targeted_amount: data.targeted_amount,
            });

        const return_message = {
            data: 1,
            msg: 'Target Update Succesfully',
            success: false,
        };
    }

}
