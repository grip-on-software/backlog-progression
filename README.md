# Product backlog progression chart

This project was bootstrapped with [Create React 
App](https://github.com/facebook/create-react-app), uses 
[TypeScript](https://www.typescriptlang.org) and relies on [Redux 
Toolkit](https://redux-toolkit.js.org/). The latter is an opinionated toolset 
for building Redux apps quickly and efficiently.

## Developer notes

This project does not connect with the JIRA API, but instead relies on local copies of JSON responses from the JIRA API. The JSON copies are preprocessed by a quick-and-ditry Python script that is available in the `preprocess` folder. This is because the chart is generated based on all the changes to all the issues from a JIRA project, which causes severe performance degradation if fetched and applied to the chart in real-time. The output from the scripts can be copied to the `public/data/${PROJECTKEY}` folder in this repository.

It should be evident that this method is not suitable for long-term use, and a better method of extracting the JIRA data should be found.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
