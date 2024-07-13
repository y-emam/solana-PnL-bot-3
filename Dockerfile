FROM node:18-alpine
# Import a Node.js image that runs on top of an Alpine image.
RUN mkdir -p /home/app
# This command will create a subdirectory called "app" in the /home directory of the Alpine image.
WORKDIR /home/app
# This command will set the default directory as /home/app.
# Hence, the next commands will start executing from the /home/app directory of the Alpine image.
COPY package*.json ./
# To copy both package.json and package-lock.json to the working directory (/home/app) of the Alpine image.
RUN npm install
# This will create a node_modules folder in /home/app 
# And it will install all the dependencies specified in the package.json file.
COPY . .
# Here “.” represents the current working directory.
# This command will copy all files in the current directory to the working directory (/home/app) of the Alpine image.
EXPOSE 3000
# Make the application available on port 3000. By doing this, you can access the Nodejs application via port 3000.
CMD ["npm", "start"]
# One important thing to notice here is that “RUN” command executes while the image creation process is running
# “CMD” command executes only after the image creation process is finished.
# One Dockerfile may consist of more than one "RUN" command, but it can only consist of one "CMD" command.