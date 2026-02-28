FROM node:20-bookworm-slim

# Install Python and its dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package.json and lock files
COPY package.json package-lock.json* ./

# Install Node modules
RUN npm ci || npm install

# Copy the rest of the application
COPY . .

# Set up Python Environment safely inside the /app directory
WORKDIR /app/intelligence
RUN python3 -m venv venv
RUN ./venv/bin/pip install --upgrade pip
RUN ./venv/bin/pip install -r requirements.txt
WORKDIR /app

# Build Next.js application
RUN npm run build

# Expose the listening port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
