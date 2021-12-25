FROM python:3.11-rc-alpine
ARG BUILD_DEVELOPMENT
# if --build-arg BUILD_DEVELOPMENT=1, set BUILD_ENV to 'development' or set to null otherwise.
ENV BUILD_ENV=${BUILD_DEVELOPMENT:+development}
# if BUILD_ENV is null, set it to 'production' (or leave as is otherwise).
ENV BUILD_ENV=${BUILD_ENV:-production}
ENV SERVER_ADDRESS=${BUILD_ENV:-production}
RUN apk add --update \
    curl \
    && rm -rf /var/cache/apk/*
# https://github.com/hadolint/hadolint/wiki/DL4006
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
RUN if [ "${BUILD_ENV:-production}" = "production" ]; then SERVER_ADDRESS="$(curl http://checkip.amazonaws.com)" ; else SERVER_ADDRESS="$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1')"; fi; echo -e "[DEFAULT]\nhost=${SERVER_ADDRESS}:8080" > host.props
COPY requirements.txt .
EXPOSE 8080
RUN pip install --requirement requirements.txt
COPY . .
CMD ["python", "app.py"]