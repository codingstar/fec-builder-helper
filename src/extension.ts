// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { execSync } from 'child_process'
import { schemaToMarkdown } from './utils/build-config'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "fec-builder-helper" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const loadSchema = vscode.commands.registerCommand('extension.loadSchema', () => {
    // The code you place here will be executed every time your command is executed

    const fecBuilderBinPath = execSync(`which fec-builder`).toString()
    const schemaPath = path.join(fecBuilderBinPath, '../../lib/node_modules/fec-builder/preset-configs/config.schema.json')
    const jsonConfig = [{
      "fileMatch": [
        "/build-config.json",
        "/build-config.*.json",
        "/build-config-*.json"
      ],
      "url": `file://${schemaPath}`
    }]

    // Display a message box to the user
    vscode.window.showInformationMessage('Load Schema Success: ' + schemaPath)

    // 最后一个参数，为 true 时表示写入全局配置，为 false 或不传时则只写入工作区配置
    vscode.workspace.getConfiguration().update('json.schemas', jsonConfig, true)
  })

  const schema2md = vscode.commands.registerCommand('extension.schema2md', () => {
    const fecBuilderBinPath = execSync(`which fec-builder`).toString()
    const schemaPath = path.join(fecBuilderBinPath, '../../lib/node_modules/fec-builder/preset-configs/config.schema.json')
    console.log('schema path: ' + schemaPath)
    const schema = require(schemaPath)
    const markdown = schemaToMarkdown('Build Config', schema, { level: 0, useTitle: true, keyPath: [] })
    const arr = []
    for (var i = 0, j = markdown.length; i < j; ++i) {
      arr.push(markdown.charCodeAt(i))
    }

    const workspacePath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.path

    if (!workspacePath) {
      vscode.window.showErrorMessage('Workspace is empty.')
      return
    }
    const targetPath = path.join(workspacePath, './build-config.md')
    console.log('Markdown Output Path: ' + targetPath)

    try {
      fs.writeFileSync(targetPath, markdown)
      vscode.window.showInformationMessage('Markdown is generated!')
    } catch {
      vscode.window.showErrorMessage('Write markdown failed.')
    }
  })

  context.subscriptions.push(loadSchema, schema2md)
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('"fec-builder-helper" is now deactive!')
}
