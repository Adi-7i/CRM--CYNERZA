"""add_import_session_model

Revision ID: 5c9c4e78bfe3
Revises: aef6f9de3d30
Create Date: 2026-01-03 23:15:37.574953

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '5c9c4e78bfe3'
down_revision: Union[str, Sequence[str], None] = 'aef6f9de3d30'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop old tables if they exist (from previous implementation)
    op.execute("DROP TABLE IF EXISTS mapping_templates")
    op.execute("DROP TABLE IF EXISTS import_sessions")
    
    # Create fresh import_sessions table
    op.create_table(
        'import_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'ANALYZING', 'MAPPING', 'PREVIEWING', 'EXECUTING', 'COMPLETED', 'FAILED', name='importsessionstatus'), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=True, comment='Original file name'),
        sa.Column('total_rows', sa.Integer(), nullable=True, comment='Total rows in file'),
        sa.Column('valid_rows', sa.Integer(), nullable=True, comment='Valid rows after validation'),
        sa.Column('imported_count', sa.Integer(), nullable=True, comment='Successfully imported leads'),
        sa.Column('error_message', sa.Text(), nullable=True, comment='Error message if failed'),
        sa.Column('detected_columns', sa.JSON(), nullable=True, comment='Detected column names from file'),
        sa.Column('column_mappings', sa.JSON(), nullable=True, comment='Column to CRM field mappings'),
        sa.Column('file_data', sa.JSON(), nullable=True, comment='Parsed file data as JSON'),
        sa.Column('user_id', sa.Integer(), nullable=False, comment='User who initiated import'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_import_sessions_id'), 'import_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_import_sessions_created_at'), 'import_sessions', ['created_at'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_import_sessions_created_at'), table_name='import_sessions')
    op.drop_index(op.f('ix_import_sessions_id'), table_name='import_sessions')
    op.drop_table('import_sessions')
