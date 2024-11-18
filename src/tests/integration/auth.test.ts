import { app } from "#/src/app"
import request from 'supertest'
import { describe, expect, it } from 'vitest'

describe('Authentication',()=>{
    it('should return invalid data status   ',async ()=>{
        const req = await request(app).post('/api/auth/login').send({
            name:'usama',
            password:'kamran123@',
            role:'admin',

        })

        expect(req.statusCode).toBe(422)

        })
    })
