import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { SearchQuery } from '~/models/requests/search.request'
import searchService from '~/services/search.services'
export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await searchService.search({ limit, page, content: req.query.content })
  res.json({
    message: 'Search successfully',
    result
  })
}
