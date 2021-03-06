// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import { execSync } from 'child_process'

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
    let schemaPath
    const fecBuilderPath: string | undefined = vscode.workspace.getConfiguration().get('fecBuilderHelper.path')
    if (fecBuilderPath) { // 优先使用配置的路径
      schemaPath = path.join(fecBuilderPath, './preset-configs/config.schema.json')
    } else {
      const fecBuilderBinPath = execSync(`which fec-builder`).toString()
      schemaPath = path.join(fecBuilderBinPath, '../../lib/node_modules/fec-builder/preset-configs/config.schema.json')
    }

    if (!fs.existsSync(schemaPath)) {
      vscode.window.showErrorMessage('Please upgrade your fec-builder to v1.16.1 or later!')
      return
    }

    const jsonConfig = [{
      "fileMatch": [
        "/build-config.json",
        "/build-config.*.json",
        "/build-config-*.json"
      ],
      "url": `file://${schemaPath}`
    }]

    vscode.window.showInformationMessage('Load Schema Success: ' + schemaPath)

    // 最后一个参数，为 true 时表示写入全局配置，为 false 或不传时则只写入工作区配置
    vscode.workspace.getConfiguration().update('json.schemas', jsonConfig, true)
  })

  context.subscriptions.push(loadSchema)
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('"fec-builder-helper" is now deactive!')
}
