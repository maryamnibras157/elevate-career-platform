"""Merge heads

Revision ID: a1dba4a351d8
Revises: 1f2a3b4c5d6e, 435961fb6a87
Create Date: 2026-07-27 14:44:14.643155

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1dba4a351d8'
down_revision: Union[str, None] = ('1f2a3b4c5d6e', '435961fb6a87')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
