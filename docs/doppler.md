# Using Doppler CLI in Docker
Learn how to install the Doppler CLI in your Docker image to inject secrets at container runtime.

# Prerequisites
You've run applications in Docker and have experience building Docker images.

# Installation
This method installs the Doppler CLI in your Docker image to inject secrets at container runtime.

# Install Doppler CLI

```
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler
```

Your Dockerfile will then need to use doppler run in either the ENTRYPOINT or CMD to fetch your secrets at container runtime. As a general rule, CMD is the easiest way to get started, but we'll explore both options below.

# CMD
Unless you're an experienced Docker user, we recommend using the CMD method as it requires minimal changes to your Dockerfile:

```
CMD ["doppler", "run", "--", "your-command-here"]
```

- Doesn't require an understanding of the difference between ENTRYPOINT and CMD
- Simple as it works with an existing ENTRYPOINT without requiring changes
- Easily able to bypass the Doppler CLI by overriding the CMD at container runtime

# ENTRYPOINT
If you're an experienced Docker user, you may prefer using the ENTRYPOINT method. This method requires more changes to your Dockerfile, but it offers more flexibility and control over the container's behavior.

```
ENTRYPOINT ["doppler", "run", "--", "your-command-here"]
```

- More flexible and control over the container's behavior
- Requires more changes to the Dockerfile
- Allows for more complex command line arguments
- Allows for more complex command line arguments

# Running the Container
Accessing your secrets in production or CI/CD environments requires a Service Token to provide read-only access to a specific Config within a Project.

When installing the Doppler CLI in your Docker image, the DOPPLER_TOKEN environment variable must be provided to the container so it can fetch secrets:

```
# The $DOPPLER_TOKEN environment variable should be injected by your platform or deployment process.
docker run -e DOPPLER_TOKEN="$DOPPLER_TOKEN" your-application
```