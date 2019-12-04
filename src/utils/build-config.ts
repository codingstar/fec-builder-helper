export interface IJSONSchema {
  type: string
  description?: string
  items?: IJSONSchema // type 为 array 时存在
  // 以下三个字段一般只同时出现一个
  properties?: {
    [field: string]: IJSONSchema
  }
  patternProperties?: {
    [pattern: string]: IJSONSchema
  }
  oneOf?: Array<IJSONSchema & (Required<Pick<IJSONSchema, 'properties'>> | Required<Pick<IJSONSchema, 'patternProperties'>>)>
}

interface IExtraOptions {
  level: number // 层级
  keyPath: string[]
  useTitle: boolean
}

const TAB_SIZE = 2

export function joinStr(...sections: string[]): string {
  return sections.filter(Boolean).join('\n\n')
}

// 将 json schema 转为 markdown 格式描述
export function schemaToMarkdown(title: string, schema: IJSONSchema, { level, keyPath, useTitle }: IExtraOptions): string {
  const indentLength = level <= 1 ? 0 : (level - 2) * TAB_SIZE
  const indent = level <= 1 ? '' : new Array(indentLength + TAB_SIZE * 2).fill(' ').join('')
  const decorator = `${new Array(indentLength).fill(' ').join('')}${level <= 1 ? new Array(level+1).fill('#').join('') : '-'}`

  const type = (
    schema.type === 'array'
    ? `${schema.items!.type}[]`
    : schema.type
  )
  const fullField = keyPath.join('.').replace(/`/g, '') || title
  const description = `${(schema.description || '').replace(/\\\"/g, "\"")}`

  const sectionTitle = `${decorator} **\`${useTitle ? title : fullField}\`**`
  const sectionType = `${indent}类型：${type}`
  const sectionDesc = description.split('\r\n').map(line => `${indent}${line}`).join('\n\n')

  if (schema.type === 'array') {
    // 若为 array 类型，且数组每一项的类型不为简单类型，则需要递归输出数组项的描述信息(暂时不考虑数组内的项类型不同的情况)
    const childSection = (
      (schema.items!.type === 'array' || schema.items!.type === 'object')
      ? schemaToMarkdown(`${fullField} 数组的 item`, schema.items!, { level: level + 1, useTitle: true, keyPath })
      : null as any
    )
    return joinStr(
      sectionTitle,
      sectionType,
      sectionDesc,
      childSection
    )
  }

  // 指定了类型且类型不为 object 或 array
  if (schema.type && schema.type !== 'object') {
    return joinStr(
      sectionTitle,
      sectionType,
      sectionDesc
    )
  }

  // 几种类型之一
  if (schema.oneOf) {
    return joinStr(
      sectionTitle,
      `${indent}\`${fullField}\` 类型为以下几种之一：`,
      ...schema.oneOf.map(
        (typeSchema, typeIndex) => schemaToMarkdown(`${typeSchema.type || ''}`, typeSchema, { level: level + 1, useTitle: true, keyPath })
      )
    )
  }

  // 指定字段
  if (schema.properties) {
    return joinStr(
      sectionTitle,
      sectionType,
      sectionDesc,
      `${indent}\`${fullField}\` 的字段描述如下：`,
      ...Object.keys(schema.properties).map(
        (fieldName, fieldIndex) => schemaToMarkdown('', schema.properties![fieldName], { level: level + 1, useTitle: false, keyPath: keyPath.concat([fieldName]) })
      )
    )
  }

  // 指定 pattern 字段
  if (schema.patternProperties) {
    return joinStr(
      sectionTitle,
      sectionType,
      sectionDesc,
      ...Object.keys(schema.patternProperties).map(
        (pattern, patternIndex) => {
          return schemaToMarkdown('', schema.patternProperties![pattern], { level: level + 1, useTitle: false, keyPath: keyPath.concat([`(${pattern})`]) })
        }
      )
    )
  }

  // 无其他信息
  return joinStr(
    sectionTitle,
    sectionType,
    sectionDesc,
  )
}
