import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const SearchingParams = createParamDecorator(
    (validParams, ctx: ExecutionContext): string => {
        const req: Request = ctx.switchToHttp().getRequest()
        console.log(req.query)
        const { search } = req.query
        if (!search) return null
        return search as string
    }
)
