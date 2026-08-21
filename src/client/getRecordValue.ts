import { isRecord } from "../shared/isRecord.js"

export function getRecordValue(value: object, key: string): unknown {
  if (!isRecord(value)) {
    return undefined
  }

  return value[key]
}
