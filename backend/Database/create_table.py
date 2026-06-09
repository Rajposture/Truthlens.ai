# backend/Database/create_table.py

from Database.db import (
    engine,
    Base
)

from Database.models import (
    Verification
)

Base.metadata.create_all(
    bind=engine
)

print(
    "Neon tables created successfully"
)