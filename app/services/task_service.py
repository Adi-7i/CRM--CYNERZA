"""
Business logic for task management.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.task import Task, RelatedEntityType
from app.models.user import User, UserRole
from app.crud import task as task_crud
from app.crud import lead as lead_crud
from app.crud import customer as customer_crud
from app.crud import deal as deal_crud
from app.schemas.task import TaskCreate


def can_user_access_task(user: User, task: Task) -> bool:
    """
    Check if user can access a specific task.
    
    Rules:
    - Admin & Manager: Can access all tasks
    - Sales: Can only access own tasks
    
    Args:
        user: Current user
        task: Task to check access for
        
    Returns:
        bool: True if user can access task
    """
    # Admin and Manager can access all tasks
    if user.role in [UserRole.ADMIN, UserRole.MANAGER]:
        return True
    
    # Sales can only access tasks assigned to them
    if user.role == UserRole.SALES:
        return task.assigned_to_id == user.id
    
    return False


def can_user_modify_task(user: User, task: Task) -> bool:
    """
    Check if user can modify a specific task.
    
    Rules:
    - Admin & Manager: Can modify all tasks
    - Sales: Can only modify own tasks
    
    Args:
        user: Current user
        task: Task to check modification rights for
        
    Returns:
        bool: True if user can modify task
    """
    return can_user_access_task(user, task)


def can_user_delete_task(user: User) -> bool:
    """
    Check if user can delete tasks.
    
    Rules:
    - Admin & Manager: Can delete tasks
    - Sales: Cannot delete tasks
    
    Args:
        user: Current user
        
    Returns:
        bool: True if user can delete tasks
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER]


def can_user_assign_task(user: User) -> bool:
    """
    Check if user can assign tasks.
    
    Rules:
    - Admin & Manager: Can assign tasks
    - Sales: Cannot assign tasks
    
    Args:
        user: Current user
        
    Returns:
        bool: True if user can assign tasks
    """
    return user.role in [UserRole.ADMIN, UserRole.MANAGER]


def validate_task_assignee(db: Session, assigned_to_id: int) -> None:
    """
    Validate that the task assignee exists and is active.
    
    Args:
        db: Database session
        assigned_to_id: User ID to assign task to
        
    Raises:
        HTTPException: If user doesn't exist or is inactive
    """
    from app.crud import user as user_crud
    
    user = user_crud.get_user(db, user_id=assigned_to_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign task to inactive user"
        )


def validate_related_entity(db: Session, related_type: RelatedEntityType, related_id: int) -> None:
    """
    Validate that the related entity exists.
    
    Args:
        db: Database session
        related_type: Type of related entity
        related_id: ID of related entity
        
    Raises:
        HTTPException: If entity doesn't exist
    """
    if related_type == RelatedEntityType.LEAD:
        entity = lead_crud.get_lead(db, lead_id=related_id)
        entity_name = "Lead"
    elif related_type == RelatedEntityType.CUSTOMER:
        entity = customer_crud.get_customer(db, customer_id=related_id)
        entity_name = "Customer"
    elif related_type == RelatedEntityType.DEAL:
        entity = deal_crud.get_deal(db, deal_id=related_id)
        entity_name = "Deal"
    else:
        return
    
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_name} not found"
        )


def create_task_with_validation(
    db: Session,
    task: TaskCreate,
    current_user: User
) -> Task:
    """
    Create a task with business logic validation.
    
    Args:
        db: Database session
        task: Task creation data
        current_user: User creating the task
        
    Returns:
        Created Task object
        
    Raises:
        HTTPException: If validation fails
    """
    # Validate assignee
    validate_task_assignee(db, task.assigned_to_id)
    
    # Validate related entity if specified
    if task.related_type and task.related_id:
        validate_related_entity(db, task.related_type, task.related_id)
    elif (task.related_type and not task.related_id) or (not task.related_type and task.related_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both related_type and related_id must be provided together"
        )
    
    # Create task
    return task_crud.create_task(db, task, created_by_id=current_user.id)


def get_tasks_for_user(
    db: Session,
    user: User,
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    priority: str = None,
    related_type: str = None,
    related_id: int = None,
    search: str = None
):
    """
    Get tasks based on user permissions.
    
    Args:
        db: Database session
        user: Current user
        skip: Pagination skip
        limit: Pagination limit
        status: Filter by status
        priority: Filter by priority
        related_type: Filter by related entity type
        related_id: Filter by related entity ID
        search: Search term
        
    Returns:
        Tuple of (tasks, total)
    """
    # Auto-update overdue tasks
    task_crud.update_overdue_tasks(db)
    
    # Admin and Manager see all tasks
    if user.role in [UserRole.ADMIN, UserRole.MANAGER]:
        return task_crud.get_tasks(
            db,
            skip=skip,
            limit=limit,
            status=status,
            priority=priority,
            related_type=related_type,
            related_id=related_id,
            search=search
        )
    
    # Sales only see assigned tasks
    return task_crud.get_tasks(
        db,
        skip=skip,
        limit=limit,
        status=status,
        priority=priority,
        related_type=related_type,
        related_id=related_id,
        search=search,
        assigned_to_id=user.id
    )
