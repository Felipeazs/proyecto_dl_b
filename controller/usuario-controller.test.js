import { check } from 'express-validator'
import { describe, it, beforeAll, afterAll, expect, afterEach } from 'vitest'
const { rest } = require('msw')
const { setupServer } = require('msw/node')

const checkAuth = require('../middleware/check-auth')
const { getUsuario } = require('./usuario-controller')

const restHandlers = [
    rest.get(`http://localhost:1554/api/usuario`, (req, res, ctx) => {
        const token = '456'
        return res(ctx.set({ 'Content-Type': 'application/json', 'Authentication': `Bearer ${token}` }))
    })
]

const server = setupServer(...restHandlers)

beforeAll(() => { server.listen({ onUnhandledRequest: 'error' }) })
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

it('request', () => {

    const user = async (req, res) => {
        const usuario = await getUsuario()
        console.log(usuario)
    }

    expect(() => user()).toBeDefined()

})

