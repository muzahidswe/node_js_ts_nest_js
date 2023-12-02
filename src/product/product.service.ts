import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from 'nestjs-knexjs';
import { CategoryDto } from './product.dto';
import { HelperService } from '../core/helper.services'
const excel = require('exceljs');

@Injectable()
export class ProductService {
    storeProductInfo(categoryDto: CategoryDto): any {
        throw new Error('Method not implemented.');
    }
    constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex, private readonly helperService: HelperService) { }

    private product_category = 'product_category';
    private company = 'companies_t';
    private product_sub_category = 'product_sub_category';
    private product = 'products';

    async getCategoryList() {

        const category_list = await this.knex(this.product_category)
            .innerJoin(this.company, this.company + '.id', '=', this.product_category + '.company_type')
            .select(
                this.knex.raw(
                    this.product_category + '.*,companies_t.company_name as company_name',
                ),
            );
        const obj = { category_list: category_list };
        //console.log(obj);
        return obj;
    }

    async storeCategory(category_data) {

        let category_name = category_data.category_name;
        let category_code = category_data.category_code;
        let company_type = category_data.company_type;

        const check_category = await this.knex(this.product_category)
            .where('category_name', category_name)
            .where('company_type', company_type)
            .count('id as total_painter');

        let total_row = check_category[0].total_painter;
        if (total_row > 0) {
            const return_message = {
                data: 0,
                msg: 'Duplicate Category has found',
                success: false,
            };
            return return_message;
        }

        const insert = await this.knex(this.product_category).insert({
            category_name: category_name,
            category_code: category_code,
            company_type: company_type,
        });
        const return_message = {
            data: 1,
            msg: 'Category Added Succesfully',
            success: false,
        };
        return return_message;
    }

    async getSubCategoryList() {

        const category_list = await this.knex(this.product_sub_category)
            .innerJoin(this.product_category, this.product_category + '.id', '=', this.product_sub_category + '.category_id')
            .innerJoin(this.company, this.company + '.id', '=', this.product_sub_category + '.company_type')
            .select(
                this.knex.raw(
                    this.product_sub_category + '.*,product_category.category_name,companies_t.company_name as company_name',
                ),
            );
        const obj = { category_list: category_list };
        return obj;
    }

    async storeSubCategory(sub_category_data) {

        let category_name = sub_category_data.category_name;
        let sub_category_name = sub_category_data.sub_category_name;
        let sub_category_code = sub_category_data.sub_category_code;
        let company_type = sub_category_data.company_type;

        const check_category = await this.knex(this.product_sub_category)
            .where('category_id', category_name)
            .where('sub_category_name', sub_category_name)
            .where('sub_category_code', sub_category_code)
            .where('company_type', company_type)
            .count('id as total_painter');

        let total_row = check_category[0].total_painter;
        if (total_row > 0) {
            const return_message = {
                data: 0,
                msg: 'Duplicate Sub Category has found',
                success: false,
            };
            return return_message;
        }

        const insert = await this.knex(this.product_sub_category).insert({
            category_id: category_name,
            sub_category_name: sub_category_name,
            sub_category_code: sub_category_code,
            company_type: company_type,
        });
        const return_message = {
            data: 1,
            msg: 'Sub Category Added Succesfully',
            success: false,
        };
        return return_message;
    }

    async getProductList() {

        const product_list = await this.knex(this.product)
            .innerJoin(this.product_category, this.product_category + '.id', '=', this.product + '.category_id')
            .innerJoin(this.product_sub_category, this.product_sub_category + '.id', '=', this.product + '.sub_category_id')
            .innerJoin(this.company, this.company + '.id', '=', this.product + '.company_type')
            .select(
                this.knex.raw(
                    this.product + '.*,companies_t.company_name as company_name,product_category.category_name,product_sub_category.sub_category_name',
                ),
            );
        const obj = { product_list: product_list };
        return obj;
    }

    async uploadBulkProduct(file) {

        const readXlsxFile = require('read-excel-file/node');
        const response = await readXlsxFile(file.path);
        const result = await response;

        const headers = result[0];
        let header_arr = [
            'category_id',
            'category_name',
            'sub_category_id',
            'sub_category_name',
            'product_name',
            'product_code',
            'status',
            'company_id',
            'company_name',
            'price_per_ltr'
        ];

        let match_header = headers.filter(x => !header_arr.includes(x));
        if (match_header.length != 0) {
            const returnData = {
                data: 1,
                duplicate_code: [],
                excel_header_missing: 1,
                msg: 'Product has not inserted succesfully because of header mismatch',
                success: true,
            };
            return returnData;
        }
        const productData = result.slice(1);
        let duplicateProductArr = new Array();
        let statusArr = new Array();

        for (let index = 0; index < productData.length; index++) {
            const element = productData[index];

            const eachUserObj = {};
            headers.forEach(function (k, i) {
                eachUserObj[k] = element[i];
            });

            let result = await this.productAction(eachUserObj);

            if (result.flag !== 1) {
                duplicateProductArr.push(result.code);
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
        let total_number = productData.length;
        let total_not_inserted = statusArr.length;
        let total_inserted = total_number - total_not_inserted;

        let final_msg = '';
        if (total_inserted === 0) {
            final_msg = 'Product has not inserted because of ' + message_status;
        } else {
            final_msg = 'Product has  inserted succesfully.' + message_status;
        }
        const fs = require('fs');
        fs.unlinkSync(file.path);

        const returnData = {
            data: 1,
            is_id_missing: 0,
            duplicate_code: duplicateProductArr,
            msg: final_msg,
            success: true,
        };
        return returnData;
    }

    async productAction(product_data) {
        //console.log(product_data); 
        let category_id = product_data.category_id;
        let sub_category_id = product_data.sub_category_id;
        let product_name = product_data.product_name;
        let product_code = product_data.product_code;
        let price_per_ltr = product_data.price_per_ltr;
        let company_id = product_data.company_id;

        const check_product = await this.knex(this.product)
            .where('category_id', category_id)
            .where('sub_category_id', sub_category_id)
            .where('product_code', product_code)
            .where('company_type', company_id)
            .count('id as total');

        let total_product = check_product[0].total;

        if (total_product > 0) {
            const returnData = {
                status: 'duplicate_code',
                code: product_data.product_code,
                msg: 'Duplicate Code Found',
                flag: 0,
            };
            return returnData;
        }


        const timestamp = Date.now();
        const insert = await this.knex(this.product).insert({
            category_id: category_id,
            sub_category_id: sub_category_id,
            product_name: product_name,
            product_code: product_code,
            price_per_ltr: price_per_ltr,
            company_type: company_id,
        });

        const returnData = {
            status: 'done',
            code: '',
            msg: 'Product has been added succesfully.',
            flag: 1,
        };
        return returnData;
    }


    async productEditAction(product_data) {

        let product_id = product_data.id;

        let category_id = product_data.category_id;
        let sub_category_id = product_data.sub_category_id;
        let product_name = product_data.product_name;
        let product_code = product_data.product_code;
        let price_per_ltr = product_data.price_per_ltr;
        let company_id = product_data.company_type;

        const check_product = await this.knex(this.product)
            .where('category_id', category_id)
            .where('sub_category_id', sub_category_id)
            .where('product_code', product_code)
            .where('company_type', company_id)
            .where('id', '<>', product_id)
            .count('id as total');

        let total_product = check_product[0].total;

        if (total_product > 0) {
            const returnData = {
                status: 'duplicate_code',
                code: product_data.product_code,
                msg: 'Duplicate Code Found',
                flag: 0,
            };
            return returnData;
        }


        const timestamp = Date.now();
        const update_region = await this.knex(this.product)
            .where('id', product_id)
            .update({
                category_id: category_id,
                sub_category_id: sub_category_id,
                price_per_ltr: price_per_ltr,
                product_name: product_name,
                product_code: product_code,
                company_type: company_id,
            });

        const returnData = {
            status: 'done',
            code: '',
            msg: 'Product has been updated succesfully.',
            flag: 1,
        };
        return returnData;
    }



    async uploadBulkPrice(file) {

        const readXlsxFile = require('read-excel-file/node');
        const response = await readXlsxFile(file.path);
        const result = await response;

        const headers = result[0];
        let header_arr = [
            'category_id',
            'category_name',
            'sub_category_id',
            'sub_category_name',
            'product_name',
            'product_code',
            'status',
            'company_id',
            'company_name',
            'price_per_ltr'
        ];

        let match_header = headers.filter(x => !header_arr.includes(x));
        if (match_header.length != 0) {
            const returnData = {
                data: 1,
                duplicate_code: [],
                excel_header_missing: 1,
                msg: 'Price has not updated succesfully because of header mismatch',
                success: true,
            };
            return returnData;
        }
        const productData = result.slice(1);
        let duplicateProductArr = new Array();


        for (let index = 0; index < productData.length; index++) {
            const element = productData[index];
            const eachUserObj = {};
            headers.forEach(function (k, i) {
                eachUserObj[k] = element[i];
            });
            let update = await this.priceUpdateAction(eachUserObj);
        }

        const fs = require('fs');
        fs.unlinkSync(file.path);

        const returnData = {
            data: 1,
            is_id_missing: 0,
            duplicate_code: duplicateProductArr,
            msg: 'Price has updated succesfully.',
            success: true,
        };
        return returnData;
    }

    async priceUpdateAction(product_data) {
        let category_id = product_data.category_id;
        let sub_category_id = product_data.sub_category_id;
        //let product_name = product_data.product_name;
        let product_code = product_data.product_code;
        let price_per_ltr = product_data.price_per_ltr;
        let company_id = product_data.company_id;


        const update_region = await this.knex(this.product)
            .where('category_id', category_id)
            .where('sub_category_id', sub_category_id)
            .where('product_code', product_code)
            .where('company_type', company_id)
            .update({
                price_per_ltr: price_per_ltr,
            });

        const returnData = {
            status: 'done',
            code: '',
            flag: 1,
        };
        return returnData;
    }

    async deleteProduct(product_id) {
        const update_user = await this.knex(this.product)
            .where('id', product_id)
            .update({
                status: 'In-active',
            });
        const return_message = {
            data: 1,
            msg: 'Product has inactive succesfully.',
            stat: true,
        };
        console.log(product_id,return_message)
        return return_message;
    }

    async activeProduct(product_id) {
        const update_user = await this.knex(this.product)
            .where('id', product_id)
            .update({
                status: 'Active',
            });
        const return_message = {
            data: 1,
            msg: 'Product has activated succesfully.',
            stat: true,
        };
        return return_message;
    }









}
