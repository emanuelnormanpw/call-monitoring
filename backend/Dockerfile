# Cargo.lock resolves crates that require edition2024 (idna_adapter, zeroize),
# which needs a far newer toolchain than 1.80.
FROM rust:1.90-slim AS builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
# Stub both targets: Cargo.toml declares a [lib] as well as a [[bin]], so a
# lone main.rs would fail this cache-priming build.
RUN mkdir src && echo "fn main() {}" > src/main.rs && touch src/lib.rs
RUN cargo build --release
RUN rm -rf src

COPY src ./src
# COPY preserves the repo's mtimes, which are older than the stub build above,
# so cargo could consider the crate fresh and ship the stub binary.
RUN touch src/main.rs src/lib.rs && cargo build --release

FROM debian:bookworm-slim

WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/backend /app/backend

EXPOSE 3000
CMD ["/app/backend"]