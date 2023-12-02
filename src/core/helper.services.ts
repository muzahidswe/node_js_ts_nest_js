import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION, NestjsKnexService } from 'nestjs-knexjs';
@Injectable()
export class HelperService {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) { }

  async updateLocation(clusterID) {

    const cluster = await this.knex('cluster')
      .whereIn('id', clusterID)
      .select(
        this.knex.raw(
          'GROUP_CONCAT( DISTINCT region_id ) region,GROUP_CONCAT( DISTINCT area_id ) area,GROUP_CONCAT( DISTINCT territory_id ) territory,GROUP_CONCAT( DISTINCT id ) cluster ',
        ),
      );

    let regionIdArr = cluster[0]['region'].split(',');
    const update_region = await this.knex('region')
      .whereIn('id', regionIdArr)
      .where('status', 'In-Active')
      .update({
        status: 'Active',
      });

    let areaIdArr = cluster[0]['area'].split(',');
    const update_area = await this.knex('area')
      .whereIn('id', areaIdArr)
      .where('status', 'In-Active')
      .update({
        status: 'Active',
      });

    let territoryIdArr = cluster[0]['territory'].split(',');
    const update_territory = await this.knex('territory')
      .whereIn('id', territoryIdArr)
      .where('status', 'In-Active')
      .update({
        status: 'Active',
      });

    let clusterIdArr = cluster[0]['cluster'].split(',');
    const update_cluster = await this.knex('cluster')
      .whereIn('id', clusterIdArr)
      .where('status', 'In-Active')
      .update({
        status: 'Active',
      });

    return 1;
  }

  /* Get Location for insert and update */
  async getInsertAndInactiveLocation(clusterID, tbl_name, column_id_name, updated_id) {

    let finalclusterIdArrUser = clusterID.map(obj => parseInt(obj));
    const update_cluster = await this.knex(tbl_name)
      .whereIn('cluster', finalclusterIdArrUser)
	  .andWhere(column_id_name, updated_id) 
      .update({
        status: 'Active',
      });

    const get_user_cluster = await this.knex(tbl_name)
      .where(column_id_name, updated_id)
      .select('cluster');

    let clusterIdArrInDb = [];
    get_user_cluster.forEach(async (val, key) => {
      clusterIdArrInDb.push(val.cluster);
    });
    //console.log(clusterIdArrInDb); return;
    let insert_cluster = finalclusterIdArrUser.filter(x => !clusterIdArrInDb.includes(x));
    let deacticate_cluster = clusterIdArrInDb.filter(x => !finalclusterIdArrUser.includes(x));
    let data = {};
    data['deactivate_cluster'] = deacticate_cluster;
    data['insert_cluster'] = insert_cluster;
    //console.log(data); return;
    return data;

  }
  /* Inactive Location */

  async inactiveLocation(clusterID, tbl_name, column_id_name, updated_id) {
	//console.log('from helpers',clusterID,'tbl_name',tbl_name,'column_id_name',column_id_name,'updated_id',updated_id);
    const update_cluster = await this.knex(tbl_name)
      .whereIn('cluster', clusterID)
      .andWhere(column_id_name, updated_id)
      .andWhere('status', 'Active')
      .update({			
			'status': 'In-Active',			
      });
	//console.log(update_cluster); 
    return 1;
	
  }

  async inactiveLocationById(tbl_name, column_id_name, updated_id) {

    const update_cluster = await this.knex(tbl_name)
      .where(column_id_name, updated_id)
      .andWhere('status', 'Active')
      .update({
        status: 'In-Active',
      });
    return 1;

  }

  async phnNumberCheck(phnNumber) {
    if (phnNumber == 'undefined' || !phnNumber) {
      return 0;
    } else {
      let contact_no = phnNumber.toString();
      let phone_numbers = '';
      if (contact_no.match(/^-?\d+$/)) {
        let lastelevenphone = contact_no.slice(-11);
        if (lastelevenphone.length == 11) {
          phone_numbers = lastelevenphone;
        } else if (lastelevenphone.length == 10) {
          phone_numbers = '0' + lastelevenphone;
        } else {
          phone_numbers = '';
        }
      } else {
        phone_numbers = '';
      }
      return phone_numbers;
    }
  }




}

/* Inactive Location */




