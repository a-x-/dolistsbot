FROM oven/bun:0.5

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
# COPY package.json bun.lockb ./
# Copy the rest of the application code to the container
COPY . ./

# Install the dependencies
RUN bun install


RUN pwd
RUN ls

# Start the bot using the Bun CLI
CMD ["bun", "run", "start"]
