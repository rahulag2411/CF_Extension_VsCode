import * as vscode from 'vscode';
import { setStatusBarItem } from './utility/setStatusBar';
import * as data from './utility/data';
import { login, logout } from './component/login';
import { ProblemData } from "./interface/problemData";
import { Puppet } from './utility/extractProblemData';
import { CodeforcesDataProvider } from './component/showProblem';
import { Explorer } from './component/explorer';
import { createContestFolders } from './utility/createContestFolder';

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

				// console.log(userHandle, password);

				context.globalState.update("userHandle", userHandle);
				context.globalState.update("password", password);

				const logged = await login();
				console.log(logged);
				console.log("CSRF Token: " + data.getCsrfToken());
				if (!logged) {
					vscode.window.showErrorMessage(
						"User not logged in."
					);
					return;
				}

				data.setUser(userHandle, password);
				data.resetCookie();

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
					placeHolder: "problem link",
					prompt: "Enter problem link",
					validateInput: (problemLink) => {
						return problemLink !== null &&
							problemLink !== undefined &&
							problemLink !== ""
							? null
							: "problem link can not be empty";
					},
				}).then(async (problemLink) => {
					let problem: ProblemData = {};
					const puppet = new Puppet();
					if (problemLink !== undefined) {
						problem = await puppet.extractProblemData(problemLink);
						console.log(problem);
						const codeForcesDisplay = new CodeforcesDataProvider();
						await codeForcesDisplay.displaySelectedProblemInView(problem);
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
					placeHolder: "Contest link",
					prompt: "Enter Contest link",
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
				console.log(vscode.window.activeTextEditor?.document.fileName);
				var fileName = vscode.window.activeTextEditor?.document.fileName;
				var newString="";
				if (fileName) {
					for (var i = fileName.length - 1; i >= 0; i--) {
						if (fileName[i]==='\\') {
							break;
						}
						newString = fileName[i] + newString;
					}
				}
				console.log(newString);
				
				
				// const problemLink = "Sadasd";
				// let problem: ProblemData = {};
				// const puppet = new Puppet();
				// if (problemLink !== undefined) {
				// 	problem = await puppet.extractProblemData(problemLink);
				// 	console.log(problem);
				// 	const codeForcesDisplay = new CodeforcesDataProvider();
				// 	await codeForcesDisplay.displaySelectedProblemInView(problem);
				// }
			} catch (error) {
				console.log(error);
			}
		})
	
	context.subscriptions.push(disposable);
	context.subscriptions.push(loginCommand);
	context.subscriptions.push(logoutCommand);
	context.subscriptions.push(fetchProblem);
	context.subscriptions.push(fetchContest);
	context.subscriptions.push(showProblem);
}

export function deactivate() { }
