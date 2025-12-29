"""
Template Manager for reusable mapping templates.
Handles MappingTemplate CRUD operations.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.mapping_template import MappingTemplate
from app.models.user import User


class TemplateManager:
    """Manages MappingTemplate lifecycle."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_template(
        self,
        user: User,
        name: str,
        mappings: dict,
        merge_rules: list = None,
        ignored_columns: list = None,
        column_signature: str = None,
        description: str = None,
        is_default: bool = False
    ) -> MappingTemplate:
        """
        Create a new mapping template.
        
        Args:
            user: Creator
            name: Template name
            mappings: Column to field mappings
            merge_rules: Optional merge rules
            ignored_columns: Columns to skip
            column_signature: Hash for matching
            description: Optional description
            is_default: Auto-apply for matching columns
            
        Returns:
            Created MappingTemplate
        """
        template = MappingTemplate(
            name=name,
            description=description,
            created_by_id=user.id,
            is_default=is_default,
            mappings=mappings,
            merge_rules=merge_rules or [],
            ignored_columns=ignored_columns or [],
            column_signature=column_signature
        )
        
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        
        return template
    
    def get_template(self, template_id: int) -> MappingTemplate:
        """
        Get template by ID.
        
        Args:
            template_id: Template ID
            
        Returns:
            MappingTemplate
            
        Raises:
            HTTPException if not found
        """
        template = self.db.query(MappingTemplate).filter(
            MappingTemplate.id == template_id,
            MappingTemplate.is_active == True
        ).first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mapping template not found"
            )
        
        return template
    
    def get_all_templates(self, active_only: bool = True) -> List[MappingTemplate]:
        """
        Get all available templates.
        
        Args:
            active_only: Filter to active templates only
            
        Returns:
            List of MappingTemplates
        """
        query = self.db.query(MappingTemplate)
        
        if active_only:
            query = query.filter(MappingTemplate.is_active == True)
        
        return query.order_by(MappingTemplate.use_count.desc()).all()
    
    def find_matching_templates(
        self,
        column_signature: str
    ) -> List[MappingTemplate]:
        """
        Find templates that match a column signature.
        
        Args:
            column_signature: Hash of column names
            
        Returns:
            Matching templates
        """
        return self.db.query(MappingTemplate).filter(
            MappingTemplate.column_signature == column_signature,
            MappingTemplate.is_active == True
        ).order_by(MappingTemplate.use_count.desc()).all()
    
    def update_template(
        self,
        template_id: int,
        name: str = None,
        description: str = None,
        mappings: dict = None,
        merge_rules: list = None,
        ignored_columns: list = None,
        is_default: bool = None
    ) -> MappingTemplate:
        """
        Update an existing template.
        
        Args:
            template_id: Template ID
            name: New name
            description: New description
            mappings: Updated mappings
            merge_rules: Updated merge rules
            ignored_columns: Updated ignored columns
            is_default: Update default flag
            
        Returns:
            Updated MappingTemplate
        """
        template = self.get_template(template_id)
        
        if name is not None:
            template.name = name
        if description is not None:
            template.description = description
        if mappings is not None:
            template.mappings = mappings
        if merge_rules is not None:
            template.merge_rules = merge_rules
        if ignored_columns is not None:
            template.ignored_columns = ignored_columns
        if is_default is not None:
            template.is_default = is_default
        
        self.db.commit()
        self.db.refresh(template)
        
        return template
    
    def increment_use_count(self, template: MappingTemplate) -> None:
        """Increment template usage counter."""
        template.use_count += 1
        self.db.commit()
    
    def delete_template(self, template_id: int) -> None:
        """
        Soft delete a template (mark as inactive).
        
        Args:
            template_id: Template ID
        """
        template = self.get_template(template_id)
        template.is_active = False
        self.db.commit()
    
    def hard_delete_template(self, template_id: int) -> None:
        """
        Permanently delete a template.
        
        Args:
            template_id: Template ID
        """
        template = self.get_template(template_id)
        self.db.delete(template)
        self.db.commit()
