import * as vscode from 'vscode';
import { setStatusBarItem } from './utility/setStatusBar';
import * as data from './utility/data';
import { login, logout } from './component/login';
import { ProblemData } from "./interface/problemData";
import { Puppet } from './utility/extractProblemData';
import { CodeforcesDataProvider } from './component/showProblem';
import { Explorer } from './component/explorer';
import { createContestFolders } from './utility/createContestFolder';
import { submitSolution } from './utility/submit';
import { createProblemFolder } from './utility/createProblemFolder';
import { checker } from './utility/checker';

const axios = require('axios');
const baseURL = "https://codeforces.com";

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "cfExtension" is now active!');
	let disposable = vscode.commands.registerCommand('cfExtension.helloWorld', () => {

		vscode.window.showInformationMessage('Hello World from cfExtension!');
	});

	data.setUser(
		context.globalState.get("userHandle"),
		context.globalState.get("password")
	);



	//status bar login status
	const loginStatusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		1
	);
	setStatusBarItem(loginStatusBarItem);



	//update user and password
	const loginCommand = vscode.commands.registerCommand(
		'cfExtension.login',
		async () => {
			vscode.window.showInputBox({
				placeHolder: "Enter user",
				prompt: "Enter user name or Email of Codeforces account",
				validateInput: (userHandle) => {
					return userHandle !== null &&
						userHandle !== undefined &&
						userHandle !== ""
						? null
						: "User name can not be empty";
				},
			}).then(async (userHandle) => {
				const password = await vscode.window.showInputBox({
					placeHolder: "Enter password",
					prompt: "Enter password of Codeforces account",
					password: true,
				});

				console.log(userHandle, password);

				context.globalState.update("userHandle", userHandle);
				context.globalState.update("password", password);
				data.setUser(userHandle, password);
				var temp = "";
				const logged = await login().then((cookie) => {
					temp = cookie;
					return cookie;
				});
				console.log(temp);
				console.log(data.getCookie())
				console.log("CSRF Token: " + data.getCsrfToken());
				if (!logged) {
					vscode.window.showErrorMessage(
						"User not logged in."
					);
					return;
				}
				data.setCookie(temp);
				data.setUser(userHandle, password);
				// data.resetCookie();

			});
		}
	);

	const logoutCommand = vscode.commands.registerCommand(
		'cfExtension.logout',
		async () => {
			console.log("LOGOUT")
			try {
				if (data.getCsrfToken() == null || data.getUserHandle() == undefined) {
					vscode.window.showErrorMessage(
						"No user currently logged In."
					);
					return;
				}
				const loggedOut = await logout();
				console.log(loggedOut);
			} catch (error) {
				console.log(error);
			}


		})

	const fetchProblem = vscode.commands.registerCommand(
		'cfExtension.fetchProblem',
		async () => {
			try {
				vscode.window.showInputBox({
					placeHolder: "Problem link. For example - https://codeforces.com/contest/1526/problem/A",
					prompt: "Enter problem link",
					validateInput: (problemLink) => {
						return problemLink !== null &&
							problemLink !== undefined &&
							problemLink !== ""
							? null
							: "problem link can not be empty";
					},
				}).then(async (problemLink) => {
					var indexOfContest = problemLink?.indexOf("contest")
					// console.log("indexOFcontest"+indexOfContest);
					var splitted = problemLink?.split("/");
					// console.log(splitted);
					var problemCode = "";
					var contestCode = "";
					if (splitted) {
						problemCode = splitted[splitted?.length - 1];
						if (indexOfContest === -1) {
							contestCode = splitted[splitted.length - 2];
						} else {
							contestCode = splitted[splitted.length - 3];
						}
					}
					console.log("problemCode-->" + problemCode);
					console.log("contestCode-->" + contestCode);
					const id = Number(contestCode);
					const currcontest = new Explorer(
						`${contestCode}_ABC`,
						`Contest`,
						vscode.TreeItemCollapsibleState.None,
						id,
						"Past",
						"contestDetail"
					);
					if (currcontest && currcontest.explorerId) {
						createProblemFolder(id, "Sol", problemCode);
						// createContestFolders(currcontest.explorerId, currcontest.label);
					}

				})
			} catch (error) {
				console.log(error);
			}
		})

	const fetchContest = vscode.commands.registerCommand(
		'cfExtension.fetchContest',
		async () => {
			try {
				vscode.window.showInputBox({
					placeHolder: "Contest Code. For Ex - 1526 is contest code of https://codeforces.com/contest/1526",
					prompt: "Enter Contest Code",
					validateInput: (contestLink) => {
						return contestLink !== null &&
							contestLink !== undefined &&
							contestLink !== ""
							? null
							: "Contest link can not be empty";
					},
				}).then((contestLink) => {
					const id = Number(contestLink);
					const currcontest = new Explorer(
						`${contestLink}_ABC`,
						`Contest`,
						vscode.TreeItemCollapsibleState.None,
						id,
						"Past",
						"contestDetail"
					);
					if (currcontest && currcontest.explorerId) {
						createContestFolders(currcontest.explorerId, currcontest.label);
					}
				})
			} catch (error) {
				console.log(error);
			}
		})

	const showProblem = vscode.commands.registerCommand(
		'cfExtension.showproblem',
		async () => {
			try {
				await vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: `Showing Problem`,
					cancellable: false,
				}, async (progress) => {
					progress.report({
						message: "Requesting codeforces",
						increment: 10
					})
					console.log(vscode.window.activeTextEditor?.document.fileName);
					var fileName = vscode.window.activeTextEditor?.document.fileName;
					var newString = "";
					if (fileName) {
						for (var i = fileName.length - 1; i >= 0; i--) {
							if (fileName[i] === '\\') {
								break;
							}
							newString = fileName[i] + newString;
						}
					}
					console.log(newString);
					var contestCode = "";
					var problemCode = "";
					if (newString) {
						var count1 = 0;

						for (var i = 0; i < newString.length; i++) {
							if (newString[i] == '_' && count1 == 0) {
								count1 += 1;
								continue;
							}
							else if (newString[i] == '_') {
								break;
							}
							if (count1 == 0) {
								problemCode = problemCode + newString[i];
							}
							else {
								contestCode = contestCode + newString[i];
							}

						}
					}
					var prob = "https://codeforces.com/contest/" + contestCode + "/problem/" + problemCode;

					console.log(prob);
					const problemLink = prob;
					let problem: ProblemData = {};
					const puppet = new Puppet();
					if (problemLink !== undefined) {
						problem = await puppet.extractProblemData(problemLink);
						console.log(problem);
						const codeForcesDisplay = new CodeforcesDataProvider();
						await codeForcesDisplay.displaySelectedProblemInView(problem);
					}
					progress.report({
						message: "Problem fetched successfully",
						increment: 100
					})
				})
			} catch (error) {
				console.log(error);
			}
		})

	const submitProblem = vscode.commands.registerCommand(
		'cfExtension.submitproblem',
		async (node: any) => {
			console.log("Submit.....");
			var fileName = vscode.window.activeTextEditor?.document.fileName;
			var newString = "";
			if (fileName) {
				for (var i = fileName.length - 1; i >= 0; i--) {
					if (fileName[i] === '\\') {
						break;
					}
					newString = fileName[i] + newString;
				}
			}
			console.log(newString);
			var contestCode = "";
			var problemCode = "";
			if (newString) {
				var count1 = 0;

				for (var i = 0; i < newString.length; i++) {
					if (newString[i] == '_' && count1 == 0) {
						count1 += 1;
						continue;
					}
					else if (newString[i] == '_') {
						break;
					}
					if (count1 == 0) {
						problemCode = problemCode + newString[i];
					}
					else {
						contestCode = contestCode + newString[i];
					}

				}
			}
			// const detail = getContestId(node);
			if (!contestCode || !problemCode) {
				vscode.window.showErrorMessage(
					"File does not belong to codeforces contest"
				);
				return;
			}
			await submitSolution(Number(contestCode), problemCode);
			// contestsProvider.refresh();
		})

	const runSampleTest = vscode.commands.registerCommand(
		'cfExtension.runSample',
		async (node: any) => {
			console.log("Testing.....");
			var fileName = vscode.window.activeTextEditor?.document.fileName;
			var newString = "";
			if (fileName) {
				for (var i = fileName.length - 1; i >= 0; i--) {
					if (fileName[i] === '\\') {
						break;
					}
					newString = fileName[i] + newString;
				}
			}
			console.log(newString);
			var contestCode = "";
			var problemCode = "";
			if (newString) {
				var count1 = 0;

				for (var i = 0; i < newString.length; i++) {
					if (newString[i] == '_' && count1 == 0) {
						count1 += 1;
						continue;
					}
					else if (newString[i] == '_') {
						break;
					}
					if (count1 == 0) {
						problemCode = problemCode + newString[i];
					}
					else {
						contestCode = contestCode + newString[i];
					}

				}
			}
			// const detail = getContestId(node);
			if (!contestCode || !problemCode) {
				vscode.window.showErrorMessage(
					"File does not belong to codeforces contest"
				);
				return;
			}
			const checkerResult = await checker(Number(contestCode), problemCode);
			console.log("checkerResSubmit--->" + checkerResult);

			if (!checkerResult) {
				vscode.window.showErrorMessage(
					"Solution failed in sample test cases."
				);
			} else {
				vscode.window.showInformationMessage(
					"Solution passed in all sample test cases"
				);
			}
		})

	const getRunningContests = vscode.commands.registerCommand(
		'cfExtension.runningcontest',
		async (node: any) => {
			const URL = "/api/contest.list";
			const res = await axios.get(baseURL + URL)
			console.log("data" + res.data);

			const allContests = res.data["result"];
			console.log(allContests);

			var arr = [];
			for (let index = 0; index < allContests.length; index++) {
				const element = allContests[index];
				if (element.phase === 'CODING') {
					arr.push(element);
				}
			}
			console.log(arr);
			const contestTOshow = arr.map((contest) => {
				return {
					label: contest.name,
					detail: contest.id
				}
			})
			console.log(contestTOshow);

			console.log(contestTOshow);
			const abc = [];
			for (let index = 0; index < contestTOshow.length; index++) {
				const element = contestTOshow[index];
				let te = element.label + ". Contest code: " + element.detail;
				abc.push(te);
			}
			console.log(abc);

			const shownContest = await vscode.window.showQuickPick(abc)
			console.log(shownContest);
			var splitted = shownContest?.split(" ");
			var contestCode = ""
			if (splitted) {
				contestCode = splitted[splitted?.length - 1];
			}
			console.log(Number(contestCode));
			const id = Number(contestCode);
			const currcontest = new Explorer(
				`${contestCode}_ABC`,
				`Contest`,
				vscode.TreeItemCollapsibleState.None,
				id,
				"Past",
				"contestDetail"
			);
			if (currcontest && currcontest.explorerId) {
				createContestFolders(currcontest.explorerId, currcontest.label);
			}
		})

	context.subscriptions.push(disposable);
	context.subscriptions.push(loginCommand);
	context.subscriptions.push(logoutCommand);
	context.subscriptions.push(fetchProblem);
	context.subscriptions.push(fetchContest);
	context.subscriptions.push(showProblem);
	context.subscriptions.push(runSampleTest);
	context.subscriptions.push(submitProblem);
	context.subscriptions.push(getRunningContests);
}

export function deactivate() { }
