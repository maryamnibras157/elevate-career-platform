"""sprint_11_admin_models

Revision ID: 1f2a3b4c5d6e
Revises: e608b3b49f50
Create Date: 2026-07-26 15:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1f2a3b4c5d6e'
down_revision = 'e608b3b49f50'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create AdminRole enum
    sa.Enum('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER', name='adminrole').create(op.get_bind())

    # Create admin_permissions table
    op.create_table('admin_permissions',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admin_permissions_name'), 'admin_permissions', ['name'], unique=True)

    # Create admin_profiles table
    op.create_table('admin_profiles',
    sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('role', postgresql.ENUM('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER', name='adminrole', create_type=False), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_by_id', postgresql.UUID(as_uuid=True), nullable=True),
    sa.Column('updated_by_id', postgresql.UUID(as_uuid=True), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['updated_by_id'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id')
    )
    op.create_index(op.f('ix_admin_profiles_created_at'), 'admin_profiles', ['created_at'], unique=False)
    op.create_index(op.f('ix_admin_profiles_is_active'), 'admin_profiles', ['is_active'], unique=False)
    op.create_index(op.f('ix_admin_profiles_role'), 'admin_profiles', ['role'], unique=False)
    op.create_index(op.f('ix_admin_profiles_updated_at'), 'admin_profiles', ['updated_at'], unique=False)

    # Create admin_profile_permissions association table
    op.create_table('admin_profile_permissions',
    sa.Column('admin_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('permission_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['admin_id'], ['admin_profiles.user_id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['permission_id'], ['admin_permissions.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('admin_id', 'permission_id')
    )


def downgrade() -> None:
    op.drop_table('admin_profile_permissions')
    op.drop_index(op.f('ix_admin_profiles_updated_at'), table_name='admin_profiles')
    op.drop_index(op.f('ix_admin_profiles_role'), table_name='admin_profiles')
    op.drop_index(op.f('ix_admin_profiles_is_active'), table_name='admin_profiles')
    op.drop_index(op.f('ix_admin_profiles_created_at'), table_name='admin_profiles')
    op.drop_table('admin_profiles')
    op.drop_index(op.f('ix_admin_permissions_name'), table_name='admin_permissions')
    op.drop_table('admin_permissions')
    sa.Enum('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER', name='adminrole').drop(op.get_bind())
