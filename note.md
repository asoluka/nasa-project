### &&

Using the && symbol in npm scripts means,
Run the command on the left and when it's completed, run the command on the right.

But if we use just &, it means,
Run the command on the left and go ahead to run the command on the right without waiting
for the first process to be completed.

### --prefix

Using the --prefix flag enables us tell node where to run the command preceeding the flag
e.g. npm run watch --prefix server means,
Run the command on the left in the /server directory.

### Prod build

To build our client app for production, we can set the build path to
point to our server so that we just have to run our server on one
port and also serve the client app from there.

In the build script on our client package.json, we'll write;
"BUILD_PATH=..server/public react-scripts build"
