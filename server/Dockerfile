FROM golang:1.25-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main .
RUN chmod +x main


FROM gcr.io/distroless/base-debian11

WORKDIR /app

COPY --from=build /app/main .
COPY --from=build /app/.env .env

EXPOSE 4000

CMD ["./main"]
