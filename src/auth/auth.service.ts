import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async validateUser(username: string, pass: string): Promise<any> {
        return await this.usersService.getUserInfo(username).then(async res => {
            const userInfo = Object.values(JSON.parse(JSON.stringify(res)))[0];
            let user = {
                userId: userInfo['userId'],
                username: userInfo['username'],
                password: userInfo['password']
            };

            const isMatch = await bcrypt.compare(pass, user.password);
            if (isMatch) {
                const {password, ...result} = user;
                return result;
            }
            return null;

        }).catch(err =>{
            return null;
        });
    }

    async login(user: any) {

        const payload = { username: user.username, sub: user.userId };
        return {
            msg:'login',
            is_valid:true,
            access_token: this.jwtService.sign(payload),
        };
    }
}