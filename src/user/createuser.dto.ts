export class CreateUserDto {
    user_code: string;    
    email: string;
    mobile : number;
    user_level : number;
    username: string;
    name: string;
    gender : string;
    company_type: number;
    region: number;
    area: number;
    territory: number;
    cluster: number;
  }

  export class UpdateUserDto {
    user_code: string;    
    email: string;
    mobile : number;
    user_level : number;
    username: string;
    name: string;
    gender : string;
    company_type: number;
    region: number;
    area: number;
    territory: number;
    cluster: number;
  }

  export class CreateLoginUserDto {
    user_code: string;    
    username: string;
    email : string;
    password : string;
    name: string;
   
  }