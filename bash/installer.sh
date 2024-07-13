cd $HOME

sudo apt update
sudo apt install docker.io cron s3fs -y 
sudo apt install docker.io -y 
sudo systemctl restart docker
sudo nohup dockerd &
sleep 2

# Download Images from Docker Hub
sudo docker pull yasseremam25/solana-bot

#RUN the Docker images

sudo echo """
sudo docker run --rm --name web1-Hooks-generation-bot -p 8000:5000 -d -it nas701/cybersec922-web1
sudo docker run  --rm --name web2-Scene-Optimisation-Bot -p 8989:5000 -d -it nas701/cybersec922-web2
sudo docker run   --rm --name web3-Video-To-Text-Transcriber-Bot -p 8181:5000 -v ./paddleocr:/root/.paddleocr -d -it nas701/cybersec922-web3
sudo docker run   --rm --name web4-Text-To-Video-Bot -p 9898:5000 -d -it nas701/cybersec922-web4
sudo docker run  --rm --name web5-Intro-Optimisation-Bot -p 7777:5000 -d -it nas701/cybersec922-web5
# sudo docker run  --rm --name solana-bot-3 -p 3001:3000 -d -it yasseremam25/solana-bot
""" > run_cyber_web

sudo chmod +x run_cyber_web
sudo cp run_cyber_web /usr/local/bin/run_cyber_web


run_cyber_web

# crontab command to start up
cat <<EOF | sudo crontab -
@reboot sudo run_cyber_web &
@reboot sudo nohup dockerd &
EOF


echo "Installed and ran the servers and Code and dockerfiles are available in $HOME/$REPO_NAME"