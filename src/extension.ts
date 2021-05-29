import * as vscode from 'vscode';
import {setStatusBarItem} from './utility/setStatusBar';
import * as data from './utility/data';
import {login,logout} from './component/login';

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
		  }).then(async (userHandle) =>{
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
			console.log("CSRF Token: "+ data.getCsrfToken());
			if(!logged) {
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
             if(data.getCsrfToken() == null || data.getUserHandle() == undefined){
				vscode.window.showErrorMessage(
					"No user currently logged In."
				 );
				 return;
			 }
			const loggedOut = await logout();
			console.log(loggedOut);

		})
	
	  context.subscriptions.push(disposable);
	  context.subscriptions.push(loginCommand);
	  context.subscriptions.push(logoutCommand)
	}
	



export function deactivate() {}
