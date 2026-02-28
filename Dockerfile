FROM node:20-bookworm-slim

# Default Environment Variables to prevent UI build failing
ENV NEXT_PUBLIC_SUPABASE_URL=true
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=true

# Install Python and core dependencies globally inside this isolated OS container
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Break system packages is safe inside a Docker container
RUN rm -f /usr/lib/python3.11/EXTERNALLY-MANAGED

# Create app directory
WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json ./

# Install NO dependencies purely (safest on Easypanel)
RUN npm install

# Copy application source
COPY . .

# Install Python libraries globally
WORKDIR /app/intelligence
RUN python3 -m pip install --upgrade pip --break-system-packages
RUN python3 -m pip install -r requirements.txt --break-system-packages
WORKDIR /app

# Build Next.js application
RUN npm run build

# Start the application
CMD ["npm", "start"]
