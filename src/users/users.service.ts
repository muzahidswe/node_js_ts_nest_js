import {Inject, Injectable} from '@nestjs/common';
import {KNEX_CONNECTION} from "nestjs-knexjs";
import {Knex} from "knex";

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {

    constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

    private readonly users = [
        {
            userId: 1,
            username: 'john',
            password: 'changeme',
        },
        {
            userId: 2,
            username: 'maria',
            password: 'guess',
        },
    ];

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }

    async getUserInfo(username:string) :Promise<any> {
        const userInfo = await this.knex('users')
            .where('status', 'Active')
            .where('username', username)
            .select('user_code as userId','username','password');
        return userInfo;
    }
}
