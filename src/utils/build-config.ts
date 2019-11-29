interface IJSONSchema {
  type: string
  description?: string
  items: IJSONSchema
  properties?: {
    [field: string]: IJSONSchema
  }
  patternProperties?: {
    [pattern: string]: IJSONSchema
  }
  oneOf: Array<IJSONSchema & (Required<Pick<IJSONSchema, 'properties'>> | Required<Pick<IJSONSchema, 'patternProperties'>>)>
}

function getCurrentDescription(fieldName: string, schema: IJSONSchema, level: number, tab: number) {
  return `
${new Array(level+1).fill('#').join('')} ${fieldName}\n
${schema.type ? `类型：${schema.type}` : ''}\n
${(schema.description || '').replace(/\\\"/g, "\"")}
`
}


function joinStr(...sections: string[]): string {
  return sections.filter(Boolean).join('\n')
}

export function schemaToMarkdown(field: string, schema: IJSONSchema, level: number, tab = 2): string {
  if (schema.type === 'array') {
    return joinStr(
      getCurrentDescription(field, schema, level, tab),
      schemaToMarkdown(`${field} 数组的 item`, schema.items!, level + 1, tab)
    )
  }

  if (schema.type && schema.type !== 'object') {
    return getCurrentDescription(field, schema, level, tab)
  }

  // 几种类型之一
  if (schema.oneOf) {
    return joinStr(
      getCurrentDescription(field, schema, level, tab), // 本层的描述
      `\`${field}\` 类型为以下几种之一：`,
      ...schema.oneOf.map(
        (childSchema, index) => schemaToMarkdown(`${field} 类型 ${index + 1}`, childSchema, level + 1, tab)
      )
    )
  }

  // 指定字段
  if (schema.properties) {
    return joinStr(
      getCurrentDescription(field, schema, level, tab),
      `\`${field}\` 的字段描述如下：`,
      ...Object.keys(schema.properties).map(
        fieldName => schemaToMarkdown(fieldName, schema.properties![fieldName], level + 1, tab)
      )
    )
  }

  // 指定 pattern 字段
  if (schema.patternProperties) {
    return joinStr(
      getCurrentDescription(field, schema, level, tab),
      ...Object.keys(schema.patternProperties).map(
        pattern => {
          return schemaToMarkdown(`\`${field}.(${pattern})\``, schema.patternProperties![pattern], level + 1, tab)
        }
      )
    )
  }

  // 无其他信息
  return getCurrentDescription(field, schema, level, tab)
}
