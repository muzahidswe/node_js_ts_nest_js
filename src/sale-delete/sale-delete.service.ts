import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from 'nestjs-knexjs';
import { CreateSaleDeleteDto } from './dto/create-sale-delete.dto';
import { HelperService } from '../core/helper.services'
import { map } from 'rxjs';
const fs = require('fs');
const https = require('https');

const excel = require('exceljs');

@Injectable()
export class SaleDeleteService {
  httpService: any;

  storeUserInfo(createSaleDeleteDto: CreateSaleDeleteDto): any {
    throw new Error('Method not implemented.');
  }
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex, httpService: HttpService,) { }

  private sales_order = 'sales_order';
  private sales_order_details = 'sales_order_details';
  private sales_order_invoice_info = 'sales_order_invoice_info';
  private sales_order_invoice_images = 'sales_order_invoice_images';
  private sales_ratification = 'sales_ratification';
  private sales_ratification_images = 'sales_ratification_images';

  async uploadBulkSaleOrderID(file, fileType) {

    const readXlsxFile = require('read-excel-file/node');
    const response = await readXlsxFile(file.path);
    const result = await response;

    const headers = result[0];
    const data = result.slice(1);
    let duplicateUserArr = new Array();

    let invoiceInfoIdArr = [];
    let salesIdArr = [];
    for (let index = 0; index < data.length; index++) {
      let res = await this.getSalesIdAndInvoiceId(data[index][0]);
      // console.log('res_from_nest_api',res);
      if (res.stat === 1) {
        if (typeof res['invoice_info_id'] != 'undefined' && res['invoice_info_id']) {
          invoiceInfoIdArr.push(res['invoice_info_id']);
        }
        if (typeof res['sales_id'] != 'undefined' && res['sales_id']) {
          salesIdArr.push(res['sales_id']);
        }
      }
    }
    //console.log(salesIdArr); 
    this.removeFile(file.path);
    if (invoiceInfoIdArr.length === 0) {
      const obj = { status: 0, invoice_info_id: [], sales_id: [] };
      return obj;
    } else {
      const obj = { status: 1, invoice_info_id: invoiceInfoIdArr, sales_id: salesIdArr };
      return obj;
    }
  }
  async getSalesIdAndInvoiceId(sales_order_no) {
    //console.log(sales_order_no); return;

    const get_sales_order_id = await this.knex(this.sales_order)
      .where('sales_order_no', sales_order_no)
      .select('id');

    if (get_sales_order_id.length !== 0) {

      let sales_order_id = get_sales_order_id[0].id;
      const get_invoice_info_id = await this.knex(this.sales_order_invoice_images)
        .where('sales_id', sales_order_id)
        .select('invoice_info_id as id');
      let invoice_info_id = '';
      if (get_invoice_info_id.length !== 0) {
        invoice_info_id = get_invoice_info_id[0].id;
      } else {
        invoice_info_id = '';
      }
      let obj = { stat: 1, sales_id: sales_order_id, invoice_info_id: invoice_info_id };
      return obj;
    } else {
      let obj = { stat: 0, sales_id: [], invoice_info_id: [] };
      return obj;
    }

  }

  async deleteSale(salesId, type) {

    if (type == 'submit_again') {
      const delete_sales_order_invoice_info = await this.knex(this.sales_order_invoice_info)
        .whereIn('sales_id', salesId)
        .del();

      const delete_sales_order_invoice_images = await this.knex(this.sales_order_invoice_images)
        .whereIn('sales_id', salesId)
        .del();
    } else {
      const delete_sales_order = await this.knex(this.sales_order)
        .whereIn('id', salesId)
        .del();

      const delete_sales_order_details = await this.knex(this.sales_order_details)
        .whereIn('order_id', salesId)
        .del();

      const delete_sales_order_invoice_info = await this.knex(this.sales_order_invoice_info)
        .whereIn('sales_id', salesId)
        .del();

      const delete_sales_ratification = await this.knex(this.sales_ratification)
        .whereIn('sales_id', salesId)
        .del();

      const delete_sales_ratification_images = await this.knex(this.sales_ratification_images)
        .whereIn('sales_id', salesId)
        .del();

      const delete_sales_order_invoice_images = await this.knex(this.sales_order_invoice_images)
        .whereIn('sales_id', salesId)
        .del();

    }
    const return_message = {
      data: 1,
      msg: 'Sale has deleted succesfully.',
      success: false,
    };
    return return_message;

  }

  async checkBulkSales(responses, file) {

    const readXlsxFile = require('read-excel-file/node');
    const response = await readXlsxFile(file.path);
    const result = await response;
    const data = result.slice(1);
    const sales_order_arr = [];
    for (let index = 0; index < data.length; index++) {
      let each_id = data[index][0];
      sales_order_arr.push(each_id);
    }
    // console.log(sales_order_arr);
    /*--------------------------*/
    const get_sales_order_id = await this.knex(this.sales_order)
      .whereIn('sales_order_no', sales_order_arr)
      .select('id as sales_id');

    let sales_id_arr = [];
    get_sales_order_id.forEach(async (val, key) => {
      sales_id_arr.push(val.sales_id);
    });

    /*--------------------------*/
    const get_sales_order_details = await this.knex('sales_order')
      .innerJoin('sales_order_details', 'sales_order_details.order_id', '=', 'sales_order.id')
      .whereIn('sales_order_no', sales_order_arr)
      .select(
        this.knex.raw(
          'sales_order.sales_order_no, COUNT(sales_order_details.id) as total_sales_id'
        ))
      .groupBy('sales_order.sales_order_no');


    const get_sales_order_invoice_info = await this.knex('sales_order')
      .innerJoin('sales_order_invoice_info', 'sales_order_invoice_info.sales_id', '=', 'sales_order.id')
      .whereIn('sales_order_no', sales_order_arr)
      .select(
        this.knex.raw(
          'sales_order.sales_order_no, COUNT(sales_order_invoice_info.id) as total_sales_id'
        ))
      .groupBy('sales_order.sales_order_no');

    const get_sales_ractification = await this.knex('sales_order')
      .innerJoin('sales_ratification', 'sales_ratification.sales_id', '=', 'sales_order.id')
      .whereIn('sales_order_no', sales_order_arr)
      .select(
        this.knex.raw(
          'sales_order.sales_order_no, COUNT(sales_ratification.id) as total_sales_id'
        ))
      .groupBy('sales_order.sales_order_no');

    const get_ractification_image = await this.knex('sales_order')
      .innerJoin('sales_ratification_images', 'sales_ratification_images.sales_id', '=', 'sales_order.id')
      .whereIn('sales_order_no', sales_order_arr)
      .select(
        this.knex.raw(
          'sales_order.sales_order_no, COUNT(sales_ratification_images.id) as total_sales_id'
        ))
      .groupBy('sales_order.sales_order_no');

    const get_invoice_images = await this.knex('sales_order')
      .innerJoin('sales_order_invoice_images', 'sales_order_invoice_images.sales_id', '=', 'sales_order.id')
      .whereIn('sales_order_no', sales_order_arr)
      .select(
        this.knex.raw(
          'sales_order.sales_order_no, COUNT(sales_order_invoice_images.id) as total_sales_id'
        ))
      .groupBy('sales_order.sales_order_no');

    let final_obj = sales_order_arr.map(order => {

      let is_order_available = get_sales_order_details.filter(obj => obj['sales_order_no'] == order)[0];
      let is_invoice_available = get_sales_order_invoice_info.filter(obj => obj['sales_order_no'] == order)[0];
      let is_ractification_available = get_sales_ractification.filter(obj => obj['sales_order_no'] == order)[0];
      let is_ractification_image_available = get_ractification_image.filter(obj => obj['sales_order_no'] == order)[0];
      let is_invoice_image_available = get_invoice_images.filter(obj => obj['sales_order_no'] == order)[0];
      let temp_order = {
        sales_order_id: order,
        sales_order: is_order_available ? 'Yes' : 'No',
        sales_order_invoice: is_invoice_available ? 'Yes' : 'No',
        sales_ractifiction: is_ractification_available ? 'Yes' : 'No',
        sales_ractifiction_image: is_ractification_image_available ? 'Yes' : 'No',
        invoice_image: is_invoice_image_available ? 'Yes' : 'No',
      };
      return temp_order;

    });

    const d = new Date();
    const cTime = d.getTime();
    const name = 'Result_Sale_Delete';
    //const name = 'Result_Sale_Delete_' + cTime;
    let path = 'upload/' + name + '.xlsx';

    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }


    const headers = [
      { header: 'Sales Order Id', key: 'sales_order_id', width: 20 },
      { header: 'Sales Order', key: 'sales_order', width: 20 },
      { header: 'Sales Order Invoice', key: 'sales_order_invoice', width: 20 },
      { header: 'Sales Ractifiction', key: 'sales_ractifiction', width: 20 },
      { header: 'Sales Ractifiction Image', key: 'sales_ractifiction_image', width: 20 },
      { header: 'Invoice Image', key: 'invoice_image', width: 20 },
    ];
    const results = await this.generateExcelReport(responses, name, headers, final_obj);
    //console.log(results);
    return results;
  }


  async generateExcelReport(response, fileName: string, headers: any, data: any) {
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet(fileName);
    worksheet.columns = headers;
    worksheet.getRow(1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (rowNumber == 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '808080' }
          };
        };
      })
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
    /*
    save the file
    workbook.xlsx.writeFile("./upload/" + fileName + ".xlsx").then(function () {
      response.end();
    });
    */
    return {
      file: fileName + ".xlsx"
    }

  }

  async removeFile(path) {
    const fs = require('fs');
    try {
      fs.unlinkSync(path);
    } catch (err) {
      console.error(err);
    }
  }
}
