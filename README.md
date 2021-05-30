# CfExtension - Making CF easier

The VS Code extension serves the purpose of making coding on Codeforces easier and smooth while extracting the benefits of working in VS Code. Reading the problem and submitting your solution are just a click away without needing to switch between your browser and IDE.

### Features

- Clone a single problem or a whole contest with a .cpp file for each question for you to code in
- With 'show-problem' feature, one can view problem statement simultaneously while coding without a need to switch to browser
- Test the sample cases and submit the problem in just 1 click
- View all the running contests at a given time and participate in the ones you wish to

### Get Started

**Logging in:** 

1. Open command palette (Ctrl+Shift+P)
2. Write User login. It will ask for the username/email and password of your codeforces account
3. Enter the required details and now you are logged in.

**Fetching a problem:**

1. IOpen the folder for your CF codes in VS Code. 
2. In the command palette type Problem-url and enter.
3. Next, you need to enter the URL of the problem you want to solve.
4. With this, on the explorer pane the required files will be created.
5. In the Sol.cpp file you can code your solution.

**Fetching a contest:**

1. Open the folder for your CF codes in VS Code. 
2. In the command palette type Contest-url and enter.
3. Next, you need to enter the code of the contest (For ex: code for contest URL [https://codeforces.com/contest/1526](https://codeforces.com/contest/1526) is 1526) you want to solve.
4. With this, on the explorer pane the required files will be created.
5. In the Sol.cpp file for each problem you can code your solution for the respective problem.

 **Get Running Contests:**

1. In the command palette type get-running-contests and enter
2. A list of currently running contests appears.
3. Choose the one you wish to participate in and the required files will be created. 

**Viewing Problem in VS Code:**

1. Show problem button on the top right corner allows you to view the problem in split-screen view.

**Test Sample Cases:**

1. Once done with the coding part, you may proceed to check the sample test cases by clicking on Test Sample case button on top right corner of the window.
2. The input, expected output and output of your code can be viewed from input0.txt, output0.txt and codeOutput0.txt files in the explorer pane.

**Submit Problem:**

1. Once done with the coding part, you may proceed to submit your code right away (Submit problem button on the top right corner).

**Compiling your code:**

- You can choose the compiler of C++ which should be used to compile you solution. Additional arguments can also be passed. For example std of C++ (`g++ --std=c++14`).

With this you are all set to go!

Happy Coding!
