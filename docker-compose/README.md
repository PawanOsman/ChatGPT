# Docker Compose Deployment Guide

This guide provides instructions on how to deploy the Docker Compose applications within this project.

## Prerequisites

Before proceeding, ensure you have Docker and Docker Compose installed on your system:

- Docker: [Get Docker](https://docs.docker.com/get-docker/)
- Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)

## Deployment Instructions

Within this project, there are multiple Docker Compose applications. Each can be deployed using its respective `docker-compose.yaml` file. Here's how to deploy each one:

Certainly! You can use `curl` or `wget` to download the Docker Compose file directly from a given URL (if the files are hosted online and have a direct URL). Here's how you can do it in a one-liner command for each service, followed by the command to run it:

###  [BetterChatGPT](https://github.com/ztjhz/BetterChatGPT)

```sh
curl -L -o docker-compose.yaml https://raw.githubusercontent.com/PawanOsman/ChatGPT/main/docker-compose/bettergpt/docker-compose.yaml
docker-compose -f docker-compose.yaml up -d
```

Or if you're using `wget`:

```sh
wget https://raw.githubusercontent.com/PawanOsman/ChatGPT/main/docker-compose/bettergpt/docker-compose.yaml -O docker-compose.yaml
docker-compose -f docker-compose.yaml up -d
```

### [ChatGPT Next Web](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)

```sh
curl -L -o docker-compose.yaml https://raw.githubusercontent.com/PawanOsman/ChatGPT/main/docker-compose/chatgpt-next-web/docker-compose.yaml
docker-compose -f docker-compose.yaml up -d
```

Or with `wget`:

```sh
wget https://raw.githubusercontent.com/PawanOsman/ChatGPT/main/docker-compose/chatgpt-next-web/docker-compose.yaml -O docker-compose.yaml
docker-compose -f docker-compose.yaml up -d
```

### [Lobe Chat](https://github.com/lobehub/lobe-chat)

```sh
curl -L -o docker-compose.yaml https://raw.githubusercontent.com/PawanOsman/ChatGPT/main/docker-compose/lobe-chat/docker-compose.yaml
docker-compose -f docker-compose.yaml up -d
```

Or using `wget`:

```sh
wget https://raw.githubusercontent.com/PawanOsman/ChatGPT/main/docker-compose/lobe-chat/docker-compose.yaml -O docker-compose.yaml
docker-compose -f docker-compose.yaml up -d
```

## Managing the Applications

Once deployed, you can manage your applications with the following commands:

- To view the status of your services:
  ```sh
  docker-compose ps
  ```

- To stop the services:
  ```sh
  docker-compose down
  ```

- To view the logs of a service:
  ```sh
  docker-compose logs [service-name]
  ```

Replace `[service-name]` with the name of the service you want to check the logs for.

## Additional Notes

- Ensure you are in the correct directory before running the `docker-compose` commands.
- Use the `-d` flag to run containers in detached mode.
- To pull the latest images before starting containers, use the command `docker-compose pull`.

Thank you for using this project. Please report any issues or provide feedback to the project maintainers.