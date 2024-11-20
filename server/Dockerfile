FROM golang:1.23.0-alpine

WORKDIR /app

COPY . .
RUN go mod download
RUN go build -o main .
RUN chmod +x main

EXPOSE 4000

CMD ["./main"]
