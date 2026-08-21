import { z } from "zod"
import { HTTP_METHOD, initContract } from "typed-api-contract"

const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const contractInit = initContract()

function createResourceRoutes(index: number) {
  return {
    list: {
      method: HTTP_METHOD.GET,
      path: `/resources/${index}`,
      query: z.object({ page: z.coerce.number().optional() }),
      responses: { 200: z.array(ItemSchema) },
    },
    getById: {
      method: HTTP_METHOD.GET,
      path: `/resources/${index}/:id`,
      pathParams: z.object({ id: z.string() }),
      responses: {
        200: ItemSchema,
        404: z.object({ message: z.string() }),
      },
    },
  }
}

export const largeContract = contractInit.router({
  resource0: createResourceRoutes(0),
  resource1: createResourceRoutes(1),
  resource2: createResourceRoutes(2),
  resource3: createResourceRoutes(3),
  resource4: createResourceRoutes(4),
  resource5: createResourceRoutes(5),
  resource6: createResourceRoutes(6),
  resource7: createResourceRoutes(7),
  resource8: createResourceRoutes(8),
  resource9: createResourceRoutes(9),
  resource10: createResourceRoutes(10),
  resource11: createResourceRoutes(11),
  resource12: createResourceRoutes(12),
  resource13: createResourceRoutes(13),
  resource14: createResourceRoutes(14),
  resource15: createResourceRoutes(15),
  resource16: createResourceRoutes(16),
  resource17: createResourceRoutes(17),
  resource18: createResourceRoutes(18),
  resource19: createResourceRoutes(19),
  resource20: createResourceRoutes(20),
  resource21: createResourceRoutes(21),
  resource22: createResourceRoutes(22),
  resource23: createResourceRoutes(23),
  resource24: createResourceRoutes(24),
  resource25: createResourceRoutes(25),
  resource26: createResourceRoutes(26),
  resource27: createResourceRoutes(27),
  resource28: createResourceRoutes(28),
  resource29: createResourceRoutes(29),
  resource30: createResourceRoutes(30),
  resource31: createResourceRoutes(31),
  resource32: createResourceRoutes(32),
  resource33: createResourceRoutes(33),
  resource34: createResourceRoutes(34),
  resource35: createResourceRoutes(35),
  resource36: createResourceRoutes(36),
  resource37: createResourceRoutes(37),
  resource38: createResourceRoutes(38),
  resource39: createResourceRoutes(39),
  resource40: createResourceRoutes(40),
  resource41: createResourceRoutes(41),
  resource42: createResourceRoutes(42),
  resource43: createResourceRoutes(43),
  resource44: createResourceRoutes(44),
  resource45: createResourceRoutes(45),
  resource46: createResourceRoutes(46),
  resource47: createResourceRoutes(47),
  resource48: createResourceRoutes(48),
  resource49: createResourceRoutes(49),
})
