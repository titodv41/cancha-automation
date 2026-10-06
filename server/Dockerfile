FROM node:24-bookworm-slim
WORKDIR /app
COPY server/ ./server/
COPY scripts/instagram.mjs ./scripts/
COPY content/instagram/drafts.json content/instagram/bootstrap.json ./content/instagram/
COPY config/automated-organizers.json ./config/automated-organizers.json
RUN chmod -R a+rX /app/server /app/scripts /app/content /app/config && mkdir /data && chown node:node /data && chmod 700 /data && chmod 755 /app/server/entrypoint.sh
ENV BIND_ADDRESS=0.0.0.0 PORT=8787 CANCHA_SUBMISSIONS_DB=/data/submissions.sqlite CANCHA_CONTENT_DB=/data/instagram.sqlite CANCHA_META_DB=/data/meta.sqlite
EXPOSE 8787
ENTRYPOINT ["/app/server/entrypoint.sh"]
