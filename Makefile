.PHONY: dev stop db-shell help migrate format lint test logs clean
.DEFAULT_GOAL := dev

# Start dev stack with live reload
dev:      ## Start dev stack with live reload
	docker compose up --build

# Stop containers but keep volumes
stop:     ## Stop containers but keep volumes
	docker compose down

# psql inside db
db-shell: ## psql inside db
	docker compose exec db psql -U $$POSTGRES_USER $$POSTGRES_DB

# Apply database migrations
migrate:  ## Run DB migrations
	docker compose exec backend alembic upgrade head

# Format code
format:   ## Run code formatter
	pre-commit run --all-files

# Run linters
lint:     ## Run linters
	pre-commit run --all-files

# Run tests
test:     ## Run backend & frontend tests
	docker compose exec backend pytest
	docker compose exec frontend pnpm test

# Show logs
logs:     ## Show logs
	docker compose logs -f

# Stop and remove all containers, networks, and volumes
clean:    ## Remove containers, networks, volumes
	docker compose down -v
	docker volume rm peer-bonus_postgres-data peer-bonus_redis-data || true

help:     ## Show this help
	@awk -F':|##' '/^[a-zA-Z0-9_-]+:.*?##/ { printf "\033[36m%-15s\033[0m %s\n", $$1, $$3 }' $(MAKEFILE_LIST)
