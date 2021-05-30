import * as vscode from "vscode";
import * as puppeteer from "puppeteer";
import * as path from "path";
import * as cheerio from "cheerio";
import axios from "axios";
// import {Puppet} from "./puppet";
import { ProblemData } from "../interface/problemData";

export class CodeforcesDataProvider{

    displaySelectedProblemInView = async (currInpProblem:ProblemData):Promise<void> => {
        const panel = vscode.window.createWebviewPanel(
            'codeforces',
            "Problem",
            vscode.ViewColumn.Beside,
            {
                enableScripts: true
            }
          );

        panel.webview.onDidReceiveMessage(async (message) => {
            // switch(message.command) {
            //     case "submit":
            //         await this.puppet.submitCodeToCf(message.text,message.lang,currInpProblem);
            // }
        });
    
        const parseProblem = async (currProblem:ProblemData):Promise<string> => {
            const problem:ProblemData = currProblem;
            console.log(problem.sampleTests)
            return `
            <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
                        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
                        <meta name="viewport" content="width=device-width">
                        <style>
                            .header{
                                margin-left:auto;
                                margin-right:auto;
                                text-align:center;
                            }
                        #title{
                            font-size:30px;
                            margin-top:4px;
                            margin-bottom:4px;
                        }
                        #time-limit{
                            margin-top:4px;
                            margin-bottom:4px;
                        }
                        #memory-limit{
                            margin-top:4px;
                            margin-bottom:4px;
                        }
                        #input-type{
                            margin-top:4px;
                            margin-bottom:4px;
                        }
                        #output-type{
                            margin-top:4px;
                            margin-bottom:4px;
                        }
                        
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <p id="title">${problem.name}</p>
                            <p id="time-limit">time limit per test : ${problem.timeLimit}</p>
                            <p id="memory-limit">memory limit per test : ${problem.memoryLimit}</p>
                            <p id="input-type">input: ${problem.inputType}</p>
                            <p id="output-type">output: ${problem.outputType}</p>
                        </div>
                        <hr/>
                        <div>
                            ${problem.problemStatement}
                        </div>
                        <hr/>
                        <div>
                            ${problem.inputSpecification}
                        </div>
                        <hr/>
                        <div>
                            ${problem.outputSpecification}
                        </div>
                        <hr/>
                        <div>
                            ${problem.sampleTests}
                        </div>
                        <hr/>
                        <div>
                            ${problem.note===undefined?"":problem.note}
                        </div>
                        <hr/>
                    </body>
                </html>
            `;
        };


        panel.webview.html = await parseProblem(currInpProblem);

    };
    
}