FROM python:3.11-rc-alpine
ARG BUILD_DEVELOPMENT
ENV BUILD_ENV=${BUILD_DEVELOPMENT:+development}
ENV BUILD_ENV=${BUILD_ENV:-production}
ENV SERVER_ADDRESS=${BUILD_ENV:-production}
RUN apk add --update \
    curl \
    && rm -rf /var/cache/apk/*
# https://github.com/hadolint/hadolint/wiki/DL4006
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
COPY requirements.txt .
EXPOSE 8080
RUN pip install --requirement requirements.txt
COPY app.py app.py
CMD ["python", "app.py"]