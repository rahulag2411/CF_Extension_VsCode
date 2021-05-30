import * as vscode from "vscode";
import * as puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import axios from "axios";
import { ProblemData } from "../interface/problemData";

export class Puppet{
    browser?:puppeteer.Browser;
    extractProblemData = async (url:string):Promise<ProblemData>=> {
        if(this.browser === undefined){
            this.browser = await puppeteer.launch({headless:true});
        }
        const page:puppeteer.Page = await this.browser.newPage();
        await page.goto(url);
        const problem:ProblemData = {};
        problem.name = await page.evaluate(() => document.querySelector("#pageContent > div.problemindexholder > div > div > div.header > div.title")?.textContent?.trim());
        problem.timeLimit = await page.evaluate(() => document.querySelector("#pageContent > div.problemindexholder > div > div > div.header > div.time-limit")?.textContent?.trim().replace("time limit per test","")); 
        problem.memoryLimit = await page.evaluate(() => document.querySelector("#pageContent > div.problemindexholder > div > div > div.header > div.memory-limit")?.textContent?.trim().replace("memory limit per test",""));   
        problem.inputType = await page.evaluate(() => document.querySelector("#pageContent > div.problemindexholder > div > div > div.header > div.input-file")?.textContent?.trim().substring(5));
        problem.outputType = await page.evaluate(() => document.querySelector("#pageContent > div.problemindexholder > div > div > div.header > div.output-file")?.textContent?.trim().substring(6));
        problem.problemStatement = await page.evaluate(() => {
            let temp = document.querySelectorAll(".MJX_Assistive_MathML");
            for(let i = 0;i<temp.length;i++){
                temp[i].parentNode?.removeChild(temp[i]);
            }
            return document.querySelector("#pageContent > div.problemindexholder > div > div > div:nth-child(2)")?.innerHTML?.toString().trim()
        });
        problem.inputSpecification = await page.evaluate(() => {
            let temp = document.querySelectorAll(".MJX_Assistive_MathML");
            for(let i = 0;i<temp.length;i++){
                temp[i].parentNode?.removeChild(temp[i]);
            }
            return document.querySelector(".input-specification")?.innerHTML?.toString().trim();
        });
        problem.outputSpecification = await page.evaluate(() => {
            let temp = document.querySelectorAll(".MJX_Assistive_MathML");
            for(let i = 0;i<temp.length;i++){
                temp[i].parentNode?.removeChild(temp[i]);
            }
            return document.querySelector(".output-specification")?.innerHTML.toString().trim();
        });
        problem.sampleTests = await page.evaluate(() => {
            let temp = document.querySelectorAll(".MJX_Assistive_MathML");
            for(let i = 0;i<temp.length;i++){
                temp[i].parentNode?.removeChild(temp[i]);
            }
            return document.querySelector("#pageContent > div.problemindexholder > div > div > div.sample-tests")?.innerHTML?.toString().trim().split('Copy</div>').join('</div>').split('class="section-title">Examples<').join('class="section-title">Examples<br></br><').split('class="section-title">Example<').join('class="section-title">Example<br></br><');
        });
        problem.note = await page.evaluate(() => {
            let temp = document.querySelectorAll(".MJX_Assistive_MathML");
            for(let i = 0;i<temp.length;i++){
                temp[i].parentNode?.removeChild(temp[i]);
            }
            return document.querySelector("#pageContent > div.problemindexholder > div > div > div.note")?.innerHTML?.toString().trim();
        });
        problem.contestId = parseInt(url.split("/")[url.split("/").length - 2]);
        problem.index = url[url.length - 1];
        problem.type = "PROGRAMMING";
        problem.rating = await page.evaluate(() => parseInt(document.querySelector(`span[title="Difficulty"]`)?.textContent?.trim().replace("*","") as string));
        problem.tags = await page.evaluate(() => {
            let tt = document.querySelector(`div[style="padding: 0.5em;"]`)?.children as HTMLCollection;
            let aaoa:string[] = [];
            for(let i = 0;i<=(tt?.length as number) -3;i++){
                aaoa.push(tt[i].textContent?.trim() as string);
            }
            return aaoa;
        });
        
        problem.solvedCount = undefined;
        page.close();
        return problem;
    };
}