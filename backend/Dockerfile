# Stage 1: Builder (Kompilasi kode Rust)
FROM rust:1.80-slim AS builder

WORKDIR /app

# Trick caching layer: install dependency terlebih dahulu agar re-build cepat saat koding
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

# Copy source code asli dan build binary akhir
COPY src ./src
RUN cargo build --release

# Stage 2: Runtime (Lingkungan eksekusi bersih)
FROM debian:bookworm-slim

WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy binary eksekusi dari stage builder
COPY --from=builder /app/target/release/backend /app/backend

EXPOSE 3000
CMD ["/app/backend"]