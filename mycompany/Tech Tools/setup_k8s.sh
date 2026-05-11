#!/bin/bash

# Kubernetes Environment Setup Script
# Works on macOS, Linux, and Windows (via WSL)
# Automates installation of Docker, Kubectl, and Kind

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Kubernetes All-in-One Environment Setup        ${NC}"
echo -e "${BLUE}==================================================${NC}"

# 1. Detect OS
OS_TYPE="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="mac"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS_TYPE="windows"
fi

echo -e "Detected OS: ${GREEN}$OS_TYPE${NC}"

# Function to check dependency
check_dep() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 2. Check & Install Docker
if check_dep docker; then
    echo -e "${GREEN}✓ Docker is already installed.${NC}"
else
    echo -e "${YELLOW}! Docker is missing.${NC}"
    read -p "Would you like to install Docker? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OS_TYPE" == "mac" ]]; then
            echo "Installing Docker Desktop for Mac (via brew)..."
            brew install --cask docker
        elif [[ "$OS_TYPE" == "linux" ]]; then
            echo "Installing Docker for Linux..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            echo -e "${YELLOW}Please log out and back in for Docker group changes to take effect.${NC}"
        elif [[ "$OS_TYPE" == "windows" ]]; then
            echo -e "${RED}Please download and install Docker Desktop for Windows manually:${NC}"
            echo -e "https://www.docker.com/products/docker-desktop"
        fi
    fi
fi

# 3. Check & Install Kubectl
if check_dep kubectl; then
    echo -e "${GREEN}✓ Kubectl is already installed.${NC}"
else
    echo -e "${YELLOW}! Kubectl is missing.${NC}"
    read -p "Would you like to install Kubectl? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OS_TYPE" == "mac" ]]; then
            brew install kubectl
        elif [[ "$OS_TYPE" == "linux" ]]; then
            curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
            sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
        elif [[ "$OS_TYPE" == "windows" ]]; then
            echo -e "${RED}Please install Kubectl for Windows manually or use WSL.${NC}"
        fi
    fi
fi

# 4. Check & Install Kind
if check_dep kind; then
    echo -e "${GREEN}✓ Kind is already installed.${NC}"
else
    echo -e "${YELLOW}! Kind is missing.${NC}"
    read -p "Would you like to install Kind? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OS_TYPE" == "mac" ]]; then
            brew install kind
        elif [[ "$OS_TYPE" == "linux" ]]; then
            curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64
            chmod +x ./kind
            sudo mv ./kind /usr/local/bin/kind
        elif [[ "$OS_TYPE" == "windows" ]]; then
             echo -e "${RED}Please install Kind for Windows manually or use WSL.${NC}"
        fi
    fi
fi

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "To create a cluster, run: ${YELLOW}kind create cluster --name k8s-lab${NC}"
echo -e "${BLUE}==================================================${NC}"
