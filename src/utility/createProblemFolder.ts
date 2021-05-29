import { Selection, TextEditor, window, workspace,ProgressLocation } from "vscode";
import {
  getTemplateFile,
  getTemplateLineNo,
  getUserHandle,
} from "./data";
import FileHandler from "./fileHandler";
// import axios from "../axios/axios";
import Problems from "./problems/problems";

const cheerio = require("cheerio");
const { join } = require("path");
const axios = require("axios");

let puppeteer: any = null;

let contestCode = 0;
let pdfTrue = false;

const baseUrl = "https://codeforces.com";

let dir: string = "";

const assetsDir = join(__filename, "..", "..", "..", "..", "res", "template");

export function createProblemFolder(
  contestId: number,
  name: string,
  problemId: string,
  pdf: boolean = false
) {
  const rootPath = workspace.workspaceFolders
    ? workspace.workspaceFolders[0]
    : null;

  if (!rootPath) {
    return;
  }

  window.withProgress(
    {
      location: ProgressLocation.Notification,
      title: `${contestId} Folder`,
    },
    async (progress, token): Promise<any> => {

      contestCode = contestId;
      pdfTrue = pdf;
      dir = join(rootPath.uri.fsPath, "Codeforces", `${contestCode}_ABC`);

      console.log("Dir: " + dir);

      progress.report({ increment: 20, message: "Fetching folder..." });

      createReqFiles();

      progress.report({ increment: 20, message: "Fetching problem..." });


      progress.report({ increment: 60, message: "Opening Sol files..." });

      getProblemTestCase({id:problemId, name:name})

      return;
    }
  );
  
}

function createReqFiles() {
  // await FileHandler.createDir(join(__dirname, "..", "Codeforces"));
  FileHandler.createDir(dir);
}


function getProblemTestCase(problem: any) {
  return axios
    .get(baseUrl+"/contest/" + contestCode + "/problem/" + problem.id)
    .then(async (res: any) => {
      const $ = cheerio.load(res.data);

      let testCases: any[] = [];

      $(".sample-tests .input pre").each(function (i: number, elem: any) {
        testCases[i] = { input: $(elem).text().trim() };
      });

      $(".sample-tests .output pre").each(function (i: number, elem: any) {
        testCases[i] = {
          ...testCases[i],
          output: $(elem).text().trim() + "\n",
        };
      });

      storeTestCases(problem, testCases, contestCode);
    })
    .catch((err: any) => handleError("Failed to get testcases"));
}

async function storeTestCases(problem: any, testCases: any, contestCode: any) {
  const problemLabel = `${problem.id}_${contestCode}_${problem.name}`;
  const problemDirLabel = `${problem.id}_${contestCode}_${problem.name}`;
  const problemDir = join(dir, problemLabel);

  let templateFile = getTemplateFile();

  if (!templateFile || !FileHandler.checkExist(templateFile)) {
    templateFile = join(assetsDir, "template.cpp");
  }

  FileHandler.createDir(problemDir);
  FileHandler.createFile(join(problemDir, problemLabel + ".cpp"), "");
  FileHandler.createDir(join(problemDir, "input"));
  FileHandler.createDir(join(problemDir, "output"));
  FileHandler.createDir(join(problemDir, "codeOutput"));

  if (!FileHandler.checkExist(join(problemDir, problemLabel + ".cpp"))) {
    FileHandler.copyFile(templateFile, join(problemDir, problemLabel + ".cpp"));
  }

  testCases.forEach((testCase: any, i: number) => {
    FileHandler.createFile(
      join(problemDir, "input", "input" + i + ".txt"),
      testCase.input
    );
    FileHandler.createFile(
      join(problemDir, "output", "output" + i + ".txt"),
      testCase.output
    );
  });

  console.log("Saved " + "TestCases " + problemLabel);
}

// async function openProblemsFiles(problemsId: any) {
//   for (const { id, name } of problemsId) {
//     await openProblemSolFile(id, name);
//   }
// }

// function openProblemSolFile(id: any, name: any) {
//   const problemSolFile = join(dir, `${id}_${name}`, `${id}_${name}.cpp`);
//   const row = getTemplateLineNo() ? getTemplateLineNo() : 0;

//   return FileHandler.openFile(problemSolFile, { preview: false }).then(
//     (editor: TextEditor) => {
//       const lineCount = editor.document.lineCount;
//       const cursorAtLine = lineCount >= row ? row - 1 : lineCount - 1;
//       const range = editor.document.lineAt(cursorAtLine).range;
//       editor.selection = new Selection(range.end, range.end);
//       editor.revealRange(range);
//       return;
//     }
//   );
// }

function handleError(error: string) {
  console.log("Got an Error. Please try again!!!");
  console.error(error);
  process.exit();
}