"""Add password_hash and is_active to users

Revision ID: 20250728000001
Revises: 20250728_add_reactions_table
Create Date: 2025-07-28 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250728000001'
down_revision = '20250728_reactions'
branch_labels = None
depends_on = None

def upgrade():
    # Add password_hash column
    op.add_column('users', sa.Column('password_hash', sa.String(length=255), nullable=False, server_default=''))
    # Add is_active column  
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')))
    
    # Remove server defaults after adding columns
    op.alter_column('users', 'password_hash', server_default=None)
    op.alter_column('users', 'is_active', server_default=None)

def downgrade():
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'password_hash')